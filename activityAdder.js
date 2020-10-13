//Written by Arkam Mazrui for the Cireson web portal
//arkam.mazrui@nserc-crsng.gc.ca
//arkam.mazrui@gmail.com

var activityAdder = {
    properties = {
        activity_adder_html: "<div id='activity_adder'></div>",
        input_html: "<div id='activity_input_container'><input id='activity_adder_select'/></div>",
        dialog: {
            width: "502px",
            title: "Add Activity",
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
        activityClasses = [
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
            r.content = activityAdder.properties.input_html;
            r.actions = [
                {text: "Apply", action: activityAdder.functionality.apply, primary: true},
                {text: "Cancel", action: activityAdder.functionality.cancel, primary: false}
            ];
            return r;
        },

        get_activity_adder: function() {
            return $("#activity_adder");
        },

        get_dialog_window: function() {
            return activityAdder.getters.get_activity_adder().data("kendoDialog");
        },

        get_input: function() {
            return $("#activity_adder_select");
        },

        get_combobox: function() {
            return activityAdder.getters.get_input().data("kendoComboBox");
        },

        get_selected_template_id: function() {
            return activityAdder.getters.get_combobox().value();
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
            activityAdder.properties.activityClasses.forEach(function(id){
                $.ajax({
                    dataType: "json",
                    type: "get",
                    async: false,
                    url: window.location.origin + "/api/V3/Template/GetTemplates",
                    data: {classId:id},
                    success: function(res){
                        activityAdder.properties.comboBox.dataSource.push(res);
                    }
                });
            });
        },

        function() {
            //build UI
            $("body").append(activityAdder.properties.activity_adder_html);
            activityAdder.getters.get_activity_adder().kendoDialog(activityAdder.getters.get_dialog());
            activityAdder.getters.get_input().kendoComboBox(activityAdder.properties.comboBox);
        },

        function() {
            //create task
            app.custom.formTasks.add('ServiceRequest', 'Add Activity', function(formObj, viewModel){
                activityAdder.setters.set_ticket_info(formObj, viewModel);
                activityAdder.getters.get_dialog_window().open();
            });
        }
    ],

    functionality: {
        cancel: function() {return true},
        apply: function() {return true}
    },

    main: {
        setup: function() {
            activityAdder.setup.forEach(function(f){f()});
        }, 

        start: function() {
            $(document).ready(function(){
                activityAdder.main.setup();
            });
        }
    }
}

activityAdder.main.start();