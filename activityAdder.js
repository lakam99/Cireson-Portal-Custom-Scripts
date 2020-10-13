//Written by Arkam Mazrui for the Cireson web portal
//arkam.mazrui@nserc-crsng.gc.ca
//arkam.mazrui@gmail.com

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
            return new Promise(async function(resolve){
                var r = null;
                for (var i = 0; i < activityAdder.properties.activityClasses.length; i++) {
                    r = await ClientRequestManager.send_request("get",
                     window.location.origin + "/api/V3/Template/GetTemplates",
                     {classId: activityAdder.properties.activityClasses[i]}, false);
                    
                    activityAdder.properties.comboBox.dataSource.push(JSON.parse(r));
                }
                resolve(true);
            });
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
            activityAdder.functionality.new_ui_activity(name, id);
        },

        apply: async function() {
            activityAdder.getters.get_dialog_window().close();
            ticketManipulator.show_loading();
            var template_ids = activityAdder.getters.get_selected_ids();
            var oldObj = activityAdder.properties.currentTicket.viewModel;
            var newObj = ticketManipulator.deep_copy(oldObj);
            var templates = [];
            var c = null;
            
            for (var i = 0; i < template_ids.length; i++) {
                c = await ticketManipulator.request_template_obj(template_ids[i]);
                templates.push(c);
            }

            templates.forEach(function(t){
                //too lazy to flatten
                newObj.Activity.push(t);
            });
            
            ticketManipulator.remove_loading();
            activityAdder.functionality.ui_commit(newObj, oldObj);
        },

        new_ui_activity: function(name, id) {
            $(".activity_inner").append(`
            <div class='activity_item' name='${id}'>
                ${name}
                <span class='activity_item_icons'>
                    <span class="fa fa-plus"></span>
                    <span class="fa fa-minus"></span>
                </span>
            </div>
            `);

            $(".fa-minus").off("click");
            $(".fa-minus").on("click", function(ev) {
                $(ev.target).parent().parent().remove();
            });
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
        setup: async function() {
            var wait =activityAdder.setup.shift();
            activityAdder.setup.forEach(function(f){f()});
            activityAdder.getters.get_input().kendoComboBox(activityAdder.properties.comboBox);
            var r = await wait();
            activityAdder.properties.comboBox.dataSource.shift();
            activityAdder.properties.comboBox.dataSource = [].concat.apply([],activityAdder.properties.comboBox.dataSource);
            activityAdder.getters.get_input().kendoComboBox(activityAdder.properties.comboBox);
        }, 

        start: function() {
            $(document).ready(function(){
                activityAdder.main.setup();
            });
        }
    }
}

activityAdder.main.start();