//Written by Arkam Mazrui for the Cireson web portal
//arkam.mazrui@nserc-crsng.gc.ca
//arkam.mazrui@gmail.com

var accentSuggest = {
    
    constants: {
        suggest_letters: {
            'a': [224, 226, 230],
            'c': [231],
            'e': [233, 232, 234, 235],
            'i': [238, 239],
            'o': [244, 156],
            'u': [249, 251, 252],
            'y': [255]
        },

        type_speed_allowance: 200 //ms
    },

    properties: {
        enabled: null
    },

    objects: {
        userpicker_array: []
    },

    setters: {
        set_userpicker_array: function(arg) {
            if (Array.isArray(arg)) {
                accentSuggest.objects.userpicker_array = arg;
                if (arg.length) {
                    accentSuggest.setters.set_enabled(true);
                } else {
                    accentSuggest.setters.set_enabled(false);
                }
            } else {
                throw Error("Cannot set non-array to userpicker_array obj.");
            }
        },

        set_enabled: function(val) {
            if (val !== true && val !== false) {
                throw Error("Enabled value must be a boolean.");
            } else {
                accentSuggest.properties.enabled = val;
            }
        } 
    },

    getters: {
        get_userpicker_array: function() {
            return accentSuggest.objects.userpicker_array;
        },

        is_enabled: function() {
            if (accentSuggest.properties.enabled === null) {
                throw Error("Enabled property accessed before accentSuggest was setup.");
            }
            return accentSuggest.properties.enabled;
        },

        get_page_userpickers: function() {
            return $("input.input-userpicker, input[data-control-itemtype='ServiceRequest'],"+
                    "input[data-control-itemtype='Incident']").toArray();
        },

        get_page_userpicker_obj: function(element_reference) {
            return $(element_reference).data("kendoAutoComplete");
        },

        get_page_userpicker_objs: function() {
            var r = [];
            accentSuggest.getters.get_page_userpickers().forEach(function(n,i) {
                r.push(accentSuggest.getters.get_page_userpicker_obj(n));
            });
            return r;
        },

        get_vowel_group: function(character) {
            if (typeof(character) != "string" || (typeof(character) == "string" && character.length > 1)) {
                throw Error("Parameter to get_vowel_group must be single character.")
            }
            if (accentSuggest.constants.suggest_letters[character] === undefined) {
                throw Error("Invalid vowel " + character + " passed to get_vowel_group.");
            } else {
                var r = [];
                accentSuggest.constants.suggest_letters[character].forEach(function(n,i){
                    r.push(String.fromCharCode(n));
                });
                return r;
            }
        },

        get_vowel_groups: function(string_arg) {
            if (typeof(string_arg) != "string") {
                throw Error("generate_variations arg must be a string.");
            }
            //to lowercase character array
            var variations = [];
            var vowels = [];
            string_arg = string_arg.toLowerCase().split("");
            string_arg.forEach(function(n,i) {
                if (accentSuggest.constants.suggest_letters[n] !== undefined) {
                    var p = [n];
                    vowels.push(p.concat(accentSuggest.getters.get_vowel_group(n)));
                }
            });
            
            return vowels;
        },
        
    },

    functionality: {
        do_if_enabled: function(callback) {
            var state = accentSuggest.getters.is_enabled();
            if (state) {
                callback();
            }
        },

        vowel_indexes: function(word) {
            if (typeof(word) != "string") {
                throw Error("Argument passed to vowel_indexes must be string.");
            }

            var r = [];

            word.toLowerCase().split("").forEach(function(n,i){
                if (accentSuggest.constants.suggest_letters[n] !== undefined) {
                    r.push(i);
                }
            });

            return r;
        },

        loop: function(arg) {
            //gift from God
            var r = [];
            var statement = "";
            var inner_statement = "r.push(";
        
            for (var i = 0; i < arg.length; i++) {
                inner_statement += "arg[" + i + "][i" + i + "]";
                if (i != arg.length - 1) {
                    inner_statement += "+";
                } else {
                    inner_statement += ")";
                }
            }
        
            var i = 0;
        
            while (i < arg.length) {
                statement += "for (var i" + i + "=0; i" + i + " < arg[" + i + "].length; i" + i + "++) {";
                if (i == arg.length - 1) {
                      
                      statement += inner_statement + "}".repeat(arg.length);
                }
                i++;
            }
            eval(statement);
            return r;
        },

        generate_variation: function(original_word, variation) {
            var vowel_indexes = accentSuggest.functionality.vowel_indexes(original_word);
            if (variation.length != vowel_indexes.length) {
                throw Error("Vowel indexes size doen't match length of variation.");
            }
            var word_arr = original_word.toLowerCase().split("");
            for (var i = 0; i < variation.length; i++) {
                word_arr[vowel_indexes[i]] = variation[i];
            }
            return word_arr.join('');
        },

        generate_variations: function(word) {
            if (typeof(word) != "string") {
                throw Error("Argument passed to generate variations must be string.");
            }
            var max_vary = 50;
            var word_variations = [];
            var variations = accentSuggest.functionality.loop(accentSuggest.getters.get_vowel_groups(word)).slice(0,max_vary);
            if (variations.length) {

                variations.forEach(function(variation,i){
                    word_variations.push(accentSuggest.functionality.generate_variation(word, variation));
                });
            }
            return word_variations;
        },

        request_variation: async function(word) {
            var max_results = 5;
            var request_data = {userFilter: word, filterByAnalyst: false,
                                groupsOnly: false, maxNumberOfResults: max_results,fetchAll: false};
            var url = window.location.origin + "/api/V3/User/GetUserList";
            var method = "get";
            var r = await ClientRequestManager.send_request(method, url, request_data, false);
            return JSON.parse(r);
        },

        request_variations: async function(word) {
            var variations = accentSuggest.functionality.generate_variations(word);
            variations.splice(0,1);
            var suggestions = [];
            for (var i = 0; i < variations.length; i++) {
                var suggestion = await accentSuggest.functionality.request_variation(variations[i]);
                if (suggestion.length) {
                    suggestions.push(suggestion);
                }
            }
            suggestions = [].concat.apply([], suggestions);
            return suggestions;
        }

    },

    setup: [
        function() {
            //Set userpicker objects (if any)
            accentSuggest.setters.set_userpicker_array(accentSuggest.getters.get_page_userpicker_objs());
        } ,

        /**function() {
            //Add buttons
            accentSuggest.getters.get_page_userpicker_objs().forEach(function(n,i){
                $(n.element).parent().before("<a class='k-button pull-right btn btn-accent"+i+"'>"+String.fromCharCode(232)+"</a>");
            });
        }, **/

        function() {
            //Bind listeners
            accentSuggest.getters.get_page_userpicker_objs().forEach(function(n,i){
                var timeout = null;

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
                            accentSuggest.functionality.request_variations(text).then(function(variations){
                                variations.forEach(function(variation, i){
                                    n.dataSource.add(variation);
                                });
                                n.popup.open();
                            });
                        }
                    }, accentSuggest.constants.type_speed_allowance);
                });
                console.log(i + ":Listener bound.");
            });
        } 
    ],

    main: {
        setup: function() {
            accentSuggest.setup.forEach(function(n,i){n();});
        },

        start: function() {
            if (!settings_controller.get_setting_value("accentSuggest")) {return;}
            var accent_wait = setInterval(function() {
                if (accentSuggest.getters.get_page_userpicker_objs().length) {
                    accentSuggest.main.setup();
                    clearInterval(accent_wait);
                }
            }, 100);
        }
    }

};

accentSuggest.main.start();