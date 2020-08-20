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
            name: "createUser",
            displayName: "External User",
            classId: "10a7f898-e672-ccf3-8881-360bfb6a8f9a",
            icon: "fa-user"
        }
    ],

    setup: [
        function() {
            formCreateCI.classes.forEach(function(ciClass,i){
                formCreateCI.templates[menu2] += `<li class="drawer-button config-item-drawer1" 
                data-click="open" data-desc="` + ciClass.displayName + `" data-click-template="`
                 + ciClass.classId + `"><i class="drawer-icon fa ` + ciClass.icon + `"></i>
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
                $('.drawermenu-tile[data-level="0"]').after(formCreateCI.templates[menu2]);
                
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
                    formCreateCI.functionality.start_create_listener();
                });
            });
        }
    ],

    functionality: {
        start_create_listener: function() {
            var btn = $(".drawermenu-createbutton");
            btn.css("display", "block").on("click", (function() {
                formCreateCI.functionality.commit_new_class(this_class_id);
                btn.off("click");
            }));
        },

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
        },

        get_input: function(name) {
            return $(`input[name='`+name+`']`);
        },

        test_inputs: function(classId) {
            let c = formCreateCI.functionality.getClassAtId(classId);
            let requirement_met = true;
            c.formJSON[c.name].fields.forEach(function(field,i){
                let input = formCreateCI.functionality.get_input(field.name);
                if (field.required && !input.val().length) {
                    requirement_met = false;
                    input.after(`<div class='alert alert-danger .alert-dismissable'>
                    <a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>Required!</div>`);
                }
            });
            return requirement_met;
        },

        get_commit_data: function(classId) {
            var return_data = null;
            var data = {ClassTypeId: classId};
            let c = formCreateCI.functionality.getClassAtId(classId);

            c.formJSON[c.name].fields.forEach(function(field,i){
                data[field.name] = formCreateCI.functionality.get_input(field.name).val();
            });

            return_data = {
                formJSON: {
                    original: null,
                    current: data
                }
            }

            return return_data;
        },

        commit_new_class: function(classId) {
            if (formCreateCI.functionality.test_inputs(classId)) {
                kendo.confirm("Are you sure you want to create a new item?").then(function(){
                    $.ajax({
                        url: '/api/V3/Projection/Commit',
                        type: 'post',
                        contentType: 'application/json; charset=utf-8',
                        dataType: 'json',
                        data: JSON.stringify(formCreateCI.functionality.get_commit_data(classId)),
                        success: function(result) {
                            kendo.alert(`<a href='/DynamicData/Edit/`+result.BaseId+`'>
                            New configuration item successfully created!</a>`);
                        },
                        error: function(o, status, msg) {
                            console.log("An error occured: " + status + ": " + msg);
                            console.log(o.responseJSON.exception);
                        }
                    });
                }, function() {
                    kendo.alert("Cancelled creation of new configuration item.");
                });
            }
            formCreateCI.functionality.start_create_listener();
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