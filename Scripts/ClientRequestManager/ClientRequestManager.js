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
                    resolve(xhr.responseText);
                }
            };
            xhr.send();
        });

        return result;
    },

    get_misc_file: function(name) {
        var _url = customGlobalLoader.get_url(name);
        return ClientRequestManager.get_str_url(_url, "json", true);
    },

    get_str_url: function(_url, _type, preformatted_url) {
        _type = _type ? _type:'text';
        _url = preformatted_url ? _url:customGlobalLoader.get_str_url(_url);
        return new Promise(function(resolve, reject){
            $.ajax({
                url: _url,
                type: "get",
                dataType: _type,
                async: true,
                success: function(r) {
                    resolve(r);
                },
                error: function(e) {
                    reject(e);
                }
            });
        });
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
