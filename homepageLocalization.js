//Written by Arkam Mazrui for the Cireson web portal
//arkam.mazrui@nserc-crsng.gc.ca
//arkam.mazrui@gmail.com

var homepageLocalizer = {
    headers: [
        "6b17f35f-f46a-3d4c-13b9-12b53ac3d290",
        "63504d4c-5c9b-7303-8464-3cd60687b5d1",
        "97f1f6a2-dbf7-20d3-b4be-0ebd03b4061d",
        "1b582b93-bdad-7ca2-85bd-aefcc4140016"
    ],

    titles: [],

    bodies: [],

    setup: [
        function () {
            //populate headers array
            for (var i = 0; i < homepageLocalizer.headers.length; i++) {
                homepageLocalizer.headers[i] = $("#" + homepageLocalizer.headers[i]);
            }
        },

        function() {
            //populate titles array
            $(".sc-item-title").toArray().forEach(function(n,i) {
                homepageLocalizer.titles.push($(n));
            });
        },

        function() {
            //populate bodies array
            $(".sc-item-desc").toArray().forEach(function(n,i){
                homepageLocalizer.bodies.push($(n));
            });
        }
    ],

    main: {
        setup: function() {
            homepageLocalizer.setup.forEach(function(n,i){n()});
        },

        apply_localization: function(list, letter) {
            if (!Array.isArray(list)) {
                throw Error("List arg must be array.");
            }
            if (typeof(letter) != "string" && letter.length != 1) {
                throw Error("Letter arg must be single character.");
            }
            list.forEach(function(n,i){
                n.text(localization[letter+i]);
            });
        },

        apply_localizations: function() {
            homepageLocalizer.main.apply_localization(homepageLocalizer.headers, "h");
            homepageLocalizer.main.apply_localization(homepageLocalizer.titles, "t");
            homepageLocalizer.main.apply_localization(homepageLocalizer.bodies, "b");
        },

        start: function() {
            if (loc("/View/02efdc70-55c7-4ba8-9804-ca01631c1a54")) {
                var existence_interval = setInterval(function(){
                    if ($("#" + homepageLocalizer.headers[0]).length) {
                        homepageLocalizer.main.setup();
                        homepageLocalizer.main.apply_localizations();
                        clearInterval(existence_interval);
                    }
                }, 100);
            }
        }
    }

}

homepageLocalizer.main.start();