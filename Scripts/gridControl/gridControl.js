﻿//Written by Arkam Mazrui for the Cireson web portal
//arkam.mazrui@nserc-crsng.gc.ca
//arkam.mazrui@gmail.com

var grid = null;
var dom_grid = null;
var reset_btn = null;
var watch_list_page = false;
var icon_listener_state = false;
var btns_added = false;
var wait = null;
var id_resize = null;
var id_percentage = 5;
var title_percentage = 20;

$(document).ready(function() {
    wait = setInterval(start, 800);


    $(document).on("grid-ready", function(){
        collapse_collected();
        if (!btns_added) {
        grid.bind("dataBound", start);
        grid.bind("dataBound", collapse_collected);
        grid.bind("group", respond_to_grouping);
        }
    });  
});

function proper_grid_conditions() {
    return ($(".k-grouping-header")[0] || $("div.clearfix.ng-scope")[0]);
}

function start() {
    dom_grid = $("div.grid-container[data-role='grid']")[0] || $('div[adf-grid-state-id]')[0];
    if (dom_grid && proper_grid_conditions()) {
        if (dom_grid.id === "") {
            dom_grid.id = "watch_list";
        }

        grid = $(dom_grid).data("kendoGrid");
        $(document).trigger("grid-ready");
        clearInterval(wait);

        if (dom_grid.id !== "watch_list") {
            resize_columns();
            //id_resize = setInterval(resize_columns, 100);
        } else {
            return;
        }
        
        add_grid_btns();
        start_icon_listener();
        bind_sort();
    }
}

function get_visible_columns() {
    var r = [];
    grid.columns.forEach(function(c){
        if (!c.hidden) {
            r.push(c);
        }
    });
    return r;
}


var sizing_tools = {
    
    int_fontsize: function(element) {
        return Number($(element).css("font-size").split("px")[0]);
    },

    element_em: function(element) {
        var fsize = sizing_tools.int_fontsize(element);
        var numtext = $(element).text().length;
        return numtext * Math.round(fsize * 0.0625);
    },

    element_px: function(element) {
        return sizing_tools.element_em(element)/0.0625;
    }

}

function bind_sort() {
    grid.bind("sort", async function(event){
        await (new Promise(function(resolve){
            if (event.sort.field == "Id") {
                grid.dataSource.sort([{field: "NumericId", dir: event.sort.dir}]);
            }
        }));
    });
}

function resize_columns() {
    var column = null;
    for (var i = 0; grid.columns.length; i++) {
        if (grid.columns[i].field == "Id") {
            column = grid.columns[i];
            break;
        }
    }

    var ex_element = $("td[data-field='Id']")[0];
    if (ex_element) {
        grid.resizeColumn(column, sizing_tools.element_px(ex_element));
    }
}

function add_grid_btns() {
    if (!btns_added) {
        reset_btn = $(".btn-clear-grid-filters");
        if (!reset_btn[0]) {
            reset_btn = $(".margin-t10.btn");
            reset_btn.removeClass(".margin-t10").css("margin", "0px 10px 0px 10px");
        }
        reset_btn.after("<a class='k-button pull-right btn btn-default btn-expand-all'>"
         + (localization["expand_all"] === undefined ? "Expand All":localization["expand_all"]) + "</a>");
        reset_btn.after("<a class='k-button pull-right btn btn-default btn-collapse-all'>" 
        + (localization["collapse_all"] === undefined ? "Collapse All":localization["collapse_all"]) + "</a>");
        btns_added = true;
    }
}

function respond_to_grouping() {
    if (dom_grid.id === "watch_list") {return;}
    var g_l = 0;
    if (grid._groupRows !== undefined) {
        g_l = grid._groupRows.length;
    }
    var wait = setInterval(function() {
        if (grid._groupRows !== undefined) {
            if (grid._groupRows.length != g_l) {
                refill_map();
                clearInterval(wait);
            }
        }
    },1);
}

function refill_map() {
    map_wipe();
    collapse_all();
}

function expand_then_collapse() {
    expand_all();
    collapse_all();
}

function expand_all() {
    if (grid_active()) {
        map_wipe();
        Object.keys(grid_map()).forEach(function(n, i) {
            grid.expandGroup(grid_map()[n]);
        });
    }
}

function collapse_all() {
    if (grid_active()) {
        map_fill();
        collapse_collected();
    }
}

function start_expand_listener() {
    $(".btn-expand-all").on("click", function() {
       expand_all();
    });
}

function start_collapse_listener() {
    $(".btn-collapse-all").on("click", function() {
        collapse_all();
    });
}

function stop_expand_listener() {
    $(".btn-expand-all").off("click");
}

function stop_collapse_listener() {
    $(".btn-collapse-all").off("click");
}

function start_reset_btn_listener() {
    reset_btn.on("click", function(event) {
        event.preventDefault();
        var map = JSON.parse(sessionStorage.getItem("map"));
        map_controller.delete_heading_states(dom_grid.id);
        app.storage.gridStates.remove('state_' + dom_grid.id);
        document.location.reload(false);
    });
}

function stop_reset_btn_listener() {
    $(".btn-clear-grid-filters").off("click");
}

function start_button_listeners() {
    start_reset_btn_listener();
    start_expand_listener();
    start_collapse_listener();
}

function start_icon_listener() {
    stop_icon_listener();
    icon_listener_state = true;
    $("a.k-icon").on("click", function (event) {
        var name = $(event.target).parent().text();
        console.log(name + " -> map");
        map_entry(event.target);
    });
    start_button_listeners();
;}

function stop_icon_listener() {
    icon_listener_state = false;
    $("a.k-icon").off("click");
    stop_reset_btn_listener();
    stop_expand_listener();
    stop_collapse_listener();
}

function get_map() { 
    return map_controller.get_heading_states(dom_grid.id);
}

function set_map_grid(arg) {
    map_controller.set_heading_states(dom_grid.id, arg);
}

function grid_active() {
    return $(".k-grouping-header")[0].childNodes[0].nodeType != 3;
}

function entry_index(entry) {
    if (!ie_includes(get_icons(), entry)) {throw Error(entry + " is an invalid entry.");}
    var icons = get_icons();
    for (i = 0; i < icons.length; i++) {
        if (entry === icons[i]) {
            return i.toString();
        }
    }
    throw Error("Entry found but entry not found.");
}

function map_entry(entry) {
    var map = get_map();
    if (map.length && ie_includes(get_icons(), entry)) {
        map.splice(map.indexOf(entry_index(entry)), 1);
    } else {
        map.push(entry_index(entry));
    }
    set_map_grid(map);
}

function map_wipe() {
   map_controller.wipe_heading_states(dom_grid.id);
}

function map_fill() {
    //add all page headers to map
    set_map_grid(Object.keys(get_icons()));
}

function collapse_collected() {
    var map = get_map();
    if (map === undefined) {
        //kendo.alert('An error has occured with the grid settings.'+
        //'Apologies for the inconvenience but all grids will be reset.');
        map_controller.reset_map();
        return collapse_collected();
    }
    map.forEach(function(n, i){
        grid.collapseGroup(grid_map()[n]);
    });
}

function get_icons() {
    return $(dom_grid).find("a.k-icon").toArray();
}

function grid_map() {
    var grid_map = {};
    get_icons().forEach(function(item, index) {
        grid_map[index.toString()] = $(item).parent().parent().parent();;
    });
    return grid_map;
}

function ie_includes(obj, search) {
    return obj.indexOf(search) != -1;
}