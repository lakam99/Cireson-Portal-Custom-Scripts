//Written by Arkam Mazrui for the Cireson web portal
//arkam.mazrui@nserc-crsng.gc.ca
//arkam.mazrui@gmail.com

var INCIDENT = 0;
var SRQ = 1;

var url = ["/Incident/Edit/", "/ServiceRequest/Edit/"];

var ticketConverter = {
    properties: {
        currentTicket: {
            formObj: null,
            viewModel: null
        },

        incident: {
            templateId: "a77bb0c9-e201-dd93-230c-799a66d9e8fa",
            classId: "546744ba-1aff-60af-4fa0-326aa3d73846"
        },

        serviceRequest: {
            templateId: "1954fe8d-e4ae-3600-e5e6-f7947acb6803",
            classId:  "1cba7c99-4050-2749-fde9-2ed267208427"
        },

        replace_properties: "/CustomSpace/CustomData/ticketConverter/ticketConverterProperties.json",

        translate_properties: {
            "AppliesToWorkItem": "AppliesToTroubleTicket",
            "AppliesToTroubleTicket": "AppliesToWorkItem"
        }
    },

    getters: {
        get_templateId: function(type) {
            return (type === INCIDENT ? ticketConverter.properties.incident.templateId:
                    ticketConverter.properties.serviceRequest.templateId);
        },
    
        get_classId: function(type) {
            return (type === INCIDENT ? ticketConverter.properties.incident.classId:
                    ticketConverter.properties.serviceRequest.classId);
        },
    
        get_currentTicket: function() {
            return ticketConverter.properties.currentTicket;
        }
    },

    setters: {
        set_currentTicket: function(formObj, viewModel) {
            ticketConverter.properties.currentTicket.formObj = formObj;
            ticketConverter.properties.currentTicket.viewModel = viewModel;
        }
    },

    setup: [
        function(){
            $.ajax({
                url: window.location.origin + ticketConverter.properties.replace_properties,
                type: "get",
                dataType: "json",
                async: false,
                success: function(res){
                    ticketConverter.properties.replace_properties = res;
                }
            });
        },

        function() {
            app.custom.formTasks.add("Incident", "Convert to Service Request", function(formObj, viewModel) {
                ticketConverter.setters.set_currentTicket(formObj, viewModel);
                ticketConverter.functionality.apply(SRQ);
            });
            app.custom.formTasks.add("ServiceRequest", "Convert to Incident", function(formObj, viewModel) {
                ticketConverter.setters.set_currentTicket(formObj, viewModel);
                ticketConverter.functionality.apply(INCIDENT);
            });
        }
    ],

    functionality: {
        apply: async function(type) {
            ticketManipulator.show_loading();
            var template_id = ticketConverter.getters.get_templateId(type);
            var old_obj = ticketConverter.getters.get_currentTicket().viewModel;
            var new_obj = ticketManipulator.deep_copy(old_obj);
            var temp_name = null;
            var og_convert_obj = await ticketManipulator.request_template_obj(template_id);
            var convert_obj = ticketManipulator.deep_copy(og_convert_obj);
            
            //use new_obj so old_obj doesn't risk getting changed
            ticketConverter.properties.replace_properties.forEach(function(property){
                if (ticketConverter.properties.translate_properties[property]) {
                    convert_obj[ticketConverter.properties.translate_properties[property]] = new_obj[property];
                } else if (convert_obj[property] !== undefined) {
                    convert_obj[property] = new_obj[property];
                }
            });

            ticketManipulator.set_obj_status(new_obj, ticketManipulator.constants.statuses.completed);
            ticketManipulator.remove_loading();
            ticketConverter.functionality.ui_commit(old_obj, new_obj, convert_obj, og_convert_obj, type);
        },

        ui_commit: function(old_obj, new_obj, convert_obj, og_convert_obj, type) {
            kendo.confirm("Are you sure you want to convert this ticket?").then(function(){
                ticketManipulator.show_loading();
                ticketManipulator.commit_new_obj(new_obj, old_obj, function(){
                    ticketManipulator.commit_new_obj(convert_obj, og_convert_obj, function(res){
                        ticketManipulator.remove_loading();
                        kendo.alert("<a href='" + window.location.origin+url[type]+res.Id+ "/'>Ticket successfully converted!</a>");
                    });
                });
            });
        }
    },

    main: {
        start: function() {
            $(document).ready(function(){
                ticketConverter.setup.forEach(function(f){f()});
            });
        }
    }
}

ticketConverter.main.start();