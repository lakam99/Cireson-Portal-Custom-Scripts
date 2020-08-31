//Written by Arkam Mazrui for the Cireson web portal
//arkam.mazrui@nserc-crsng.gc.ca
//arkam.mazrui@gmail.com

var portalUserEmailManager = {
    getters: {
        get_affected_user: function() {
            return window.rawJSON.RequestedWorkItem;
        },

        get_affected_user_obj: function() {
            var dat = portalUserEmailManager.getters.get_affected_user();
            return {Id: dat.BaseId, Name: dat.DisplayName, Email: dat.UPN};
        },

        get_email_window: function() {
            return $("#userPickerTo_listbox");
        },

        get_recipient_box: function() {
            return portalUserEmailManager.getters.get_email_window().data("kendoStaticList");
        }
    },

    properties: {
        email_window_exists: function() {
            return portalUserEmailManager.getters.get_email_window().length != 0;
        },

        affected_user_exists: function() {
            return portalUserEmailManager.getters.get_affected_user() != undefined;
        },

        affected_user_email_not_recognized: function() {
            var user_id = portalUserEmailManager.getters.get_affected_user_obj().Id;
            var url = "/EmailNotification/GetffectedUserEmail?baseId=e8832a86-2a8f-ce5b-eaba-342391e47bdc";
            waiter.request("get", url, {baseId: user_id}, false);
            return waiter.get_return().length == 0;
        }
    },

    functionality: {
        wipe_recipient_data: function() {
            var data = portalUserEmailManager.getters.get_recipient_box().dataSource;
            data._data.splice(0, data._total);
        },

        add_user_to_recipient_box: function() {
            var box = portalUserEmailManager.getters.get_recipient_box();
            box.dataSource.add(portalUserEmailManager.getters.get_affected_user_obj());
            $(box.content.children().children()[0]).click();
        }
    },

    main: {
        start: function() {
            var existence_interval = setInterval(function(){
                var properties = portalUserEmailManager.properties;
                if (properties.email_window_exists()) {
                    if (properties.affected_user_exists() && properties.affected_user_email_not_recognized()) {
                        portalUserEmailManager.functionality.wipe_recipient_data();
                        portalUserEmailManager.functionality.add_user_to_recipient_box();
                    }
                    clearInterval(existence_interval);
                }
            }, 100);
        }
    }
}

portalUserEmailManager.main.start();