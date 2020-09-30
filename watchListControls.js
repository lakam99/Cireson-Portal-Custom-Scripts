//Written by Arkam Mazrui for the Cireson web portal
//arkam.mazrui@nserc-crsng.gc.ca
//arkam.mazrui@gmail.com

var watchListControl = {

    properties: {
        watch_list_page: function() {
            return dom_grid && dom_grid.id === "watch_list";
        },

        watch_list_controls: function() {
            return $("#watch_list_controls");
        },

        watch_list_btn_template: function() {
            return "<div id='watch_list_controls' class='pull-left'></div>";
        },

        get_grid_body: function() {
            return $(grid.element).find("tbody");
        },

        get_selected: function() {
            return this.get_grid_body().find(".k-state-selected").toArray();
        },

        get_grid_data: function() {
            return grid.dataSource._pristineData;
        },

        get_row_uid: function(element) {
            return $(element).attr("data-uid");
        },

        get_workitem_id_from_uid: function(uid) {
            var data = this.get_grid_data();
            for (var i = 0; i < data.length; i++) {
                if (data[i].uid === uid) {
                    return data[i].BaseId;
                }
            }
            throw Error("No item found for uid " + uid);
        },

        get_selected_workitem_ids: function() {
            var r = [];
            var uid = null;
            this.get_selected().forEach(function(row){
                uid = watchListControl.properties.get_row_uid(row);
                r.push(watchListControl.properties.get_workitem_id_from_uid(uid));
            });
            return r;
        },

        get_all_workitem_ids: function() {
            var r = [];
            this.get_grid_data().forEach(function(data){
                r.push(data.BaseId);
            });
            return r;
        },

        mousedown: false,

        btns_added: false
    },

    buttons: [
        function() {
            return "<a class='k-button pull-left btn btn-default btn-remove-selected'>Remove Selected</a>";
        },

        function() {
            return "<a class='k-button pull-left btn btn-default btn-remove-all'>Remove all</a>";
        }
    ],

    setup: [
        function() {
            //add template
            $("div[class='pull-right']").before(watchListControl.properties.watch_list_btn_template());
        },

        function() {
            //add btns
            if (!watchListControl.properties.btns_added) {
                watchListControl.buttons.forEach(function(btn){
                    watchListControl.properties.watch_list_controls().append(btn());
                });
                watchListControl.properties.btns_added = true;
            }
 
        },

        function() {
            //disable default grid selection behaviour
            var grid_options = grid.getOptions();
            grid_options.selectable = false;
            grid.setOptions(grid_options);
            grid.dataSource.read();
        },

        function() {
            watchListControl.properties.get_grid_body().find("tr").toArray().forEach(function(e){
                e.selected_this_turn = false;
            });
        },

        function() {
            watchListControl.properties.get_grid_body().on("mousedown touchstart", function(e) {
                e.preventDefault();
                watchListControl.properties.mousedown = true;
            });

            $(document).on("mouseup", function(e){
                watchListControl.properties.mousedown = false;
                watchListControl.setup[3]();
            });

            watchListControl.properties.get_grid_body().on("mousemove touchmove", "tr", function(e){
                if (watchListControl.properties.mousedown && !this.selected_this_turn) {
                    e.preventDefault();
                    watchListControl.functionality.toggle_selected_state($(this));
                    this.selected_this_turn = true;
                }
            });
        }
    ],

    btn_listeners: [
        function() {
            $(".btn-remove-selected").on("click", function(){
                watchListControl.properties.get_selected_workitem_ids().forEach(function(id){
                    watchListControl.functionality.request_delete_workitem(id);
                });
            });
        },

        function() {
            $(".btn-remove-all").on("click", function(){
                watchListControl.properties.get_all_workitem_ids().forEach(function(id){
                    watchListControl.functionality.request_delete_workitem(id);
                });
            });
        }
    ],

    functionality: {
        bind_refresh: function() {
            $(".fa-refresh").on("click", function() {
                watchListControl.properties.btns_added = false;
                var xxx = setInterval(function(){
                    if (!watchListControl.properties.watch_list_controls().length) {
                        watchListControl.setup[0]();
                        watchListControl.setup[1]();
                        start();
                        watchListControl.main.bind_btn_listeners();
                        clearInterval(xxx);
                    }
                }, 100);
            });
        },

        toggle_selected_state: function(element) {
            if (element.hasClass('k-state-selected')) {
                element.removeClass('k-state-selected');
            } else {
                element.addClass('k-state-selected');
            }
        },

        request_delete_workitem: function(workitem_id) {
            var req = {workitemId: workitem_id, userId: session.user.Id};
            var r = ClientRequestManager.send_request("delete", window.location.origin + "/api/V3/WorkItem/DeleteFromWatchlist",
            req, false).then(function(){watchListControl.functionality.refresh_grid()});
        },

        refresh_grid: function() {
            $(".fa-refresh").click();
        }
    },

    main: {
        bind_btn_listeners: function() {
            watchListControl.btn_listeners.forEach(function(listener_bind){listener_bind()});
        },

        setup: function() {
            watchListControl.setup.forEach(function(f){f()});
            watchListControl.main.bind_btn_listeners();
            watchListControl.functionality.bind_refresh();
        },

        start: function() {
            $(document).on("grid-ready", function(){
                if (watchListControl.properties.watch_list_page()) {
                    watchListControl.main.setup();
                }
            });
        }
    }
}

watchListControl.main.start();