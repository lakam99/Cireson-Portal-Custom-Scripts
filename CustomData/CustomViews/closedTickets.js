!(async function() {
    const html = `
    <div style='width: 98%;height: 98%;padding-left: 1%;'>
        <h1>Closed Tickets View</h1>
        <div id='ct-view'></div>
    </div>
    `;
    const columns = [
        {field: "Id", width: '5%', template: `<a target='_blank' href='#var url = create_wi_url(data.Id);##=url#'>#: Id # </a>`},
        {field: "Title"},
        {field: "AssignedUser"},
        {field: "AffectedUser"},
        {field: "SupportGroup"},
        {field: "Created"},
        {field: "ClosedDate"}
    ];
    const queryId = await customAPI.getQueryId('Z All Closed WorkItems');
    var supportGroupFilter = '';

    session.user.user_groups.forEach((m,i) => {
        if (i > 0) {supportGroupFilter += 'or '}
        supportGroupFilter += `SupportGroup = '${m.Text}' `;
    });

    const filter = `where AssignedUser = '${session.user.Name}' and ${supportGroupFilter}`;

    const dataSource = {
        transport: {
            read: {
                url: window.location.origin + "/Dashboard/GetDashboardDataById",
                dataType: "json",
                data: {
                    queryId,
                    filter
                }
            }
        }
    }

    const options = {
        filterable: true,
        groupable: true,
        sortable: true,
        resizable: true,
        pageable: {
            pageSize: 20,
            pageSizes: [10, 20, 50, 100, "All"]
        }
    }

    $('#main_wrapper').html(html);
    $('#ct-view').kendoGrid({columns, ...options, dataSource});

})()