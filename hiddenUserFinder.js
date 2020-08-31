//Written by Arkam Mazrui for the Cireson web portal
//arkam.mazrui@nserc-crsng.gc.ca
//arkam.mazrui@gmail.com

var hiddenUserFinder = {
    functionality: {
        get_user: function(name){
            waiter.request("get", "/platform/api/GlobalSearch(EntitySets=@entitysets)?search="+name+"&%24top=10&%40entitysets=%27Cached_MT_System_Domain_User%27&languageFields=LanguageCode%2CLocaleID&languageCode=ENU&searchLimit=10?", {}, false);
            return JSON.parse(JSON.parse(waiter.get_return()).value[0].EntityJson);
        },

        create_user: function(name) {
            var user = hiddenUserFinder.functionality.get_user(name);
            var r = {Id: user.Guid, Name: user.DisplayName, Email: user.UPN};
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
                                    if (n.dataSource._total == 0) {
                                        var text = n.element.val();
                                        try {
                                            n.dataSource.add(hiddenUserFinder.functionality.create_user(text));
                                        } catch(err) {
                                            console.log("No such user " + text);
                                        }
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