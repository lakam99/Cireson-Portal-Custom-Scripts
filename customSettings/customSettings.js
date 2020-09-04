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
                        throw Error(`Cannot find setting ${name}.`);
                    };
                }
            });
        },

        function() {
            customSettings.settings.customSettings.forEach(function(setting){
                setting.html = `
                <div class="${setting.size}">
                    <div class="form-group">
                        <label class="control-label" for="${setting.name}_container">${setting.displayName}</label>
                        <div class="container custom-setting-container" name="${setting.name}_container">
                            <label class="switch" for="${setting.name}">
                                <input type="checkbox" id="${setting.name}" />
                                <div class="slider round"></div>
                            </label>
                        </div>
                    </div>
                </div>`;
            
                if (setting.toggleFunctions) {
                    $.ajax({
                        url: setting.toggleFunctions.functionsLocation,
                        dataType: "text",
                        async: false,
                        success: function(result) {
                            eval(result);
                            eval(`setting.toggleFunctions.toggleOn.function =
                             eval(setting.toggleFunctions.toggleOn.functionName);
                             setting.toggleFunctions.toggleOff.function = 
                             eval(setting.toggleFunctions.toggleOff.functionName)`);
                        }
                    });
                } else {
                    throw Error(`Toggle functions not provided for ${setting.displayName}.`);
                }
            });
        }

    ],

    functionality: {
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
                        $(`#${setting.name}`).on("click", function(){
                            if ($(`#${setting.name}`)[0].checked) {
                                setting.toggleFunctions.toggleOn.function();
                            } else {
                                setting.toggleFunctions.toggleOff.function();
                            }
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