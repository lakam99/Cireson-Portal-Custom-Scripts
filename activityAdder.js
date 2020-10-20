//Written by Arkam Mazrui for the Cireson web portal
//arkam.mazrui@nserc-crsng.gc.ca
//arkam.mazrui@gmail.com

var UI_Builder = {
    collapse: "<span class='fa fa-caret-down'></span>",
    expand: "<span class='fa fa-caret-up'></span>",

    new_ui_activity: function(name, id) {
        $(".activity_inner").append(`
        <div class='activity_item' data-id='${id}'>${name}<span class='activity_item_icons'>
                <span class="fa fa-plus"></span>
                <span class="fa fa-minus"></span>
            </span>
        </div>
        `);

        UI_Builder.bind();
    },

    bind_listeners: function() {
        $(".fa-plus").off("click");
        $(".fa-minus").off("click");
        $(".fa-minus").on("click", function(e){
            var elem = $(e.target).parent().parent()[0];
            var parent = elem.parentContainer;
            var children = undefined;
            $(elem).remove();
            if (parent !== undefined && parent.hasChildNodes()) {
                children = [].concat.apply([], parent.childNodes);
                children.forEach(function(child){
                    $(parent).before(child);
                });
            }
            UI_Builder.check_parenthood();
        });

        $(".fa-plus").on("click", function(ev){
            var e = $(ev.target).parent().parent();
            UI_Builder.new_ui_activity($(e).text(), $(e).attr("name"));
        });
    },

    build_draggable: function() {
        $(".activity_item").kendoDraggable({
            hint: function(e){return e.clone()},
            drag: function(e) {
                $("hr.indicator").remove();
                var hover = e.elementUnderCursor;
                var i = "<hr class='indicator'/>";
                var r = -1;
                if ($(".activity_inner")[0].contains(hover) && $(".activity_inner")[0] !== hover) {
                    r = UI_Builder.before_or_after(e, hover);
                    if (r == 0) {
                        $(hover).after(i);
                    } else if (r == 1) {
                        $(hover).before(i);
                    }
                }
            },
            dragend: function(){$("hr.indicator").remove()}
        });
    },

    build_droptarget: function() {
        $(".activity_item").kendoDropTarget({
            drop: function(e){
                $("hr.indicator").remove();
                var t = e.dropTarget[0];
                var elem = e.draggable.element[0];
                if (elem.parentContainer !== undefined && elem.parentContainer.contains(t)) {
                    return;
                }
                var r = UI_Builder.before_or_after(e, t);
                if (r == 1) {
                    $(t).before(elem);
                } else if (r == 0) {
                    $(t).after(elem);
                } else {
                    UI_Builder.push_to_parent(t, elem);
                }
                if (elem.parentContainer && $(elem).next() !== elem.parentContainer) {
                        $(elem).after(elem.parentContainer);
                }
                if (t.parentContainer && $(t).next() !== t.parentContainer) {
                    $(t).after(t.parentContainer);
                }
                UI_Builder.check_parenthood();
            }
        });
    },

    bind: function() {
        UI_Builder.bind_listeners();
        UI_Builder.build_draggable();
        UI_Builder.build_droptarget();
    },

    check_parenthood: function() {
        $(".parent_container").toArray().forEach(function(e){
            if (!e.hasChildNodes()) {
                $(e.parent).find("span.fa-caret-down,span.fa-caret-up").remove();
                delete e.parent.parentContainer;
                $(e).remove();
            }
        });
    },

    before_or_after: function(event, target) {
        var rect = target.getBoundingClientRect();
        var y = event.clientY;
        var distTop = Math.abs(y - rect.top);
        var distBot = Math.abs(y - rect.bottom);
        var centre = Math.abs(distTop-distBot);
        if (centre <= 7) {
            return -1;
        } else if (distTop > distBot) {
            return 0; //after
        } else {
            return 1; //before
        }
    },

    push_to_parent: function(parent, child) {
        if (parent === child) {return}
        if (parent.parentContainer === undefined) {
            $(parent).after("<div class='parent_container'></div>");
            parent.parentContainer = $(parent).next(".parent_container")[0];
            parent.parentContainer.parent = parent;
            $(parent).find("span.fa-plus").before(UI_Builder.collapse);
            UI_Builder.bind_collapse();
            return UI_Builder.push_to_parent(parent, child);
        } else {
            $(parent.parentContainer).append(child);
        }
    },
    
    bind_collapse: function() {
        $("span.fa-caret-down").on("click", function(e){
            var elem = $(e.target).parent().parent()[0];
            $(elem.parentContainer).attr("style", "display:none !important;");
            $(e.target).off("click");
            $(e.target).replaceWith(UI_Builder.expand);
            UI_Builder.bind_expand();
        });
    },

    bind_expand: function() {
        $("span.fa-caret-up").on("click", function(e){
            var elem = $(e.target).parent().parent()[0];
            $(elem.parentContainer).attr("style", "");
            $(e.target).off("click");
            $(e.target).replaceWith(UI_Builder.collapse);
            UI_Builder.bind_collapse();
        });
    }
}

var activityAdder = {
    properties: {
        activity_adder_html: "<div id='activity_adder'></div>",
        activity_selecter_html: "<div id='activity_selector'></div>",
        activity_container: "/CustomSpace/Templates/activityAdder/activityAdder.html",
        input_html: "<div id='activity_input_container'><input id='activity_adder_select'/></div>",
        dialog: {
            width: "502px",
            title: "Add Activity",
            modal: true,
            visible: false,
        },
        selector_dialog: {
            width: "502px",
            title: "Select a Template",
            modal: true,
            visible: false,
        },
        comboBox: {
            dataTextField: "Name",
            dataValueField: "Id",
            dataSource: [{Name: "Sorry, data is still loading!", Id: 0}],
            filter: "contains",
            suggest: true,
            index: 0
        },
        currentTicket: {
            formObj: null,
            viewModel: null
        },
        activityClasses: [
            "bfd90aaa-80dd-0fbb-6eaf-65d92c1d8e36",
            "7ac62bd4-8fce-a150-3b40-16a39a61383d",
            "0ad0812b-f267-52bf-9f11-c56587786791",
            "e786e1c7-b1fe-5b8b-ef8f-9e2dc346c44f",
            "568c49f2-d7d6-d7d7-89dc-dfb5b39fded7"
        ]
    },

    getters: {
        get_dialog: function() {
            var r = activityAdder.properties.dialog;
            r.content = activityAdder.properties.activity_container;
            r.actions = [
                {text: "Apply", action: activityAdder.functionality.apply, primary: true},
                {text: "Cancel", action: activityAdder.functionality.cancel, primary: false}
            ];
            return r;
        },

        get_selector_dialog: function() {
            var r = activityAdder.properties.selector_dialog;
            r.content = activityAdder.properties.input_html;
            r.actions = [
                {text: "Add", action: activityAdder.functionality.add, primary: true},
                {text: "Cancel", action: activityAdder.functionality.cancel, primary: false}
            ];
            return r;
        },

        get_activity_adder: function() {
            return $("#activity_adder");
        },

        get_activity_selector: function() {
            return $("#activity_selector");
        },

        get_dialog_window: function() {
            return activityAdder.getters.get_activity_adder().data("kendoDialog");
        },

        get_selector_window: function() {
            return activityAdder.getters.get_activity_selector().data("kendoDialog");
        },

        get_input: function() {
            return $("#activity_adder_select");
        },

        get_combobox: function() {
            return activityAdder.getters.get_input().data("kendoComboBox");
        },

        get_selected_template_id: function() {
            return activityAdder.getters.get_combobox()._old;
        },

        get_selected_template_name: function() {
            return activityAdder.getters.get_combobox().text();
        },

        get_selected_ids: function() {
            var ids = [];
            $(".activity_item").toArray().forEach(function(e){
                ids.push($(e).attr('name'));
            });
            return ids;
        }
    },

    setters: {
        set_ticket_info: function(formObj, viewModel) {
            activityAdder.setters.set_formObj(formObj);
            activityAdder.setters.set_viewModel(viewModel);
        },

        set_formObj: function(formObj) {
            activityAdder.properties.currentTicket.formObj = formObj;
        },

        set_viewModel: function(viewModel) {
            activityAdder.properties.currentTicket.viewModel = viewModel;
        }
    },

    setup: [
        function() {
            //settings the datasource for combobox
            for (var i = 0; i < activityAdder.properties.activityClasses.length; i++) {
                ClientRequestManager.send_request("get",
                 window.location.origin + "/api/V3/Template/GetTemplates",
                 {classId: activityAdder.properties.activityClasses[i]}, false).then(function(r){;
                    activityAdder.properties.comboBox.dataSource.push(JSON.parse(r));
                    activityAdder.properties.comboBox.dataSource = [].concat.apply([],activityAdder.properties.comboBox.dataSource);
                    settings_controller.set_setting("activity_adder", {combo_cache: activityAdder.properties.comboBox.dataSource});
                    activityAdder.getters.get_input().kendoComboBox(activityAdder.properties.comboBox);
                 });
            }
        },

        function() {
            waiter.request("get", "/CustomSpace/Templates/activityAdder/activityAdder.html", {}, false);
            activityAdder.properties.activity_container = waiter.get_return();
        },

        function() {
            //build UI
            $("body").append(activityAdder.properties.activity_adder_html);
            $("body").append(activityAdder.properties.activity_selecter_html);
            activityAdder.getters.get_activity_adder().kendoDialog(activityAdder.getters.get_dialog());
            activityAdder.getters.get_activity_selector().kendoDialog(activityAdder.getters.get_selector_dialog());
        },

        function() {
            //create task
            app.custom.formTasks.add('ServiceRequest', 'Add Activity', function(formObj, viewModel){
                activityAdder.setters.set_ticket_info(formObj, viewModel);
                activityAdder.getters.get_dialog_window().open();
            });
        },

        function() {
            //bind listeners
            $("#new_activity").on("click", function(){
                activityAdder.getters.get_selector_window().open();
            });
        }
    ],

    functionality: {
        cancel: function() {return true},

        add: async function() {
            var name = activityAdder.getters.get_selected_template_name();
            var id = activityAdder.getters.get_selected_template_id();
            UI_Builder.new_ui_activity(name, id);
        },

        generate_sequence_ids_wrapper: function() {
            var el = $(".activity_inner > .activity_items");
            activityAdder.functionality.generate_sequence_ids(el);
        },

        generate_sequence_ids: function(elements, is_child) {
            elements.forEach(function(el, i){
                $(el).data("sequenceId", i);
                if (el.parentContainer) {
                    activityAdder.functionality.generate_sequence_ids(el.parentContainer.children);
                }
            });
        },

        build_activities_wrapper: function() {

        },

        build_activities: function(elelements) {

        },

        apply: async function() {
            activityAdder.getters.get_dialog_window().close();
            ticketManipulator.show_loading();
            var oldObj = activityAdder.properties.currentTicket.viewModel;
            oldObj = await ticketManipulator.trigger_workflow_or_update_required(oldObj);
            var newObj = ticketManipulator.deep_copy(oldObj);
            var templates = [];
            var c = null;
            
            activityAdder.functionality.generate_sequence_ids_wrapper();
            
            $(".activity_inner > .activity_item").forEach(async function(el){
                
            });

            templates.forEach(function(t){
                //too lazy to flatten
                newObj.Activity.push(t);
            });
            
            ticketManipulator.remove_loading();
            activityAdder.functionality.ui_commit(newObj, oldObj);
        },

        ui_commit: function(new_obj, old_obj) {
            kendo.confirm("Are you sure you want to modify activities?").then(function(){
                ticketManipulator.show_loading();
                ticketManipulator.commit_new_obj(new_obj, old_obj, function(){
                    ticketManipulator.remove_loading();
                    kendo.alert("Successfully modified activities.");
                });
            });
        }
    },

    main: {
        setup: function() {
            var load_data = activityAdder.setup.shift();
            activityAdder.setup.forEach(function(f){f()});
            var cache = settings_controller.get_setting("activity_adder").combo_cache;
            activityAdder.getters.get_input().kendoComboBox(activityAdder.properties.comboBox);
            if (cache === undefined) {
                load_data();
            } else {
                activityAdder.properties.comboBox.dataSource = cache;
            }
            activityAdder.properties.comboBox.dataSource.shift();
            activityAdder.getters.get_input().kendoComboBox(activityAdder.properties.comboBox);
        }, 

        start: function() {
            activityAdder.main.setup();
        }
    }
}

activityAdder.main.start();