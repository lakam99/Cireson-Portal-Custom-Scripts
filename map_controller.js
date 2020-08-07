//Written by Arkam Mazrui for the Cireson web portal
//arkam.mazrui@nserc-crsng.gc.ca
//arkam.mazrui@gmail.com

var heading_states = "heading_states";
var column_states = "column_states";

export var map_controller = {
    get_storage_map: function() {
        return sessionStorage.getItem("map");
    },

    set_storage_map: function(new_map) {
        sessionStorage.setItem("map", JSON.stringify(new_map));
    },

    reset_map: function() {
        sessionStorage.removeItem("map");
    },

    get_parsed_map: function() {
        return JSON.parse(map_controller.get_storage_map());
    },

    get_map: function(grid_id) {
        if (grid_id === undefined) {throw Error("grid_id cannot be undefined.");};
        var map = map_controller.get_parsed_map();
        if (!map) {
            map_controller.set_storage_map({});
            return map_controller.get_map(grid_id);
        } else {
            if (map[grid_id] == undefined) {
                map[grid_id] = {column_states: [], heading_states: []};
                map_controller.set_storage_map(map);
                return map_controller.get_map(grid_id);
            } else {
                return map[grid_id];
            }
        }
    },

    get_property: function(grid_id, property) {
        return map_controller.get_map(grid_id)[property];
    },

    set_property: function(grid_id, property, value) {
        get_map(grid_id);
        var m = map_controller.get_parsed_map();
        m[grid_id][property] = value;
        map_controller.set_storage_map(m);
    },

    get_heading_states: function(grid_id) {
        return map_controller.get_property(grid_id, heading_states);
    },

    set_heading_states: function(grid_id, value) {
        map_controller.set_property(grid_id, heading_states, value);
    },

    get_column_states: function(grid_id) {
        return map_controller.get_property(grid_id, column_states);
    },

    set_column_states: function(grid_id, value) {
        return map_controller.set_property(grid_id, column_states, value);
    },

    wipe_property: function(grid_id, property, wipe_val) {
        if (wipe_val===null){wipe_val=[];}
        map_controller.set_property(grid_id, property, wipe_val);
    },

    delete_heading_states: function(grid_id) {
        var m = map_controller.get_parsed_map();
        delete m[grid_id];
        map_controller.set_storage_map(m);
    },

    wipe_heading_states: function(grid_id) {
        map_controller.wipe_property(grid_id, heading_states);
    },

    wipe_column_states: function(grid_id) {
        map_controller.wipe_property(grid_id, column_states);
    }
};