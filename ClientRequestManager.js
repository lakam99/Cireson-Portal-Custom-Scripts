//Written by Arkam Mazrui for the Cireson web portal
//arkam.mazrui@nserc-crsng.gc.ca
//arkam.mazrui@gmail.com

var ClientRequestManager = {
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

    send_request : function(request_type, url, request_data, enclose_params, async) {
        var result = new Promise(function(resolve, reject) {
            var xhr = new XMLHttpRequest();
            if (async===undefined){async=true};
            url = url + ClientRequestManager.params_to_url(request_data, enclose_params);
            xhr.open(request_type, url, async);
    
            xhr.onreadystatechange = function () {
                if (xhr.readyState === XMLHttpRequest.DONE) {
                    console.log("Received response from " + url + ": " + xhr.responseText);
                    if (xhr.responseText.includes("Err0r")) {
                        alert(xhr.responseText);
                    } else {
                        console.log("ClientRequestManager resolving.");
                        resolve(xhr.responseText);
                    }
                }
            };
            xhr.send();
        });

        return result;
    }
};

var waiter = {
    r: null,
    get_return: function(){return waiter.r},
    set_r: function(value){waiter.r = value},
    request: async function(method,url,parameters,enclose_params) {
        if (enclose_params===undefined){enclose_params=false}
        else if (enclose_params) {parameters = ClientRequestManager.enclose_params(enclose_params)}
        $.ajax({
            type: method,
            url: url,
            data: parameters,
            async: false,
            success: function(r){waiter.set_r(r)}
        });
    }

}
