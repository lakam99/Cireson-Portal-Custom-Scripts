(function AffectedUserView () {
    var html = '<div id="af-view"></div>';
    var columns = [
        {field: "Id"},
        {field: "Title"},
        {field: "Status"}
    ];
    var dataSource = {
        transport: {
            read: {
                url: window.location.origin + "/api/V3/WorkItem/GetGridWorkItemsMyRequests",
                dataType: 'json',
                data: {
                    userId: session.user.Id,
                    showInactiveItems: 'false'
                }
            }
        }
    };

    var get_tabs = () => {return $('#myTab')}
    var get_container = () => {return $('#af-view')}
    
    var build = () => {
        get_tabs.append(`<li>${html}</li>`);
        get_container.kendoGrid({columns, dataSource});
    }

    var ticket_loaded = setInterval(()=>{
        if (get_tabs().length) {
            clearInterval(ticket_loaded);
            build();
        }
    }, 1000);
    
})()