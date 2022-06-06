var useEffect = React.useEffect;
function Dashboard(props) {
    var filter = props.filter,
        dashboard_id = props.dashboard_id,
        queryId = props.queryId,
        sortOn = props.sortOn;


    useEffect(function () {
        $("#" + dashboard_id).kendoChart({
            dataSource: {
                transport: {
                    read: {
                        url: window.location.origin + "/Dashboard/GetDashboardDataById",
                        dataType: 'json',
                        data: {
                            queryId: queryId,
                            filter: filter
                        }
                    }
                }
            },
            sort: {
                field: sortOn,
                dir: "asc"
            }
        });
    }, []);

    return React.createElement("div", { id: dashboard_id });
}