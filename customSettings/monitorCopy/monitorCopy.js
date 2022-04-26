customSettings.helperFunctions.monitorCopy = {};
var c = customSettings.helperFunctions.monitorCopy;
c.ticket = customGlobalLoader.ticket;

var monitorCopyOn = async function() {
    var s_name = "monitorCopy";
    var field = "input[name='Title']";
    var required = settings_controller.get_setting_value(s_name);
    if (required) {
        debugger;
        required = settings_controller.get_setting(s_name);
        required.data.RelatesToWorkItem.forEach((workitem)=>{c.ticket.RelatesToWorkItem.addItem(workitem)});
        c.ticket.RelatesToWorkItem.addItem(required.data);
        required.data.RelatesToConfigItem.forEach((configitem)=>{c.ticket.RelatesToConfigItem.push(configitem)});
        if (c.ticket.Notes === null) {c.ticket.Notes = ''}
        c.ticket.Notes += `~!~!${required.data.Id}~!~!`;
        required.data.FileAttachment.forEach((attachment)=>{
            c.ticket.FileAttachment.push(attachment);
        });
        c.ticket.Title += " (Copy)";
        $(field).val(c.ticket.Title);
        settings_controller.set_setting(s_name, {value:false});
    } else {
        $(document).ready(function(){
            var e = setInterval(function(){
                if ($(".taskmenu").length) {
                    clearInterval(e);
                    $("li.link[data-bind='click: copyToNewWI']").on("click", function(){
                        settings_controller.set_setting(s_name, {value: true, data:c.ticket});
                        $("li.link[data-bind='click: copyToNewWI']").off("click");
                    });
                }
            }, 100);
        });
    }
}

var monitorCopyOff = function() {
}