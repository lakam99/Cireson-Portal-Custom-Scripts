//Written by Arkam Mazrui for the Cireson web portal
//arkam.mazrui@nserc-crsng.gc.ca
//arkam.mazrui@gmail.com

var customGlobalLoader = {
    files: window.location.origin + "/CustomData/customFiles/customFiles.json",
    version: 0,

    get_settings: function() {
        return JSON.parse(localStorage.getItem("settings"));
    },

    get_current_version: function() {
        if ((s = get_settings()) && s.scriptPatcher-data) {
            return s.scriptPatcher-data;
        } else {
            return 0;
        }
    },

    get_str_url: function(url) {
        return window.location.origin + url + "?v=" + customGlobalLoader.version;
    },

    get_random_int: function(max) {
        return Math.round(Math.random() * (max ? max:156000));
    },

    setup: [
        function() {
            customGlobalLoader.version = get_current_version();
        },

        function() {
            $.ajax({
                url: customGlobalLoader.files + customGlobalLoader.get_random_int(),
                async: false,
                dataType: "json",
                success: function(response) {
                    customGlobalLoader.files = response;
                }
            });
        }
    ],

    get_url: function(name) {
        if ((f = customGlobalLoader.files.files) && f["misc"]) {
            for (var i = 0, f = f["misc"].array; i < f.length; i++) {
                if (f[i].name == name)
                    return customGlobalLoader.append_version(f[i].url);
            }
        }
        throw Error("Could not locate url with name " + name + ".");
    },

    main: {
        load_file: function (file_obj, _async) {
            $("head").append(`<script id='${file_obj.name}'></script>`);
            var script = document.getElementById(file_obj.name);
            script.async = _async,
            script.type = "text/javascript",
            sript.src = customGlobalLoader.get_str_url(file.url);
        },

        load_files: function (file_array) {
            file_array.forEach(function (file) {
                customGlobalLoader.main.load_file(file, file_array.async);
            })
        },

        load_critical_files: function() {
            customGlobalLoader.main.load_files(customGlobalLoader.files.files.system_critical);
        },

        load_essential_files: function() {
            customGlobalLoader.main.load_files(customGlobalLoader.files.files.main_systems);
        },

        load_customspace: function (params) {
          customGlobalLoader.main.load_critical_files();
          customGlobalLoader.main.load_essential_files(); 
        },

        setup: function () {
            customGlobalLoader.setup.forEach(function(f){f()});
        },

        load_customspace: function() {
            customGlobalLoader.main.setup();
            customGlobalLoader.main.load_systems();
        }
    }
}

customGlobalLoader.main.load_customspace();
