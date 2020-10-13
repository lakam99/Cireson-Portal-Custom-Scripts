//Written by Arkam Mazrui for the Cireson web portal
//arkam.mazrui@nserc-crsng.gc.ca
//arkam.mazrui@gmail.com


var ticketManipulator = {
    properties: {
        loader_html: "<div class='k-overlay' id='loader_overlay' style='z-index: 12002; opacity: 0.5;'></div>",
    },

    show_loading: function() {
        $("body").append(ticketManipulator.properties.loader_html);
        kendo.ui.progress($("#loader_overlay"), true);
    },
    
    remove_loading: function() {
        $("#template_applier_select").remove();
    },

    deep_copy(obj) {
        var r = $.extend({}, obj);
        Object.keys(r).forEach(function(property){
            if (r[property] != undefined && r[property] != null && typeof(r[property]) === "object") {
                r[property] = $.extend({}, r[property]);
            }
        });
        return r;
    },

    request_template_obj: async function(templateId) {
        var req = {id: templateId, createdById: session.user.Id};
        var url = window.location.origin + '/api/V3/Projection/CreateProjectionByTemplate';
        var r = await ClientRequestManager.send_request("get", url, req, false);
        return JSON.parse(r);
    },

    generate_commit_data: function(new_obj, old_obj) {
      return {
          formJSON: {
              original: old_obj,
              current: new_obj
          }
      };  
    },

    commit_new_obj: function(new_obj, old_obj, callback) {
        $.ajax({
            url: '/api/V3/Projection/Commit',
            type: 'post',
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            data: JSON.stringify(ticketManipulator.generate_commit_data(new_obj, old_obj)),
            success: callback,
            error: function(o, status, msg) {
                console.log("An error occured: " + status + ": " + msg);
                console.log(o.responseJSON.exception);
            }
        });
    }
}