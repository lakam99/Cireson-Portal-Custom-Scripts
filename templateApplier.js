//Written by Arkam Mazrui for the Cireson web portal
//arkam.mazrui@nserc-crsng.gc.ca
//arkam.mazrui@gmail.com

var templateApplier = {
    properties: {
        template_applier_html: `<div id='template_applier'></div>`,
        input_html: `<div id='template_input_container><input id='template_applier_select'/></div>'`,
        dialog: {
            width: "502px",
            title: "Apply Template",
            modal: true,
            visible: false,
            content: templateApplier.properties.input_html,
            actions: [
                {text: "Apply", action: templateApplier.functionality.apply, primary: true},
                {text: "Cancel", action: templateApplier.functionality.cancel, primary: false}
            ]
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
        }
    },

    getters: {
        get_template_applier: function() {
            return $("#template_applier");
        },

        get_input: function() {
            return $("#template_applier_select");
        }
    },

    functionality: {
        cancel: function() {return true},
        apply: function() {console.log("Placeholder apply!"); return true}
    },

    setup: [
        function() {
            //build UI
            $("body").append(templateApplier.properties.template_applier_html);
            templateApplier.getters.get_template_applier().kendoDialog(templateApplier.properties.dialog);
            templateApplier.getters.get_input().kendoComboBox(templateApplier.properties.comboBox);
        },

        function() {
            //create task
            app.custom.formTasks.add('ServiceRequest', 'Apply Template', function(formObj, viewModel){
                console.log(formObj);
                console.log(viewModel);
                $("#my_modal").data("kendoDialog").open();
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