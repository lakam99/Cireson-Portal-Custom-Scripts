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

    send_request : function(request_type, url, request_data, enclose_params) {
        var result = new Promise(function(resolve, reject) {
            var xhr = new XMLHttpRequest();
            url = url + ClientRequestManager.params_to_url(request_data, enclose_params);
            xhr.open(request_type, url, true);
    
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
