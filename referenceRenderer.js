//Written by Arkam Mazrui for the Cireson web portal
//arkam.mazrui@nserc-crsng.gc.ca
//arkam.mazrui@gmail.com

var referenceRender = {
    ticket: undefined,
    waiter: undefined,
    captureString:"~!~!",
    setup: function() {
        return new Promise((resolve,reject)=>{
            referenceRender.waiter = setInterval(()=>{
                if (customGlobalLoader.ticket !== undefined) {
                    clearInterval(referenceRender.waiter);
                    if (!customGlobalLoader.ticket.Notes) {reject(false)} else {
                        var start = customGlobalLoader.ticket.Notes.indexOf(referenceRender.captureString) + referenceRender.captureString.length;
                        var end = customGlobalLoader.ticket.Notes.lastIndexOf(referenceRender.captureString);
                        if (start != referenceRender.captureString.length - 1 && end != -1) { 
                            var og_ticket_id = customGlobalLoader.ticket.Notes.substring(start, end);
                            resolve(og_ticket_id);
                        } else {
                            reject(customGlobalLoader.ticket.Notes);
                        }
                    }
                }
            }, 500);
        });
    },

    render: function(ticket_data) {
        if (ticket_data !== undefined && ticket_data.FileAttachment !== undefined) {
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
            var projection = {'srq':'e44b7c06-590d-64d6-56d2-2219c5e763e0', 'inc': '2d460edd-d5db-bc8c-5be7-45b050cba652'}
            $.ajax({
                url: window.location.origin + "/api/V3/Projection/GetProjection",
                type: "get",
                data: {
                    id: og_id,
                    typeProjectionId:projection[og_id.substring(0, 3).toLowerCase()] //srq-projection-id
                },
                success: referenceRender.render
            })
        }).catch((r)=>{console.warn('Failed to get id from ' + r)});
    }
}

referenceRender.start();