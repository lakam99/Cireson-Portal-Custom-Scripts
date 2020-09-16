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
                var value = customSettings.functionality.get_setting_value(setting.name);
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
            
                if (setting.toggleFunctions) {
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
                } else {
                    throw Error('Toggle functions not provided for '+setting.displayName+'.');
                }
            });
        },

        function() {
            //render setting on each page
            customSettings.settings.customSettings.forEach(function(setting) {
                if (customSettings.functionality.get_setting_value(setting.name)) {
                    setting.toggleFunctions.toggleOn.function();
                } else {
                    setting.toggleFunctions.toggleOff.function();
                }
            });
        }

    ],

    functionality: {

        get_setting_value: function(setting_name) {
            var settings = settings_controller.get_setting(setting_name);
            if (settings.value === undefined) {
                settings = {value: false};
                settings_controller.set_setting(setting_name, settings);
                return customSettings.functionality.get_setting_value(setting_name);
            } else {
                return settings.value;
            }
        },

        set_setting_value: function(setting_name, value) {
            settings_controller.set_setting(setting_name, {value: value});
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
                        $("#custom_settings_body").find(".row").append(setting.html);
                    });
        
                    //bind listeners
                    customSettings.settings.customSettings.forEach(function(setting){
                        $('#'+setting.name).on("click", function(){
                            if (!setting.ieCompatible && customSettings.functionality.isIE()) {
                                event.preventDefault();
                                //kendo.alert("This setting is not supported in Internet Explorer.");
                                return;
                            }
                            if ($('#'+setting.name)[0].checked) {
                                setting.toggleFunctions.toggleOn.function();
                            } else {
                                setting.toggleFunctions.toggleOff.function();
                            }
                            customSettings.functionality.set_setting_value(setting.name, $('#'+setting.name)[0].checked);
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
            $(document).ready(function(){
                customSettings.main.setup();
                if (window.location.pathname === "/Settings/User/UserProfile") {
                    customSettings.functionality.render();
                }
            });
        }
    }
}

customSettings.main.start();