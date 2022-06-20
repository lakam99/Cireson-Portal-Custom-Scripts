!(function() {

    var get_any_ticket_id = () => {
        return new Promise((resolve,reject)=>{
            $.ajax({
                url: window.location.origin + '/grid/data',
                type: 'post',
                dataType: 'json',
                data: {
                    sort:'', page: 1, pageSize: 1, group: '', filter: "Id~startswith~'SRQ'",
                    filters: JSON.stringify({"gridType":"WorkItem","subType":"allworkitems","showActivities":"false","showInActives":"false"}),
                },
                success: (r) => resolve(r.Data[0].Id),
                error: (e) => reject(e)
            })
        })
    }

    var get_ticket_page_html = (ticket_id) => {
        return new Promise((resolve,reject)=>{
            $.ajax({
                url: window.location.origin + '/ServiceRequest/Edit/' + ticket_id,
                success: (html) => resolve(html),
                error: (e) => reject(e)
            })
        })
    }

    var get_verification_token = async (ticket_id) => {
        let ticket_html = await get_ticket_page_html(ticket_id);
        ticket_html = $(ticket_html);
        return ticket_html.find('input[name="__RequestVerificationToken"]')[1].val();
    }

    const setting_name = "emailer-ticket";
    var settings = customGlobalLoader.get_settings();
    var my_setting = settings[setting_name];
    var ticket_id = '';
    if (!my_setting) {
        //get new ticket id
        //ticket_id = ...
    }

    var verification_token = get_verification_token(ticket_id); //is a promise

    window.sendEmail = (To, Cc, Subject, Message) => {
        return new Promise(async (resolve,reject)=>{
            let token = await verification_token;
            $.ajax({
                headers: {'__RequestVerificationToken': token},
                url: window.location.origin + '/EmailNotification/SendEmailNotification',
                type: 'post',
                data: {
                    To, Cc, Subject, Message,
                    'AttachedFileNames': '',
                    'WorkItemId': '4f27c499-5733-7e14-c05b-34ea0b912ac7',
                    'workItemFileIds': ''
                },
                success: (r) => resolve(r),
                error: (e) => reject(e)
            })
        })
    }
})()