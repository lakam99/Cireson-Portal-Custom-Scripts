//Written by Arkam Mazrui for the Cireson web portal
//arkam.mazrui@nserc-crsng.gc.ca
//arkam.mazrui@gmail.com

var customGlobalLoader = {
    files: "/CustomSpace/CustomData/customFiles/customFiles.json",
    version: 0,

    get_settings: function() {
        return JSON.parse(localStorage.getItem("settings"));
    },

    get_current_version: function() {
        if ((s = customGlobalLoader.get_settings()) && s["scriptPatcher-data"]) {
            return s["scriptPatcher-data"].data.version;
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
            customGlobalLoader.version = customGlobalLoader.get_current_version();
        },

        function() {
            $.ajax({
                url: customGlobalLoader.files + "?v=" + customGlobalLoader.get_random_int(),
                async: false,
                dataType: "json",
                success: function(response) {
                    customGlobalLoader.files = response;
                }
            });
        }
    ],

    get_url: function(name) {
        if ((f = customGlobalLoader.files) && f["misc"]) {
            for (var i = 0, f = f["misc"].array; i < f.length; i++) {
                if (f[i].name == name)
                    return customGlobalLoader.get_str_url(f[i].url);
            }
        }
        throw Error("Could not locate url with name " + name + ".");
    },

    main: {
        load_file: function (file_obj) {
            var result = $.Deferred(),
            script = document.createElement("script");
            script.async = "async";
            script.type = "text/javascript";
            script.src = customGlobalLoader.get_str_url(file_obj.url);
            script.onload = script.onreadystatechange = function(_, isAbort) {
                if (!script.readyState || /loaded|complete/.test(script.readyState)) {
                    if (isAbort)
                        result.reject();
                    else
                        result.resolve();
                }
            };
            script.onerror = function () {console.err("FAILED TO LOAD " +file_obj.url);console.log(result); result.reject(); };
            $("head")[0].appendChild(script);
            console.log("Loaded " + file_obj.url);
            return result.promise();
        },

        load_files: function (files) {
            files.array.forEach(function (file) {
                customGlobalLoader.main.load_file(file, files.async);
            })
        },

        load_critical_files: function() {
            return new Promise(async function(resolve,reject){
                for (var i = 0, s = customGlobalLoader.files.system_critical.array; i < s.length; i++) {
                    await customGlobalLoader.main.load_file(s[i]);
                }
                resolve(true);
            });
        },

        load_essential_files: function() {
            customGlobalLoader.main.load_files(customGlobalLoader.files.main_systems);
        },

        load_systems: function (params) {
          customGlobalLoader.main.load_critical_files().then(function(){
              customGlobalLoader.main.load_essential_files(); 
          });
        },

        setup: function () {
            customGlobalLoader.setup.forEach(function(f){f()});
        },

        load_customspace: function() {
            customGlobalLoader.main.load_darkmode();
            customGlobalLoader.main.setup();
            customGlobalLoader.main.load_systems();
        },
        
        load_darkmode: function() {
            var s = customGlobalLoader.get_settings();
            if (s && s.darkMode && s.darkMode.value) {
                var link = window.location.origin + "/CustomSpace/CustomSettings/darkMode/darkMode.css";
                $("head").before('<link type="text/css" rel="stylesheet"' +
                'id="dark-mode-general-link" href="'+link+'">');
            }
        }
    }
}

customGlobalLoader.main.load_customspace();
