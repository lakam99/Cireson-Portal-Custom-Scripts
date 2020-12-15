//Written by Arkam Mazrui for the Cireson web portal
//arkam.mazrui@nserc-crsng.gc.ca
//arkam.mazrui@gmail.com

var UI_Builder = {
    collapse: "<span class='fa fa-caret-down'></span>",
    expand: "<span class='fa fa-caret-up'></span>",

    new_ui_activity: function(name, id, parent, override) {
        var elements = null;
        if(activityAdder.properties.activityClasses.includes(id) && !override) {
            id = activityAdder.functionality.match_id(name);
        }
        parent = parent === undefined ? ".activity_inner":parent;
        $(parent).append(`
        <div class='activity_item' data-id='${id}'>${name}<span class='activity_item_icons'>
                <span class="fa fa-plus"></span>
                <span class="fa fa-minus"></span>
            </span>
        </div>
        `);

        UI_Builder.bind();
        elements = $(".activity_item").toArray();
        return elements[elements.length - 1];
        
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
            var text = $(e).data("reserve") === undefined ? $(e).text():$(e).data("reserve").FullClassName;
            var id = $(e).data("reserve") === undefined ? $(e).data("id"):$(e).data("reserve").ClassTypeId;
            UI_Builder.new_ui_activity(text, $(e).data("id"));
        });
    },

    wipe_class: function(classname) {
        $(`.${classname}`).toArray().forEach(function(e){
            $(e).removeClass(`${classname}`);
        });
    },

    build_draggable: function() {
        $(".activity_item").kendoDraggable({
            hint: function(e){return e.clone()},
            drag: function(e) {
                var h = "activity_item_hover";
                var ch = ".activity_item_hover";

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
                    } else if (r == -1) {
                        if ($(ch).length) {
                            UI_Builder.wipe_class(h);
                        }
                        $(hover).addClass(h);
                    }
                }
            },
            dragend: function(){
                $("hr.indicator").remove();
            }
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

    dif_maxto: function(num, num_now, max_dif, min_dif) {
        //is num within respectable difference range?
        var t = Math.abs(num - num_now);
        return t <= max_dif && t <= min_dif;
    },

    prev_y: null,
    prev_r: null,
    before_or_after: function(event, target) {
        var rect = target.getBoundingClientRect();
        var r = null;
        var y = event.clientY;
        if (activityAdder.prev_y != null && UI_Builder.dif_maxto(y, UI_Builder.prev_y, 10, 0)) {
            if (UI_Builder.prev_r != null) {
                return UI_Builder.prev_r;
            } else {
                UI_Builder.prev_y = y;
            }
        }
        var distTop = Math.abs(y - rect.top);
        var distBot = Math.abs(y - rect.bottom);
        var centre = Math.abs(distTop-distBot);
        if (centre <= 7) {
            r = -1; //center
        } else if (distTop > distBot) {
            r = 0; //after
        } else {
            r = 1; //before
        }
        UI_Builder.prev_r = r;
        return r;
    },

    build_parent: function(parent) {
        //can you really build a parent? Yeah I'll show you
        $(parent).after("<div class='parent_container'></div>");
        parent.parentContainer = $(parent).next(".parent_container")[0];
        parent.parentContainer.parent = parent;
        $(parent).find("span.fa-plus").before(UI_Builder.collapse);
        UI_Builder.bind_collapse();
        return parent;
    },

    push_to_parent: function(parent, child) {
        if (parent === child) {return}
        var text = $(parent).text();
        if (!(text.includes("PLA") || text.includes("Parallel Activity"))) {return}
        if (parent.parentContainer === undefined) {
            UI_Builder.build_parent(parent);
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
            title: "Select an Activity Template",
            modal: true,
            visible: false,
        },
        comboBox: {
            dataTextField: "Name",
            dataValueField: "Id",
            dataSource: [],
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

    sequenceIdManager: {
        id_replaced: false,
        needs_wipe: false,
        is_needed: function() {
            return (!activityAdder.sequenceIdManager.id_replaced && activityAdder.sequenceIdManager.needs_wipe) 
                    || !(activityAdder.sequenceIdManager.id_replaced && activityAdder.sequenceIdManager.needs_wipe);
        }
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
        },

        get_activity_items: function() {
            return $(".activity_inner > .activity_item").toArray();
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
                var completed = viewModel.FullClassName == "Incident" ? ticketManipulator.constants.statuses.completed.inc:
                    ticketManipulator.constants.statuses.completed.srq;
                if (ticketManipulator.status_eq(viewModel.Status, completed)) {
                    kendo.alert("Cannot modify activities of a completed ticket.");
                    return;
                }
                activityAdder.functionality.represent_current_wrapper();
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

        match_id: function(name) {
            var a = activityAdder.getters.get_combobox().dataSource.data();
            for (var i = 0; i <a.length; i++){
                if (a[i].Name.replace(/\W/g,'').includes(name.replace(/\W/g,''))) {
                    return a[i].Id;
                }
            }
        },

        activity_already_represented: function(activity) {
            var items = $(".activity_item").toArray();
            for (var i = 0; i < items.length; i++) {
                if ($(items[i]).data("reserve") === activity) {
                    return true;
                }
            }
            return false;
        },

        represent_current_wrapper: function() {
            var activities = activityAdder.properties.currentTicket.viewModel.Activity;
            return activityAdder.functionality.represent_current(activities);
        },

        represent_current: function(activities, parent_elem) {
            var e = null;
            activities.forEach(function(activity){
                if (!activityAdder.functionality.activity_already_represented(activity)) {
                    e = UI_Builder.new_ui_activity(activity.Id, activity.ClassTypeId, parent_elem, true);
                    $(e).data("reserve", activity);
                    if (activity.Activity && activity.Activity.length) {
                        e = UI_Builder.build_parent(e);
                        activityAdder.functionality.represent_current(activity.Activity, e.parentContainer);
                    } 
                }
            });
        },

        build_activities_wrapper: function() {
            var el = activityAdder.getters.get_activity_items();
            return activityAdder.functionality.build_activities(el);
        },

        build_activities: function(elements) {
            var activities = [];
            var t = null;
            var el = null;
            var reserve = undefined;
            var first_parent = undefined;
            for(var i = 0; i < elements.length; i++){
                el = elements[i];
                reserve = $(el).data("reserve");
                t = ticketManipulator.deep_copy(
                    reserve !== undefined ? reserve:ticketManipulator.non_async_request_template_obj($(el).data("id")));
                if (reserve && reserve.SequenceId != i && activityAdder.sequenceIdManager.is_needed()) {
                    //request activities be wiped then try again
                    activityAdder.sequenceIdManager.needs_wipe = true;
                    activityAdder.sequenceIdManager.id_replaced = false;
                    return null;
                }
                t.SequenceId = i;
                if (el.parentContainer) {
                    t.Activity = activityAdder.functionality.build_activities($(el.parentContainer).find(".activity_item").toArray());
                } else {
                    t.ActualStartDate = (new Date()).toISOString();
                }
                activities.push(t);
            }
            return activities;
        },

        apply: async function() {
            activityAdder.getters.get_dialog_window().close();
            ticketManipulator.show_loading();
            var oldObj = activityAdder.properties.currentTicket.viewModel;
            oldObj = await ticketManipulator.trigger_workflow_or_update_required(oldObj);
            var newObj = ticketManipulator.deep_copy(oldObj);
            var backup = null;
            var activities = null;
            var c = null;
            
            activities = activityAdder.functionality.build_activities_wrapper();
            if (activities == null) {
                backup = ticketManipulator.deep_copy(newObj);
                newObj.Activity = [];
                oldObj = ticketManipulator.wait_to_commit(newObj, backup);
                activityAdder.sequenceIdManager.id_replaced = true;
                activities = activityAdder.functionality.build_activities_wrapper();
            }
            newObj.Activity = activities;
            
            ticketManipulator.remove_loading();
            activityAdder.functionality.ui_commit(newObj, oldObj);
        },

        ui_commit: function(new_obj, old_obj) {
            kendo.confirm("Are you sure you want to modify activities?").then(function(){
                ticketManipulator.show_loading();
                ticketManipulator.commit_new_obj(new_obj, old_obj, function(){
                    ticketManipulator.remove_loading();
                    kendo.alert("Successfully modified activities.");
                    window.location.replace(window.location.href);
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
            if (cache === undefined || cache.length <= 6) {
                load_data();
            } else {
                activityAdder.properties.comboBox.dataSource = cache;
            }
            activityAdder.getters.get_input().kendoComboBox(activityAdder.properties.comboBox);
        }, 

        start: function() {
            activityAdder.main.setup();
        }
    }
}

activityAdder.main.start();