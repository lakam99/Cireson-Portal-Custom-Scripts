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
    },

    async getQueryId(queryName) {
        const queryId = await $.getJSON(window.location.origin + '/DashboardQuery/GetDashboardQueryByName', {name: queryName});
        if (!queryId) throw `Failed to find query with name ${queryName}.`;
        return queryId[0].Id;
    },

    async getQueryResult(queryName, filter) {
        const queryId = await customAPI.getQueryId(queryName);
        return $.getJSON(window.location.origin + "/Dashboard/GetDashboardDataById", {queryId, filter});
    }
}