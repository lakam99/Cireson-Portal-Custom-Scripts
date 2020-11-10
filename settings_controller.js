//Written by Arkam Mazrui for the Cireson web portal
//arkam.mazrui@nserc-crsng.gc.ca
//arkam.mazrui@gmail.com

var settings_controller = {
    key: "settings",

    get_storage_settings: function() {
        var r = localStorage.getItem(settings_controller.key);
        if (r === null) {
            var backup = sessionStorage.getItem("custom_settings");
            if (backup === null || !backup.length) 
                backup = JSON.stringify({});
            localStorage.setItem(settings_controller.key, backup);
            sessionStorage.removeItem("custom_settings");
            return settings_controller.get_storage_settings();
        } else {
            return r;
        }
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

    append_setting: function(setting_name, appendee) {
        var setting = settings_controller.get_setting(setting_name);
        if (!Array.isArray(setting)) {
            console.warn("Converting " + setting + " to [].");
            settings_controller.set_setting(setting_name, []);
            settings_controller.append_setting(setting_name, appendee);
        } else {
            setting.push(appendee);
            settings_controller.set_setting(setting_name, setting);
        }
    },

    de_append_setting: function(setting_name, index) {
        var setting = settings_controller.get_setting(setting_name);
        if (!Array.isArray(setting)) {
            throw Error("Cannot de-append from non-array setting.");
        } else {
            setting.splice(index, 1);
            settings_controller.set_setting(setting_name, setting);
        }
    },

    de_append_multiple: function(setting_name, index_arr) {
        if (!Array.isArray(index_arr)) {
            throw Error("Second parameter must be array of indexes.");
        } else {
            for (var i = index_arr.length - 1; i >= 0; i--) {
                settings_controller.de_append_setting(setting_name, i);
            }
        }
    },

    get_setting_value: function(setting_name) {
        var settings = settings_controller.get_setting(setting_name);
        if (settings.value === undefined) {
            settings = {value: false};
            settings_controller.set_setting(setting_name, settings);
            return settings_controller.get_setting_value(setting_name);
        } else {
            return settings.value;
        }
    },

    set_setting_value: function(setting_name, value) {
        settings_controller.set_setting(setting_name, {value: value});
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