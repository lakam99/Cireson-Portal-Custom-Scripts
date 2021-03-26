customSettings.helperFunctions.monitorCopy = {};
var c = customSettings.helperFunctions.monitorCopy;

c.load_ticket = function() {
    return new Promise(function(resolve,reject){
        formTasks.addFormTask(formTasks.type.both, null, formTasks.permissions.sc, function(f, v){
            c.ticket = v;
            resolve(true);
        });
    });
}

var monitorCopyOn = async function() {
    c.load_ticket().then(function(){
        var s_name = "monitorCopy";
        var field = "input[name='Title']";
        var required = settings_controller.get_setting_value(s_name);
        if (required) {
            c.ticket.RelatesToWorkItem.addItem(settings_controller.get_setting(s_name).data);
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
    });
}

var monitorCopyOff = function() {
}