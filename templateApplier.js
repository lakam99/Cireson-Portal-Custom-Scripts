//Written by Arkam Mazrui for the Cireson web portal
//arkam.mazrui@nserc-crsng.gc.ca
//arkam.mazrui@gmail.com

var templateApplier = {
    properties: {
        template_applier_html: `<div id='template_applier'></div>`,
        input_html: `<div id='template_input_container'><input id='template_applier_select'/></div>'`,
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
                        url: "http://ottansm2/api/V3/Template/GetTemplates",
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
            templateApplier.getters.get_dialog_window().close();
            var selected = templateApplier.getters.get_selected_template_id();
            var templateObj = await templateApplier.functionality.request_template_obj(selected);
            var current_obj = templateApplier.properties.currentTicket.viewModel;
            if (templateObj.ClassTypeId !== current_obj.ClassTypeId) {
                kendo.alert("Cannot apply template with class " + templateObj.ClassName + ` to 
                object of type ` + current_obj.ClassName + '.');
                return;
            }
            var whitelist = templateApplier.getters.get_whitelisted_properties();
            var new_obj = templateApplier.functionality.replace_properties(current_obj, templateObj, whitelist);
            templateApplier.functionality.set_first_activity_in_progress(new_obj);
            templateApplier.functionality.commit_new_obj(new_obj, current_obj);

        },

        replace_properties: function(main_obj, replacement_obj, whitelist_properties) {
            var r = $.extend([], main_obj);
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

        set_first_activity_in_progress(obj) {
            if (obj.Activity.length) {
                obj.Activity[0].Status.Id = "11fc3cef-15e5-bca4-dee0-9c1155ec8d83";
                obj.Activity[0].Status.Name = "In Progress";
            }
            /**if (obj.Activity && obj.Activity.length) {
                return templateApplier.functionality.set_first_activity_in_progress(obj.Activity[0]);
            } else {
                obj.Status.Id = "11fc3cef-15e5-bca4-dee0-9c1155ec8d83";
                obj.Status.Name = "In Progress";
            }**/
        },

        request_template_obj: async function(templateId) {
            var req = {id: templateId, createdById: session.user.Id};
            var url = window.location.origin + '/api/V3/Projection/GetProjectionByTemplateWithParameter';
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

        commit_new_obj: function(new_obj, old_obj) {
            kendo.confirm("Are you sure you want to apply this template?").then(function(){
                $.ajax({
                    url: '/api/V3/Projection/Commit',
                    type: 'post',
                    contentType: 'application/json; charset=utf-8',
                    dataType: 'json',
                    data: JSON.stringify(templateApplier.functionality.generate_commit_data(new_obj, old_obj)),
                    success: function(result) {
                        kendo.alert(`<a href='`+window.location.href+`'>
                        Template successfully applied!</a>`);
                    },
                    error: function(o, status, msg) {
                        console.log("An error occured: " + status + ": " + msg);
                        console.log(o.responseJSON.exception);
                    }
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