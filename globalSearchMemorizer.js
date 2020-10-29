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
                    var nodes = $(".gs-switch");
                    if (nodes.length) {
                        clearInterval(exist);
                        if (nodes.length != map.length) {
                            //live nodes have been changed since last stored
                            map = globalSearchMemorizer.update_checked(nodes);
                        }
                        for (var i = 0; i < nodes.length; i++) {
                            globalSearchMemorizer.process_node(nodes[i], map[i]);
                        }
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

    listen_nodes: function() {
        var nodes = $(".gs-switch");
        $(nodes).toArray().forEach(function(node){$(node).on("click", function(){
            setTimeout(function(){
                globalSearchMemorizer.update_checked(nodes);
            }, 100);
        })});
    },

    process_node: function(node, map_value) {
        var c = !!$(node).has("input:checked").length;
        if (map_value != c) {
            $(node).click();
        }
    },

    set_settings: function(settings) {
        globalSearchMemorizer.settings = settings;
    },

    update_checked: function(nodes) {
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