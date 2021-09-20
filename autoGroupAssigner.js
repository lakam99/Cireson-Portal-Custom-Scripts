//Written by Arkam Mazrui for the Cireson web portal
//arkam.mazrui@nserc-crsng.gc.ca
//arkam.mazrui@gmail.com

var autoGroupAssigner = {
    get_userPicker_obj: function() {return $("[name='AssignedWorkItem']")},
    get_assignToMe_task: function() {return $("[data-bind='click: assignToMe']")},
    get_kendo_obj: function() {return autoGroupAssigner.get_userPicker_obj().data("kendoAutoComplete")},
    default_groups: null,
    get_assignedUser_id: function() {
        var name = autoGroupAssigner.get_userPicker_obj().val();
        var data = autoGroupAssigner.get_kendo_obj().dataSource._data;
        for (var i = 0, user = data[i]; i < data.length; i++, user = data[i]) {
            if (user.Name == name)
                return user.Id;
        }
        return "";
    },

    get_user_groups: function(id) {
        if (!id) {return}
        waiter.request("get", window.location.origin+"/api/V3/User/GetUsersSupportGroupEnumerations", {Id: id});
        return waiter.get_return();
    },

    get_current_user_groups:function() {
        return autoGroupAssigner.get_user_groups(autoGroupAssigner.get_assignedUser_id());
    },

    assigned_picker_exists: function() {return autoGroupAssigner.get_userPicker_obj().length != 0},

    do_if_exists: function(callback) {
        if (autoGroupAssigner.assigned_picker_exists()) {
            callback();
        }
    },

    get_primary_support_group: function() {
        var groups = autoGroupAssigner.get_current_user_groups();
        var primary = undefined;
        groups.forEach(function(group){
            if (autoGroupAssigner.default_groups.includes(group.Text)) {
                primary = group.Text;
                return;
            }
        });
        return primary === undefined ? groups[0].Text:primary;
    },

    actions: {
        on_enter: function(event) {
            if (event.keyCode == '13') {{
                autoGroupAssigner.get_userPicker_obj().trigger("enterKey");
            }}
        },

        main: function() {
            var groups = autoGroupAssigner.get_current_user_groups();
            if (groups.length) {
                var primary = autoGroupAssigner.get_primary_support_group();
                var index = autoGroupAssigner.support_group.index_of(primary);
                autoGroupAssigner.support_group.get_dropdown().select(index);
                if (pageForm.viewModel.TierQueue !== undefined) {
                    pageForm.viewModel.TierQueue = autoGroupAssigner.support_group.get_dropdown_data()[index];
                } else {
                    pageForm.viewModel.SupportGroup = autoGroupAssigner.support_group.get_dropdown_data()[index];
                }
            }
        },

        do_wait: function(callback, w8) {
            w8 = !w8?100:w8;
            return function() {
                setTimeout(callback, w8);
            }
        }
    },

    support_group: {
        get_support_group_dom: function() {
            var r = "[data-role='SupportGroup']";
            if (!$(r).length) {
                r = "[data-role='TierQueue']";
            }
            return r;
        },

        get_support_group_field: function() {
            return $(autoGroupAssigner.support_group.get_support_group_dom());
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
        },

        function() {
            //When Assign to Me is clicked
            autoGroupAssigner.get_assignToMe_task().on("click", autoGroupAssigner.actions.main);
        }
    ],

    main: {
        existence_interval: null,

        activate_listeners: function() {
            autoGroupAssigner.listeners.forEach(function(n,i){n();});
        },

        start: function() {
            ClientRequestManager.get_misc_file("autoGroupAssigner-Config").then(function(config){
                autoGroupAssigner.default_groups = config.default_for;
                autoGroupAssigner.main.existence_interval = setInterval(function() {
                    autoGroupAssigner.do_if_exists(function() {
                        autoGroupAssigner.main.activate_listeners();
                        clearInterval(autoGroupAssigner.main.existence_interval);
                    });
                }, 800);
            });
        }
    }

};

autoGroupAssigner.main.start();