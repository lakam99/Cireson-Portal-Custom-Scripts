//Written by Arkam Mazrui for the Cireson web portal
//Based off of CustomCI.js by Geoff Ross
//arkam.mazrui@nserc-crsng.gc.ca
//arkam.mazrui@gmail.com

var menu1 = 0;
var menu2 = 1;

var formCreateCI = {

    templates: [ 
            customGlobalLoader.get_str_url("/CustomSpace/Templates/createConfigItem/createConfigItem.html"),
            '<div class="drawermenu-tile" data-level="1" style="width: auto; overflow: hidden auto; display: block;">'+
                '<ul>'+
                '<!-- Drawer Menu Select type -->'+
                '<li class="drawermenu-select-type visible-xs"><a><span>Select Type</span></a></li>'+
                '<!-- Drawer Menu Tile Item THIS SECTION GETS REPEATED FOR EACH MENU ITEM -->',
    ],

    classes: [
        {
            formLocation: customGlobalLoader.get_str_url("/CustomSpace/Templates/createUser/createUser.html"),
            formJSON: customGlobalLoader.get_str_url("/CustomSpace/Templates/createUser/createUser.json"),
            name: "createUser",
            displayName: "External User",
            classId: "10a7f898-e672-ccf3-8881-360bfb6a8f9a",
            icon: "fa-user"
        }
    ],

    currentClass: undefined,

    helperFunctions: {},

    setup: [
        function() {
            formCreateCI.classes.forEach(function(ciClass,i){
                formCreateCI.templates[menu2] += '<li class="drawer-button config-item-drawer1"'+
                'data-click="open" data-desc="' + ciClass.displayName + '" data-click-template="'+
                 ciClass.classId + '"><i class="drawer-icon fa ' + ciClass.icon + '"></i>'+
                '<span class="drawermenu-tile-link">' + ciClass.displayName + '</span></li>';
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
            //Generate generators
            formCreateCI.classes.forEach(function(c){
                formCreateCI.functionality.generate_generators(c.formJSON[c.name].fields);
            });
        },

        function() {
            //Generate test funcs
            formCreateCI.classes.forEach(function(c){
                formCreateCI.functionality.generate_test_func(c.formJSON[c.name].fields);
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
                    formCreateCI.functionality.mark_required_fields(this_class_id);
                    $('.drawermenu-tile[data-level="1"] > ul > li').removeClass('drawermenu-selected');
                    $('.config-item-drawer1').addClass('drawermenu-selected');
                    formCreateCI.functionality.start_create_listener(this_class_id);
                });
            });
        }
    ],

    functionality: {
        mark_required_fields: function(classId) {
            $(document).on("form-loaded", function(){
                if (!$("#required_msg").length) {
                    $(".drawerdetails-details-box").append(`<span id='required_msg'>
                    &nbsp;Please note that inputs with &nbsp;<span class="text-danger">**</span>
                    &nbsp;are required.</span>`);
                    var c = formCreateCI.functionality.getClassAtId(classId);
                    c.formJSON[c.name].fields.forEach(function(field,i){
                        let input = formCreateCI.functionality.get_input(field.name);
                        if (field.required && input.is(":visible")) {
                            input.parent().parent().find(".editor-label").find("span")
                            .append('&nbsp;<span class="text-danger">**</span>');
                        }
                    });
                }
            });
        },

        start_create_listener: function(this_class_id) {
            this_class_id = this_class_id ? this_class_id:formCreateCI.currentClass;
            formCreateCI.currentClass = this_class_id;
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

        replace_class: function(element, prev, _new) {
            element.removeClass(prev);
            element.addClass(_new);
        },

        bind_expand_collapse_listeners: function() {
            var element = null;
            var parent = null;
            var expand = ["k-i-collapse", "expanded"];
            var collapse = ["k-i-expand", "collapsed"];
            $(".arkam-expand-collapse").toArray().forEach(function(n,i){
                $(n).on("click", function(event){
                    event.preventDefault();
                    element = $(event.target);
                    parent = element.parent().parent().find(".expand-collapse-container");
                    if (element.hasClass(expand[0])) {
                        formCreateCI.functionality.replace_class(element, expand[0], collapse[0]);
                        formCreateCI.functionality.replace_class(parent, expand[1], collapse[1]);
                    } else {
                        formCreateCI.functionality.replace_class(element, collapse[0], expand[0]);
                        formCreateCI.functionality.replace_class(parent, collapse[1], expand[1]);
                    }
                });
            });
        },

        showClassFormHTML: function(classId) {
            var c = formCreateCI.functionality.getClassAtId(classId);
            $.ajax({
                url: c.formLocation,
                dataType: "html",
                success: function(result) {
                    $(".drawerdetails-actions-box").html(result);
                    formCreateCI.functionality.bind_expand_collapse_listeners();
                    $(document).trigger("form-loaded");
                }
            });
        },

        close: function() {
            $("img[alt='Close']").click();
        },

        get_input: function(name) {
            return $("input.CI-Input[name='"+name+"']");
        },

        generate_generators: function(fields) {
            fields.forEach(function(field,i){
                if (field.generatorFunction) {
                    ClientRequestManager.get_str_url(field.generatorFunction.functionLocation).then(function(result){
                        eval(result + ";field.generatorFunction.function = eval(field.generatorFunction.functionName)");
                    });
                }
            });
        },

        generate_test_func: function(fields) {
            fields.forEach(function(field){
                if (field.testFunction) {
                    ClientRequestManager.get_str_url(field.testFunction.functionLocation).then(function(result){
                        eval(result + ";field.testFunction.function = eval(field.testFunction.functionName)");
                    });
                }
            });
        },

        generate_value: function(field) {
            var params = "";
            var test = null;
            var l = 0;
            var value = null;
            var clean = new RegExp(/["\*\d,;{}\[\]!@#$%\^&\(\)/\\\\]/g); //took 2 hours.. regex man... ****
            if (field.generatorFunction) {
                if (field.generatorFunction.parameters) {
                    l = field.generatorFunction.parameters.length;
                    field.generatorFunction.parameters.forEach(function(param,i){
                        test = formCreateCI.functionality.get_input(param);
                        if (!test.length) {
                            throw Error("Parameter name " + param + " did not match any inputs.");
                        } else {
                            test = field.testFunction ? test.val():test.val().replace(clean,'');
                            if (i != l-1) {
                                params += "\"" + test +"\"" + ",";
                            } else {
                                params += "\"" + test +"\"";
                            }
                        }
                    });
                }
                
                eval("value = field.generatorFunction.function(" + params + ")");
                formCreateCI.functionality.get_input(field.name).val(value);
            }
        },

        show_error_msg: function(input, msg) {
            input.after("<div class='alert alert-danger .alert-dismissable'>"+
            '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>'+msg+'</div>');
        },

        test_inputs: function(classId) {
            let c = formCreateCI.functionality.getClassAtId(classId);
            let requirement_met = true;
            var test = true;
            c.formJSON[c.name].fields.forEach(function(field,i){
                formCreateCI.functionality.generate_value(field);
                let input = formCreateCI.functionality.get_input(field.name);
                if (field.required && !input.val().length) {
                    requirement_met = false;
                    formCreateCI.functionality.show_error_msg(input, 'Required!');
                }
                if (field.testFunction) {
                    eval("test = field.testFunction.function(\"" + input.val() + "\")");
                    if (!test) {
                        requirement_met = false;
                        field.testFunction.failedMessage = 
                            field.testFunction.failedMessage ? field.testFunction.failedMessage:'Failed to verify field requirements.';
                        formCreateCI.functionality.show_error_msg(input, field.testFunction.failedMessage);
                    }
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
                            kendo.alert("<a href='/DynamicData/Edit/"+result.BaseId+"'>"+
                            'New configuration item successfully created!</a>');
                            settings_controller.append_setting("new_config_items", result.BaseId);
                            formCreateCI.functionality.close();
                        },
                        error: function(o, status, msg) {
                            console.log("An error occured: " + status + ": " + msg);
                            console.log(o.responseJSON.exception);
                        }
                    });
                }, function() {
                    kendo.alert("Cancelled creation of new configuration item.");
                    formCreateCI.functionality.start_create_listener();
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