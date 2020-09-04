//Written by Arkam Mazrui for the Cireson web portal
//arkam.mazrui@nserc-crsng.gc.ca
//arkam.mazrui@gmail.com

var hiddenUserFinder = {
    functionality: {
        get_user: function(name){
            waiter.request("get", "/platform/api/GlobalSearch(EntitySets=@entitysets)?search="+name+"&%24top=10&%40entitysets=%27Cached_MT_System_Domain_User%27&languageFields=LanguageCode%2CLocaleID&languageCode=ENU&searchLimit=10?", {}, false);
            return JSON.parse(JSON.parse(waiter.get_return()).value[0].EntityJson);
        },

        get_users: function(name){
            var r = [];
            waiter.request("get", "/platform/api/GlobalSearch(EntitySets=@entitysets)?search="+name+"&%24top=10&%40entitysets=%27Cached_MT_System_Domain_User%27&languageFields=LanguageCode%2CLocaleID&languageCode=ENU&searchLimit=10?", {}, false);
            var users = JSON.parse(waiter.get_return()).value;
            users.forEach(function(user){
                r.push(hiddenUserFinder.functionality.create_user_obj(JSON.parse(user.EntityJson)));
            });
            return r;
        },

        create_user_obj(user) {
            return {Id: user.Guid, Name: user.DisplayName, Email: user.UPN};
        },

        create_user: function(name) {
            var user = hiddenUserFinder.functionality.get_user(name);
            return hiddenUserFinder.functionality.create_user_obj(user);
        },

        user_equals: function(u1, u2) {
            return u1.Id == u2.Id;
        },

        user_array_includes(array, userobj) {
            var r = false;
            array.forEach(function(user){
                if (hiddenUserFinder.functionality.user_equals(user, userobj)) {
                    r = true;
                    return;
                }
            });
            return r;
        }
    },

    setup: [
        function() {
            //Bind listeners
            var picker_wait = setInterval(function(){
                if (accentSuggest.getters.get_page_userpicker_objs().length) {
                    clearInterval(picker_wait);
                    accentSuggest.getters.get_page_userpicker_objs().forEach(function(n,i){
                        let timeout = null;
        
                        $(n.element).on("click", function(){
                            n.popup.open();
                        });
                        $(n.element).off("focusout");
                        $(n.element).on("keyup", function(){
                            clearTimeout(timeout);
        
                            //Set a timeout to allow the user to finish typing
                            timeout = setTimeout(function(){
                                if (n.popup.visible()) {
                                    var text = n.element.val();
                                    var displayed_users = n.dataSource.data();
                                    var data_users = hiddenUserFinder.functionality.get_users(text);
                                    if (data_users.length > displayed_users.length) {
                                        data_users.forEach(function(user){
                                            if (!hiddenUserFinder.functionality.user_array_includes(displayed_users, user)) {
                                                n.dataSource.add(user);
                                                displayed_users = n.dataSource.data();
                                            }
                                        });
                                    }
                                }
                            }, accentSuggest.constants.type_speed_allowance);
                        });
                        console.log(i + ":Listener bound.");
                    });
                }
            }, 100);
           
        } 
    ],

    main: {
        start: function() {
            hiddenUserFinder.setup.forEach(function(n,i){n()});
        }
    }
}

hiddenUserFinder.main.start();