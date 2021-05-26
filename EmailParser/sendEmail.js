var eml_format = null;
var mod = window.location.origin + "/CustomSpace/Scripts/sendEmailTask/node_modules/eml-format/lib/eml-format.js";
define([mod, 'eml-format'], function(re){
    eml_format = require('eml-format');
});


var sendEmailTask = {
    ticket: null,
    setup: [
        function () {
            formTasks.addFormTask(formTasks.type.both, "Quick Reply", formTasks.permissions.sc, sendEmailTask.quickReply);
        }
    ],
    quickReply: function () {
        var ticket = customSettings.helperFunctions.monitorCopy.ticket;
        var attachments = ticket.FileAttachment;
        if (0 && attachments.length) {
            //todo
        }
        else {
            sendEmailTask.quickReplyTo(ticket, "\n\n\n___________________________________");
        }
    },
    quickReplyTo: function (ticket, body) {
        var to = encodeURIComponent(ticket.RequestedWorkItem.Email);
        var cc = encodeURIComponent("SupportCentral-SoutienCentral@nserc-crsng.gc.ca");
        var subject = encodeURIComponent("RE:[" + ticket.Id + "] " + ticket.Title);
        body = encodeURIComponent(body);
        var request = "mailto:" + to + "?subject=" + subject + "&cc=" + cc + "&body=" + body;
        window.location = request.substring(0, 2000);
    },
    start: function () {
        sendEmailTask.setup.forEach(function (f) { f(); });
    }
};
sendEmailTask.start();
