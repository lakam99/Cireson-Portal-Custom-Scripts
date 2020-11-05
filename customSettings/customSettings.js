//Written by Arkam Mazrui for the Cireson web portal
//arkam.mazrui@nserc-crsng.gc.ca
//arkam.mazrui@gmail.com

var customSettings = {
    properties: {
        html: "/CustomSpace/Templates/customSettings/customSettings.html"
    },

    settings: "/CustomSpace/CustomSettings/customSettingsConfig.json",

    helperFunctions: {},

    setup: [
        function() {
            $.ajax({
                url: customSettings.properties.html,
                dataType: "text",
                async: false,
                success: function(result) {
                    customSettings.properties.html = result;
                }
            });
        },

        function() {
            $.ajax({
                url: customSettings.settings,
                dataType: "json",
                async: false,
                success: function(result) {
                    customSettings.settings = result;
                    customSettings.settings.getSetting = function(name){
                        var s = customSettings.settings.customSettings;
                        for (var i = 0; i < s.length; i++) {
                            if (s[i].name === name) {
                                return s[i];
                            }
                        }
                        throw Error("Cannot find setting "+name+".");
                    };
                }
            });
        },

        function() {
            customSettings.settings.customSettings.forEach(function(setting){
                if (setting.render || setting.render === undefined) {
                    var value = setting.value ? setting.value:settings_controller.get_setting_value(setting.name);
                    if (value) {value = 'checked'} else {value = ''}
                    setting.html = '<div class="'+setting.size+'"><div class="form-group">'+
                    '<label class="control-label" for="'+setting.name+'_container">'+setting.displayName+'</label>'+
                            '<div class="container custom-setting-container" name="'+setting.name+'_container">'+
                                '<label class="switch" for="'+setting.name+'">'+
                                    '<input type="checkbox" id="'+setting.name+'" '+value+'/>'+
                                    '<div class="slider round"></div>'+
                                '</label>'+
                            '</div>'+
                        '</div>'+
                    '</div>';
                }
            
                if (setting.toggleFunctions !== undefined) {
                    $.ajax({
                        url: setting.toggleFunctions.functionsLocation,
                        dataType: "text",
                        async: false,
                        success: function(result) {
                            eval(result + ";setting.toggleFunctions.toggleOn.function = "+
                            "eval(setting.toggleFunctions.toggleOn.functionName);"+
                            "setting.toggleFunctions.toggleOff.function = "+
                            "eval(setting.toggleFunctions.toggleOff.functionName)");
                        }
                    });
                }
            });
        },

        function() {
            //render setting on each page
            customSettings.settings.customSettings.forEach(function(setting) {
                if (setting.toggleFunctions !== undefined) {
                    if ((setting.value!==undefined?setting.value:settings_controller.get_setting_value(setting.name))) {
                        setting.toggleFunctions.toggleOn.function();
                    } else {
                        setting.toggleFunctions.toggleOff.function();
                    }
                }
            });
        },

        function() {
            //backup current settings
            customSettings.functionality.backup_storage();
        }

    ],

    functionality: {

        backup_storage: function() {
            sessionStorage.setItem("custom_settings", settings_controller.get_storage_settings());

        },
        
        isIE: function() {
            ua = navigator.userAgent;
            //https://jsfiddle.net/alvaroAV/svvz7tkn/
            return ua.indexOf("MSIE ") > -1 || ua.indexOf("Trident/") > -1;
        },

        render: function() {
            var yyy = setInterval(function(){
                var body = $($(".tab-pane.active").children()[0]);
                if (body.length) {
                    clearInterval(yyy);
                    body.before(customSettings.properties.html);
                    customSettings.settings.customSettings.forEach(function(setting){
                        if (setting.html !== undefined) {
                            $("#custom_settings_body").find(".row").append(setting.html);
                        }
                    });
        
                    //bind listeners
                    customSettings.settings.customSettings.forEach(function(setting){
                        $('#'+setting.name).on("click", function(){
                            if (!setting.ieCompatible && customSettings.functionality.isIE()) {
                                event.preventDefault();
                                //kendo.alert("This setting is not supported in Internet Explorer.");
                                return;
                            }

                            if (setting.toggleFunctions !== undefined) {
                                if ($('#'+setting.name)[0].checked) {
                                    setting.toggleFunctions.toggleOn.function();
                                } else {
                                    setting.toggleFunctions.toggleOff.function();
                                }
                            }
                            settings_controller.set_setting_value(setting.name, $('#'+setting.name)[0].checked);
                            customSettings.functionality.backup_storage();
                        });
                    });
                }
            }, 100);
        }
    },
    
    main: {
        setup: function() {
            customSettings.setup.forEach(function(f){f()});
        },

        start: function() {
            customSettings.main.setup();
            $(document).ready(function(){
                if (window.location.pathname.includes("/Settings/User/UserProfile")) {
                    customSettings.functionality.render();
                }
            });
        }
    }
}

customSettings.main.start();