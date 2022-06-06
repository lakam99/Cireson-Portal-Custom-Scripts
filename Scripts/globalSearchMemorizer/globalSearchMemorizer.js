//Written by Arkam Mazrui for the Cireson web portal
//arkam.mazrui@nserc-crsng.gc.ca
//arkam.mazrui@gmail.com

var globalSearchMemorizer = {
    s_name: "globalSearchMemorizer",
    settings: {},
    setup: [
        function() {
            $(document).on("globalSearchMemorizerReady", function(){
                var exist = setInterval(function(){
                    var map = globalSearchMemorizer.get_checked_settings();
                    var nodes = globalSearchMemorizer.get_nodes();
                    if (nodes.length) {
                        clearInterval(exist);
                        if (nodes.length != map.length) {
                            //live nodes have been changed since last stored
                            map = globalSearchMemorizer.update_checked();
                        }
                        globalSearchMemorizer.process_nodes(map);
                        globalSearchMemorizer.listen_nodes();
                    }
                }, 100);
            });
        },

        function() {
            var exist = setInterval(function(){
                if (settings_controller) {
                    clearInterval(exist);
                    var s = settings_controller.get_setting(globalSearchMemorizer.s_name);
                    if (!s.initialized) {
                        s = {checked:[], initialized: true};
                        settings_controller.set_setting(globalSearchMemorizer.s_name, s);
                    }
                    globalSearchMemorizer.set_settings(s);
                    $(document).trigger("globalSearchMemorizerReady");

                }
            }, 100);
        }
    ],

    get_nodes: function() {
        return $(".gs-switch");
    },

    listen_nodes: function() {
        var nodes = globalSearchMemorizer.get_nodes();
        $(nodes).off("click");
        $(nodes).on("click", function(){
            setTimeout(function(){
                globalSearchMemorizer.update_checked();
                globalSearchMemorizer.listen_nodes();
            }, 100);
        });
    },

    process_nodes: function(map) {
        var nodes = globalSearchMemorizer.get_nodes();
        var c = null;
        for (var i = 0; i < nodes.length; i++) {
            if (!document.body.contains(nodes[i])) {
                nodes = globalSearchMemorizer.get_nodes(); //nodes have changed
            }
            c = c = !!$(nodes[i]).has("input:checked").length;
            if (map[i] != c) {
                $(nodes[i]).click();
            }
        }
        
    },

    set_settings: function(settings) {
        globalSearchMemorizer.settings = settings;
    },

    update_checked: function() {
        var nodes = globalSearchMemorizer.get_nodes();
        var map = nodes.toArray().map(function(n){
            return !!$(n).has("input:checked").length;
        });
        var s = globalSearchMemorizer.get_settings();
        s.checked = map;
        globalSearchMemorizer.update_settings(s);
        return globalSearchMemorizer.get_checked_settings();
    },

    update_settings: function(new_settings) {
        globalSearchMemorizer.set_settings(new_settings);
        settings_controller.set_setting(globalSearchMemorizer.s_name, new_settings);
    },

    get_settings: function() {
        return globalSearchMemorizer.settings;
    },

    get_checked_settings: function() {
        return globalSearchMemorizer.get_settings().checked;
    },

    add_checked_index: function(index) {
        globalSearchMemorizer.settings.push(index);
    },

    remove_checked_index: function(index) {
        globalSearchMemorizer.settings.s
    },

    main: {
        setup: function() {
            globalSearchMemorizer.setup.forEach(function(f){f()});
        },

        start: function() {
            globalSearchMemorizer.main.setup();
        }
    }
}

globalSearchMemorizer.main.start();