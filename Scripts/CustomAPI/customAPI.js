const customAPI = {
    
    async loadTicketJSON(id) {
        const _id = id.toLowerCase();
        if (!_id.startsWith('srq') && !_id.startsWith('inc')) throw "Only srq and incident is supported.";

        const page = await fetch(window.location.origin + (id.toLowerCase().startsWith('srq') ? '/ServiceRequest/' : '/Incident/') + '/Edit/' + id);
        const html = await page.text();
        const scripts = $(html).find('script')[2];
        eval($(scripts).text());
        if (!pageForm) throw "Failed to retrieve " + id;
        if (pageForm?.WorkItemErrorMessage) throw pageForm.WorkItemErrorMessage;
        return rawJSON;
    }
}