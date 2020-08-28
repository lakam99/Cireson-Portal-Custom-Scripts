//Written by Arkam Mazrui for the Cireson web portal
//arkam.mazrui@nserc-crsng.gc.ca
//arkam.mazrui@gmail.com


function column(field_name, index, visible) {
    this.field_name = field_name;
    this.index = index;
    if (visible === undefined || visible === false) {visible = true;} else {visible = false;}
    this.visible = visible;
}

var gridSaver = {
    default: null,

    get_grid_columns: function() {
        return grid.columns;
    },

    get_column_objects: function() {
        var r = [];
        gridSaver.get_grid_columns().forEach(function(n, i) {
            r.push(new column(n.field, i, n.hidden));
        });
        return r;
    },

    init_default_state: function() {
        gridSaver.default = gridSaver.get_column_objects();
    },

    get_default_state: function() {
        if (!gridSaver.default) {
            gridSaver.init_default_state();
        }
        return gridSaver.default;
    },

    get_column_index: function(field_name) {
        var columns = gridSaver.get_grid_columns();
        for (var i = 0; i < columns.length; i++) {
            if (columns[i].field == field_name) {
                return i;
            }
        }
    },

    get_user_columns: function() {
        map_controller.get_column_states(dom_grid.id);
    },

    save_user_columns: function() {
        setTimeout(function() {map_controller.set_column_states(dom_grid.id, gridSaver.get_column_objects());}, 100);
    },

    reset_user_columns: function() {
        map_controller.wipe_column_states(dom_grid.id);
    },

    apply_user_columns: function() {
        //main
        var columns = map_controller.get_column_states(dom_grid.id);
        columns.forEach(function(n, i) {
            var reference = grid.columns[gridSaver.get_column_index(n.field_name)];
            grid.reorderColumn(n.index, reference);
            if (n.visible && reference.hidden === true) {
                grid.showColumn(reference);
            } else if (!n.visible && (reference.hidden === undefined || reference.hidden === false)) {
                grid.hideColumn(reference);
            }
        });
    },

    listeners: [
        function() {grid.bind("columnReorder", gridSaver.save_user_columns);},

        function() {grid.bind("columnShow", gridSaver.save_user_columns);},

        function() {grid.bind("columnHide", gridSaver.save_user_columns);}
    ],

    main: {
        existence_interval: null,

        activate_listeners: function() {
            gridSaver.listeners.forEach(function(n,i){n();});
        },

        start: function () {
            $(document).on("grid-ready", function() {
                if (grid && proper_grid_conditions()) {
                    gridSaver.init_default_state();
                    gridSaver.apply_user_columns();
                    gridSaver.main.activate_listeners();
                    clearInterval(gridSaver.main.existence_interval);
                }

            });
        }
    }
};

gridSaver.main.start();