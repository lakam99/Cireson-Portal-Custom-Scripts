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
        whitelist: ["Activity", "Area"],
        resolveFunc: null
    },

    constants: {
        statuses: {
            submitted: {Id: "72b55e17-1c7d-b34c-53ae-f61f8732e425", Name: "Submitted"},
            in_progress: {Id: "59393f48-d85f-fa6d-2ebe-dcff395d7ed1", Name: "In Progress"}
        }
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
            templateApplier.getters.get_dialog_window().close();
            var current_obj = templateApplier.properties.currentTicket.viewModel;
            templateApplier.functionality.show_loading();
            current_obj = await templateApplier.functionality.trigger_workflow_or_update_required(current_obj);
            var selected = templateApplier.getters.get_selected_template_id();
            var templateObj = await templateApplier.functionality.request_template_obj(selected);
            if (templateObj.ClassTypeId !== current_obj.ClassTypeId) {
                kendo.alert("Cannot apply template with class " + templateObj.ClassName +
                ' to object of type ' + current_obj.ClassName + '.');
                return;
            }
            var whitelist = templateApplier.getters.get_whitelisted_properties();
            var new_obj = templateApplier.functionality.replace_properties(current_obj, templateObj, whitelist);
            templateApplier.functionality.set_obj_status(new_obj, templateApplier.constants.statuses.in_progress);
            templateApplier.functionality.remove_loading();
            templateApplier.functionality.ui_commit_new_obj(new_obj, current_obj);
        },

        show_loading: function() {
            $("body").append(templateApplier.properties.loader_html);
            kendo.ui.progress($("#loader_overlay"), true);
        },
        
        remove_loading: function() {
            $("#template_applier_select").remove();
        },

        deep_copy(obj) {
            var r = $.extend([], obj);
            Object.keys(r).forEach(function(property){
                if (r[property] != undefined && r[property] != null && typeof(r[property]) === "object") {
                    r[property] = $.extend({}, r[property]);
                }
            });
            return r;
        },

        replace_properties: function(main_obj, replacement_obj, whitelist_properties) {
            var r = templateApplier.functionality.deep_copy(main_obj);
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

        status_eq: function(s1, s2) {return s1.Id === s2.Id && s1.Name === s2.Name;},

        set_obj_status: function(obj, set_to_status) {
            obj.Status.Id = set_to_status.Id;
            obj.Status.Name = set_to_status.Name;
        },

        trigger_workflow_or_update_required: async function(obj) {
            return new Promise(function(resolve, reject){
                templateApplier.properties.resolveFunc = function(resolve_obj) {resolve(resolve_obj)}
                if (!templateApplier.functionality.status_eq(obj.Status, templateApplier.constants.statuses.submitted)) {
                    var new_obj = templateApplier.functionality.deep_copy(obj);
                    templateApplier.functionality.set_obj_status(new_obj, templateApplier.constants.statuses.submitted);
                    templateApplier.functionality.commit_new_obj(new_obj, obj, function(resolve){
                        templateApplier.properties.resolveFunc(new_obj);
                    });
                } else {
                    resolve(obj);
                }
            });
        },

        request_template_obj: async function(templateId) {
            var req = {id: templateId, createdById: session.user.Id};
            var url = window.location.origin + '/api/V3/Projection/CreateProjectionByTemplate';
            var r = await ClientRequestManager.send_request("get", url, req, false);
            return JSON.parse(r);
        },

        generate_commit_data: function(new_obj, old_obj) {
          return {
              formJSON: {
                  original: old_obj,
                  current: new_obj
              }
          };  
        },

        commit_new_obj: function(new_obj, old_obj, callback) {
            $.ajax({
                url: '/api/V3/Projection/Commit',
                type: 'post',
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                data: JSON.stringify(templateApplier.functionality.generate_commit_data(new_obj, old_obj)),
                success: callback,
                error: function(o, status, msg) {
                    console.log("An error occured: " + status + ": " + msg);
                    console.log(o.responseJSON.exception);
                }
            });
        },

        ui_commit_new_obj: function(new_obj, old_obj) {
            kendo.confirm("Are you sure you want to apply this template?").then(function(){
                templateApplier.functionality.show_loading();
                templateApplier.functionality.commit_new_obj(new_obj, old_obj, function(result) {
                    templateApplier.functionality.remove_loading();
                    kendo.alert("<a href='"+window.location.href+"'>Template successfully applied!</a>");
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
            app.custom.formTasks.add('ServiceRequest', 'Apply Template', function(formObj, viewModel){
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
            $(document).ready(function(){
                templateApplier.main.setup();
            });
        }
    }
}

templateApplier.main.start();