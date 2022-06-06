declare var require: any;
declare var customSettings: any;

var fs = require("fs");
var parser = require("eml-format");

var sendEmailTask = {
    fs: require("fs"),
    parser: require("eml-format"),
    ticket: null,

    setup: [
        function() {
            formTasks.addFormTask(formTasks.type.both, "Quick Reply", [formTasks.permissions.sc, formTasks.permissions.sm_mng],
            sendEmailTask.quickReply);
        }
    ],

    quickReply: function() {
        var ticket = customSettings.helperFunctions.monitorCopy.ticket;
        var attachments = ticket.FileAttachment;

        if (0 && attachments.length) {
            //todo
        } else {
            sendEmailTask.quickReplyTo(ticket, "\n\n\n");
        }
    },

    quickReplyTo: function(ticket, body) {
        var to = encodeURIComponent(ticket.RequestedWorkItem.Email);
        var cc = encodeURIComponent(`SupportCentral-SoutienCentral@nserc-crsng.gc.ca`);
        var subject = encodeURIComponent(`RE:[${ticket.Id}] ${ticket.Title}`);
        body = encodeURIComponent(body);
        var request = `mailto:${to}?subject=${subject}&cc=${cc}&body=${body}`;
        window.location = request.substring(0, 2000);
    },
    
    start: function() {
        sendEmailTask.setup.forEach(f => {f()});
    }
}

sendEmailTask.start();

