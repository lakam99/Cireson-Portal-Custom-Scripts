//Written by Arkam Mazrui for the Cireson web portal
//arkam.mazrui@nserc-crsng.gc.ca
//arkam.mazrui@gmail.com


var ticketManipulator = {
    properties: {
        loader_html: "<div class='k-overlay' id='loader_overlay' style='z-index: 12002; opacity: 0.5;'></div>",
        resolveFunc: null
    },

    constants: {
        statuses: {
            submitted: {srq: {Id: "72b55e17-1c7d-b34c-53ae-f61f8732e425", Name: "Submitted"},
                        inc: {}},
            in_progress: {srq: {Id: "59393f48-d85f-fa6d-2ebe-dcff395d7ed1", Name: "In Progress"},
                          inc: {}},
            completed: {srq: {Id: "b026fdfd-89bd-490b-e1fd-a599c78d440f", Name: "Completed"},
                        inc: {Id: "2b8830b6-59f0-f574-9c2a-f4b4682f1681", Name: "Resolved"}},
            pending: {srq: {Id: "50c667cf-84e5-97f8-f6f8-d8acd99f181c", Name: "Pending"},
                      inc: {}}
        }
    },

    show_loading: function() {
        $("body").append(ticketManipulator.properties.loader_html);
        kendo.ui.progress($("#loader_overlay"), true);
    },
    
    remove_loading: function() {
        $("#loader_overlay").remove();
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

    non_async_request_template_obj: function(templateId) {
        var req = {id: templateId, createdById: session.user.Id};
        var url = window.location.origin + '/api/V3/Projection/CreateProjectionByTemplate';
        var r = waiter.request("get", url, req, false);
        return waiter.get_return();
    },

    generate_commit_data: function(new_obj, old_obj) {
      return {
          formJSON: {
              original: old_obj,
              current: new_obj
          }
      };  
    },

    wait_to_commit: function(new_obj, old_obj) {
        var req = ticketManipulator.generate_commit_data(new_obj, old_obj);
        return new Promise(function(resolve,reject){
            $.ajax({
                url: window.location.origin+"/api/V3/Projection/Commit",
                type: "post",
                contentType: 'application/json; charset=utf-8',
                dataType: "json",
                data: JSON.stringify(req),
                async: false,
                success: function() {
                    resolve();
                },
                error: function(e) {
                    console.error("ticketManipulator.wait_to_commit failed.");
                    console.error(e);
                    reject();
                }
            });
        });
    },

    commit_new_obj: function(new_obj, old_obj, callback) {
        $.ajax({
            url: window.location.origin+'/api/V3/Projection/Commit',
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
    },

    status_eq: function(s1, s2) {return s1.Id === s2.Id && s1.Name === s2.Name;},

    set_obj_status: function(obj, set_to_status) {
        obj.Status.Id = set_to_status.Id;
        obj.Status.Name = set_to_status.Name;
    },

    adaptive_set_obj_status: function(obj, set_to_status) {
        var type = obj.FullClassName == "Incident" ? 1:0; //INC:SRQ
        var status = type == 1 ? set_to_status.inc:set_to_status.srq;
        ticketManipulator.set_obj_status(obj, status);
    },

    trigger_workflow_or_update_required: async function(obj) {
        return new Promise(function(resolve, reject){
            var status = obj.FullClassName == "Incident" ? ticketManipulator.constants.statuses.in_progress.inc:ticketManipulator.constants.statuses.in_progress.srq;
            ticketManipulator.properties.resolveFunc = function(resolve_obj) {resolve(resolve_obj)}
            if (!ticketManipulator.status_eq(obj.Status, status)) {
                var new_obj = ticketManipulator.deep_copy(obj);
                ticketManipulator.set_obj_status(new_obj, status);
                ticketManipulator.commit_new_obj(new_obj, obj, function(resolve){
                    ticketManipulator.properties.resolveFunc(new_obj);
                });
            } else {
                resolve(obj);
            }
        });
    },
}