//Written by Arkam Mazrui for the Cireson web portal
//Based off of CustomCI.js by Geoff Ross
//arkam.mazrui@nserc-crsng.gc.ca
//arkam.mazrui@gmail.com

var menu1 = 0;
var menu2 = 1;

var formCreateCI = {

    templates: [ 
            "/CustomSpace/Templates/createConfigItem/createConfigItem.html",
            `<div class="drawermenu-tile" data-level="1" style="width: auto; overflow: hidden auto; display: block;">
                <ul>
                <!-- Drawer Menu Select type -->
                <li class="drawermenu-select-type visible-xs"><a><span>Select Type</span></a></li>
                <!-- Drawer Menu Tile Item THIS SECTION GETS REPEATED FOR EACH MENU ITEM -->`,
    ],

    classes: [
        {
            formLocation: "/CustomSpace/Templates/createUser/createUser.html",
            formJSON: "/CustomSpace/Templates/createUser/createUser.json",
            displayName: "External User",
            classId: "10a7f898-e672-ccf3-8881-360bfb6a8f9a",
            icon: "fa-user"
        }
    ],

    setup: [
        function() {
            formCreateCI.classes.forEach(function(n,i){
                formCreateCI.templates[menu2] += `<li class="drawer-button config-item-drawer1" 
                data-click="open" data-desc="` + ciClass.displayName + `" data-click-template="`
                 + ciClass.classId + `"><i class="drawer-icon fa fa-` + ciClass.icon + `"></i>
                <span class="drawermenu-tile-link">` + ciClass.displayName + `</span></li>`;
            });

            formCreateCI.templates[menu2] += "</ul></div>";
        },

        function() {
            $.ajax({
                url: formCreateCI.templates[menu1],
                async: false,
                dataType: "text",
                success: function(result) {
                    formCreateCI.templates[menu1] = result;
                }
             });
        },

        function() {
            //load form objects
            formCreateCI.classes.forEach(function(n,i){
                $.ajax({
                    url: n.formJSON,
                    async: false,
                    dataType: "json",
                    success: function(result) {
                        n.formJSON = result;
                    }
                });
            });
        },

        function() {
            $('.drawermenu-tile[data-level="0"] > ul').append(formCreateCI.templates[menu1]);
            $('.config-item-drawer0').hover(
                function () {
                    $('.drawerdetails-details-box').text("Create Configuration Item");
                },function (){}
            ).click(function () {
                $('.drawermenu-menu > .drawermenu-tile[data-level="1"]').remove();
                $('.drawermenu-tile[data-level="0"]').after(menu2);
                
                $('.drawermenu-tile[data-level="0"] > ul > li').removeClass('drawermenu-selected');
                $('.config-item-drawer0').addClass('drawermenu-selected');
                $('.config-item-drawer1').hover(
                    function () {
                        $('.drawerdetails-details-box').text("Create " + this.attributes["data-desc"].value);
                    },
                    function (){  }
                ).click(function () {
                    let this_class_id = this.attributes["data-click-template"].value;
                    formCreateCI.functionality.showClassFormHTML(this_class_id);
                    $('.drawermenu-tile[data-level="1"] > ul > li').removeClass('drawermenu-selected');
                    $('.config-item-drawer1').addClass('drawermenu-selected');
                });
            });
        }
    ],

    functionality: {
        getClassAtId: function(classId) {
            var r = null;
            for (var i = 0; i < formCreateCI.classes.length; i++) {
                let instance = formCreateCI.classes[i];
                if (instance.classId == classId) {
                    r = instance;
                }
            }

            if (r === null) {
                throw Error("Unable to locate class with id " + classId + ".");
            }  else {
                return r;
            }
        },

        showClassFormHTML: function(classId) {
            var c = formCreateCI.functionality.getClassAtId(classId);
            $.ajax({
                url: c.formLocation,
                dataType: "html",
                success: function(result) {
                    $(".drawerdetails-actions-box").html(result);
                }
            });
        }
    },

    main: {
        setup: function() {
            formCreateCI.setup.forEach(function(n,i){n()});
        },

        start: function() {
            $(document).ready(function() {
                if (session.user.Analyst) {
                    formCreateCI.main.setup();
                }
            });
        }
    }
    
}

formCreateCI.main.start();