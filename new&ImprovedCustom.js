//Written by Arkam Mazrui for the Cireson web portal
//arkam.mazrui@nserc-crsng.gc.ca
//arkam.mazrui@gmail.com

var customGlobalLoader = {
    files: "/CustomSpace/CustomData/customFiles/customFiles.json",
    version: 0,
    ticket: undefined,

    get_settings: function() {
        var r = JSON.parse(localStorage.getItem("settings"));
        if (!r) {
            localStorage.setItem('settings', '{}');
            return customGlobalLoader.get_settings();
        }
        return r;
    },

    get_current_version: function() {
        if ((s = customGlobalLoader.get_settings()) && s["scriptPatcher-data"]) {
            return s["scriptPatcher-data"].data.version;
        } else {
            return customGlobalLoader.get_random_int(1000);
        }
    },

    get_str_url: function(url) {
        return window.location.origin + url + "?v=" + customGlobalLoader.get_current_version();
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
        },

        function() {
            $.ajax({
                url: customGlobalLoader.get_url("userGroups-Config"),
                async: false,
                dataType: "json",
                success: function(res) {
                    formTasks.permissions = res;
                }
            })
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
            return new Promise((resolve,reject)=>{
                if (file_obj.condition && !eval(file_obj.condition))
                    resolve(false);
                
                var script = document.createElement("script");
                script.async = "async";
                script.type = file_obj.type ? file_obj.type:"text/javascript";
                script.src = customGlobalLoader.get_str_url(file_obj.url);
                script.onload = script.onreadystatechange = (_, isAbort) => {
                    if (!script.readyState || /loaded|complete/.test(script.readyState)) {
                        if (isAbort) reject();
                        else {
                            resolve();
                            console.log("Loaded " + script.src);
                        }
                    }
                };
                script.onerror = () => {console.error("FAILED TO LOAD " +file_obj.url);console.log(result); reject(); };
                document.getElementsByTagName('head')[0].appendChild(script);
            });
        },

        load_files: function (files) {
            return files.array.map(function (file) {
                return customGlobalLoader.main.load_file(file, files.async);
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
            customGlobalLoader.main.load_user_group(function(){return session.user.Id}, 
            function(res) {
                var s = customGlobalLoader.get_settings();
                s.user_groups = res;
                localStorage.setItem("settings", JSON.stringify(s));
                session.user.user_groups = customGlobalLoader.get_settings().user_groups;
                customGlobalLoader.main.setup();
                customGlobalLoader.main.load_systems();
            });
            app.custom.formTasks.add(formTasks.type.srq, null, (f,v)=>customGlobalLoader.ticket = v);
            app.custom.formTasks.add(formTasks.type.inc, null, (f,v)=>customGlobalLoader.ticket = v);
        },
        
        load_darkmode: function() {
            var s = customGlobalLoader.get_settings();
            if (s && s.darkMode && s.darkMode.value) {
                var link = customGlobalLoader.get_str_url("/CustomSpace/CustomSettings/darkMode/darkMode.css");
                $("head").before('<link type="text/css" rel="stylesheet"' +
                'id="dark-mode-general-link" href="'+link+'">');
            }
        },

        load_user_group: function(id, callback) {
            customGlobalLoader.main.when_session_available(function(){
                $.ajax({
                    url: window.location.origin + "/api/V3/User/GetUsersSupportGroupEnumerations",
                    data: {Id: id},
                    dataType: "json",
                    async: false,
                    success: callback
                });
            });
        },

        when_session_available: function(callback) {
            var sw8 = setInterval(function(){
                try {
                    if (session != undefined && session.user != undefined) {
                        callback();
                        clearInterval(sw8);
                    }
                } catch (e) {
                    console.warn(e);
                }
            }, 1000);
        }
    }
}

var formTasks = {
    type: {
        srq: "ServiceRequest",
        inc: "Incident",
        both: "Both"
    },
    
    permissions: null,

    user_has_permissions: function(permissions_array) {
        if (permissions_array === null)
            return true;
        if (Array.isArray(permissions_array)) {
            res = permissions_array.map(function(permission){
                return formTasks.user_has_permission(permission);
            });
            return res.some(function(value) {return value == true});
        } else {
            return formTasks.user_has_permission(permissions_array);
        }
    },

    user_has_permission: function(permission) {
        var groups = session.user.user_groups;
        if (!groups) {return false;}
        for (var i = 0, group = groups[i]; i < groups.length; i++, group = groups[i]) {
            if (group.Name.includes(permission)) {
                return true;
            }
        }
        return false;
    },

    addFormTask: function (type, title, permission, callback) {
        if (formTasks.user_has_permissions(permission)) {
            if (type == formTasks.type.srq || type == formTasks.type.inc) {
                consistentFormTasks.add(type, title, callback);
            } else if (type == formTasks.type.both) {
                consistentFormTasks.add(formTasks.type.srq, title, callback);
                consistentFormTasks.add(formTasks.type.inc, title, callback);
            }
        }
    }
}



customGlobalLoader.main.load_customspace();