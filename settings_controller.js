//Written by Arkam Mazrui for the Cireson web portal
//arkam.mazrui@nserc-crsng.gc.ca
//arkam.mazrui@gmail.com

var settings_controller = {
    key: "settings",

    get_storage_settings: function() {
        return localStorage.getItem(settings_controller.key);
    },

    set_storage_settings: function(new_settings) {
        localStorage.setItem(settings_controller.key, JSON.stringify(new_settings));
    },

    reset_settings: function() {
        localStorage.removeItem(settings_controller.key);
    },

    get_parsed_settings: function() {
        return JSON.parse(settings_controller.get_storage_settings());
    },

    set_setting: function(setting_name, value) {
        var settings = settings_controller.get_parsed_settings();
        settings[setting_name] = value;
        settings_controller.set_storage_settings(settings);
    },

    get_setting: function(setting_name) {
        var settings = settings_controller.get_parsed_settings();
        if (settings[setting_name] === undefined) {
            settings_controller.set_setting(setting_name, {});
            return settings_controller.get_setting(setting_name);
        } else {
            return settings[setting_name];
        }
    },

    setup: [
        function () {
            if (!settings_controller.get_parsed_settings()) {
                settings_controller.set_storage_settings({});
            }
        }
    ],

    main: {
        start: function() {
            settings_controller.setup.forEach(function(f){f()});
        }
    }
}

settings_controller.main.start();