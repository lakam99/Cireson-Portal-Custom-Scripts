var referenceRender = {
    ticket: undefined,
    waiter: undefined,
    captureString:"~!~!",
    setup: function() {
        return new Promise((resolve,reject)=>{
            referenceRender.waiter = setInterval(()=>{
                if (rawJSON !== undefined) {
                    clearInterval(referenceRender.waiter);
                    var start = rawJSON.Notes.indexOf(referenceRender.captureString) + referenceRender.captureString.length;
                    var end = rawJSON.Notes.lastIndexOf(referenceRender.captureString);
                    if (start != referenceRender.captureString.length - 1 && end != -1) { 
                        var og_ticket_id = rawJSON.Notes.substring(start, end);
                        resolve(og_ticket_id);
                    } else {
                        reject(rawJSON.Notes);
                    }
                }
            }, 500);
        });
    },

    render: function(ticket_data) {
        if (ticket_data !== undefined) {
            ticket_data.FileAttachment.forEach((attachment)=>{
                if (attachment.AddedBy === undefined) {
                    attachment.AddedBy = {
                        "Id": null,
                        "DisplayName": ""
                    }
                }
                customSettings.helperFunctions.monitorCopy.ticket.FileAttachment.push(attachment);
            });
        }
    },

    start: function() {
        referenceRender.setup().then((og_id)=>{
            $.ajax({
                url: window.location.origin + "/api/V3/Projection/GetProjection",
                type: "get",
                data: {
                    id: og_id,
                    typeProjectionId:'e44b7c06-590d-64d6-56d2-2219c5e763e0' //srq-projection-id
                },
                success: referenceRender.render
            })
        }).catch((r)=>{console.warn('Failed to get id from ' + r)});
    }
}

referenceRender.start();