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
        }
    },

    buttons: [
        function() {
            return "<a class='k-button pull-left btn btn-default btn-remove-one'>Remove from Watchlist</a>";
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
            watchListControl.buttons.forEach(function(btn){
                watchListControl.properties.watch_list_controls().append(btn());
            });
        }
    ],

    main: {
        setup: function() {
            watchListControl.setup.forEach(function(f){f()});
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