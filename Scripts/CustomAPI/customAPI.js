const customAPI = {
    
    async loadTicketJSON(id) {
        const urlMap = {'srq': 'ServiceRequest', 'inc': 'Incident', 'mna': 'Activity'};
        const _id = id.toLowerCase();
        const ticketClass = urlMap[_id.substring(0, 3)];
        if (!ticketClass) throw "Only srq, incident, and mna is supported.";

        const page = await fetch(`${window.location.origin}/${ticketClass}/Edit/${_id}`);
        const html = await page.text();
        const scripts = $(html).find('script')[2];
        eval($(scripts).text());
        try {
            if (!pageForm) throw "Failed to retrieve " + id;
            if (pageForm?.WorkItemErrorMessage) throw pageForm.WorkItemErrorMessage;
            return pageForm?.rawJSON || pageForm?.jsonRaw;
        } catch {
            return null;
        }
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