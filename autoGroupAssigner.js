import {waiter} from './apiCaller.js';

var autoGroupAssigner = {
    get_userPicker_obj: function() {return $("[name='AssignedWorkItem']");},
    get_kendo_obj: function() {return autoGroupAssigner.get_userPicker_obj().data("kendoAutoComplete");},
    get_assignedUser_id: function() {return autoGroupAssigner.get_kendo_obj().dataSource._data[0].Id},
    get_user_groups: function(id) {
        waiter.request("get", "http://ottansm2/api/V3/User/GetUsersSupportGroupEnumerations", {Id: id});
        //waiter.await_request_return();
        return JSON.parse(waiter.get_return());
    },

    assigned_picker_exists: function() {return autoGroupAssigner.get_userPicker_obj().length != 0},

    do_if_exists: function(callback) {
        if (autoGroupAssigner.assigned_picker_exists()) {
            callback();
        }
    },

    actions: {
        on_enter: function(event) {
            if (event.keyCode == '13') {{
                autoGroupAssigner.get_userPicker_obj().trigger("enterKey");
            }}
        },

        main: function() {
            var id = autoGroupAssigner.get_assignedUser_id();
            var groups = autoGroupAssigner.get_user_groups(id);
            if (groups.length) {
                var primary = groups[0].Text;
                var index = autoGroupAssigner.support_group.index_of(primary);
                autoGroupAssigner.support_group.get_dropdown().select(index);
            }
            
        }
    },

    support_group: {
        get_support_group_field: function() {
            var r = $("[data-role='SupportGroup']");
            if (!r.length) {
                r = $("[data-role='TierQueue']");
            }
            return r;
        },

        get_dropdown: function() {
            return autoGroupAssigner.support_group.get_support_group_field().data("kendoExtDropDownTreeViewV3")._dropdown;
        },

        get_dropdown_data: function() {
            return autoGroupAssigner.support_group.get_dropdown().dataSource._data;
        },

        index_of: function(support_group) {
            var dat = autoGroupAssigner.support_group.get_dropdown_data();
            var keys = Object.keys(dat);

            for (var i = 0; i < keys.length; i++) {
                if (dat[keys[i]].Text == support_group) {
                    return i;
                }
            }
            throw Error("Support group " + support_group + " not found.");
        }
    },
    
    listeners: [
        function() {
            //start enter trigger
            autoGroupAssigner.get_userPicker_obj().on("keypress", autoGroupAssigner.actions.on_enter);
        },

        function() {
            //enter listener
            autoGroupAssigner.get_userPicker_obj().on("enterKey", autoGroupAssigner.actions.main);
        },

        function() {
            //focus out listener
            autoGroupAssigner.get_userPicker_obj().focusout(autoGroupAssigner.actions.main);
        }
    ],

    main: {
        existence_interval: null,

        activate_listeners: function() {
            autoGroupAssigner.listeners.forEach(function(n,i){n();});
        },

        start: function() {
            autoGroupAssigner.main.existence_interval = setInterval(function() {
                autoGroupAssigner.do_if_exists(function() {
                    autoGroupAssigner.main.activate_listeners();
                    clearInterval(autoGroupAssigner.main.existence_interval);
                });
            }, 800);
        }
    }

};

autoGroupAssigner.main.start();