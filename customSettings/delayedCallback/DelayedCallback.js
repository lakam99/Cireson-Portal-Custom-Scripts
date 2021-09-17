customSettings.helperFunctions.delayedCallback = {};
var _monitorCopy = customSettings.helperFunctions.monitorCopy;
var delayedCallback = customSettings.helperFunctions.delayedCallback;
delayedCallback.setting_name = "delayedCallback-queue";

delayedCallback.get_queue = function() {
    var settings_queue = settings_controller.get_setting(delayedCallback.setting_name);
    if (settings_queue.data === undefined) {
        console.warn("RESETTING DELAYED CALLBACK QUEUE");
        settings_queue = {data:[]};
        settings_controller.set_setting(delayedCallback.setting_name, settings_queue);
    }
    return settings_queue;
}

delayedCallback.queue_callback = function(callback) {
    settings_controller.append_setting(delayedCallback.setting_name, 'var f = ' + callback.toString());
}

delayedCallback.pop_queue = function(size) {
    var queue_size = delayedCallback.get_queue().data.length;
    if (queue_size < size) {
        throw Error(size + " too large a size for queue of length " + queue_size + ".");
    } else {
        settings_controller.de_append_multiple(delayedCallback.setting_name, [...Array(size).keys()]); //range(size)
    }
}

delayedCallback.run_queue = function() {
    var _run_queue = setInterval(function(){
        var queue = delayedCallback.get_queue().data;
        if (queue.length) {
            queue.forEach(function(item){
                eval(item);
                f();
            })
            delayedCallback.pop_queue(queue.size);
        }
    }, 100);
    
}

var delayedCallbackOn = function() {
    var w8_mon = setInterval(function(){
        if (_monitorCopy.load_ticket !== undefined) {
            clearInterval(w8_mon);
            delayedCallback.run_queue();
        }
    }, 500);
}

var delayedCallbackOff = function() {
}