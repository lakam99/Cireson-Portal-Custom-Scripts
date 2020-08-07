var apiCaller = {
    request_in_progress: false,
    
    is_request_in_progress: function() {return apiCaller.request_in_progress;},
    set_request_in_progress: function(value) {apiCaller.request_in_progress = value;}, 

    params_to_url: function(params, enclose_params) {
        if (enclose_params===null){enclose_params=true;}
        var keys = Object.keys(params);
        var r = "?";
        var l = keys.length - 1;
        keys.forEach(function(n, i) {
            r += n + "=";
            if (enclose_params) {r+= "{" + params[n] + "}";}
            else {r+= params[n];}
            if (i < l) {
                r += "&";
            }
        });
        return r;
    },

    send_request: function(method, url, parameters, callback, enclose_params) {
        if (apiCaller.is_request_in_progress()) {return;}
        if (enclose_params===null){enclose_params=true;}
        let real_url = url + this.params_to_url(parameters, enclose_params);
        let xhr = new XMLHttpRequest();

        xhr.open(method, real_url, false);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                apiCaller.set_request_in_progress(false);
                callback(xhr.responseText);
            }
        }

        apiCaller.set_request_in_progress(true);
        xhr.send();
    }


};

var waiter = {
    r: null,
    first_time: true,
    get_return: function() {return this.r;},
    set_r: function(value) {waiter.r = value;},
    request: function(method, url, parameters, enclose_params) {
        if (apiCaller.is_request_in_progress()) {return};
        if (enclose_params===null){enclose_params=false;}
        apiCaller.send_request(method, url, parameters, waiter.set_r, enclose_params);
    }
}

function do_x(callback, num) {
    for (i = 0; i < num; i++) {
        callback();
    }
}