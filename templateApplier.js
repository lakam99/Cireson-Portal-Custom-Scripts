//Written by Arkam Mazrui for the Cireson web portal
//arkam.mazrui@nserc-crsng.gc.ca
//arkam.mazrui@gmail.com

var templateApplier = {
    properties: {
        template_applier_html: "<div id='template_applier'></div>",
        input_html: "<div id='template_input_container'><input id='template_applier_select'/></div>",
        loader_html: "<div class='k-overlay' id='loader_overlay' style='z-index: 12002; opacity: 0.5;'></div>",
        dialog: {
            width: "502px",
            title: "Apply Template",
            modal: true,
            visible: false,
        },
        comboBox: {
            dataTextField: "Name",
            dataValueField: "Id",
            dataSource: {
                transport: {
                    read: {
                        dataType: "json",
                        type: "get",
                        url: window.location.origin + "/api/V3/Template/GetTemplates",
                        data: {
                            classId: '04b69835-6343-4de2-4b19-6be08c612989'
                        }
                    }
                }
            },
            filter: "contains",
            suggest: true,
            index: 0
        },
        currentTicket: {
            formObj: null,
            viewModel: null
        },
        whitelist: ["Activity", "Area"]
    },

    getters: {
        get_dialog: function() {
            var r = templateApplier.properties.dialog;
            r.content = templateApplier.properties.input_html;
            r.actions = [
                {text: "Apply", action: templateApplier.functionality.apply, primary: true},
                {text: "Cancel", action: templateApplier.functionality.cancel, primary: false}
            ];
            return r;
        },

        get_template_applier: function() {
            return $("#template_applier");
        },

        get_dialog_window: function() {
            return templateApplier.getters.get_template_applier().data("kendoDialog");
        },

        get_input: function() {
            return $("#template_applier_select");
        },

        get_combobox: function() {
            return templateApplier.getters.get_input().data("kendoComboBox");
        },

        get_selected_template_id: function() {
            return templateApplier.getters.get_combobox().value();
        },

        get_whitelisted_properties: function() {
            return templateApplier.properties.whitelist;
        }
    },

    setters: {
        set_ticket_info: function(formObj, viewModel) {
            templateApplier.setters.set_formObj(formObj);
            templateApplier.setters.set_viewModel(viewModel);
        },

        set_formObj: function(formObj) {
            templateApplier.properties.currentTicket.formObj = formObj;
        },

        set_viewModel: function(viewModel) {
            templateApplier.properties.currentTicket.viewModel = viewModel;
        }
    },

    functionality: {
        cancel: function() {return true},

        apply: async function() {
            templateApplier.properties.comboBox_value = templateApplier.getters.get_selected_template_id(); 
            templateApplier.getters.get_dialog_window().close();
            var current_obj = templateApplier.properties.currentTicket.viewModel;
            ticketManipulator.show_loading();
            current_obj = await ticketManipulator.trigger_workflow_or_update_required(current_obj);
            var selected = templateApplier.getters.get_selected_template_id();
            var templateObj = await ticketManipulator.request_template_obj(selected);
            if (templateObj.ClassName !== current_obj.ClassName) {
                kendo.alert("Cannot apply template with class " + templateObj.ClassName +
                ' to object of type ' + current_obj.ClassName + '.');
                return;
            }
            var whitelist = templateApplier.getters.get_whitelisted_properties();
            var new_obj = templateApplier.functionality.replace_properties(current_obj, templateObj, whitelist);
            ticketManipulator.adaptive_set_obj_status(new_obj, ticketManipulator.constants.statuses.in_progress);
            ticketManipulator.remove_loading();
            templateApplier.functionality.ui_commit_new_obj(new_obj, current_obj);
        },

        replace_properties: function(main_obj, replacement_obj, whitelist_properties) {
            var r = ticketManipulator.deep_copy(main_obj);
            if (!whitelist_properties || !Array.isArray(whitelist_properties)) {
                whitelist_properties = [];
            }

            whitelist_properties.forEach(function(property) {
                if (replacement_obj[property] === undefined) {
                    delete r[property];
                } else {
                   r[property] = replacement_obj[property];
                }
            });

            return r;
        },

        ui_commit_new_obj: function(new_obj, old_obj) {
            kendo.confirm("Are you sure you want to apply this template?").then(function(){
                ticketManipulator.show_loading();
                ticketManipulator.commit_new_obj(new_obj, old_obj, function(result) {
                    ticketManipulator.remove_loading();
                    kendo.alert("Template successfully applied!");
                    window.location.reload();
                });
            });
        }
    },

    setup: [
        function() {
            //build UI
            $("body").append(templateApplier.properties.template_applier_html);
            templateApplier.getters.get_template_applier().kendoDialog(templateApplier.getters.get_dialog());
            templateApplier.getters.get_input().kendoComboBox(templateApplier.properties.comboBox);
        },

        function() {
            //create task
            formTasks.addFormTask(formTasks.type.srq, 'Apply Template', [formTasks.permissions.sc, formTasks.permissions.sm_mng],
             function(formObj, viewModel){
                templateApplier.setters.set_ticket_info(formObj, viewModel);
                templateApplier.getters.get_dialog_window().open();
            });
        }
    ],

    main: {
        setup: function() {
            templateApplier.setup.forEach(function(f){f()});
        },

        start: function() {
            templateApplier.main.setup();
        }
    }
}

templateApplier.main.start();