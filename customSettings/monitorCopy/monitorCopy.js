customSettings.helperFunctions.monitorCopy = {};
var c = customSettings.helperFunctions.monitorCopy;

c.load_ticket = function() {
    return new Promise(function(resolve,reject){
        app.custom.formTasks.add("ServiceRequest", null, function(f, v){
            c.ticket = v;
            resolve(true);
        });
    });
}

var monitorCopyOn = async function() {
    c.load_ticket().then(function(){
        var s_name = "monitorCopy";
        var required = settings_controller.get_setting_value(s_name);
        if (required) {
            c.ticket.RelatesToWorkItem.addItem(settings_controller.get_setting(s_name).data);
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