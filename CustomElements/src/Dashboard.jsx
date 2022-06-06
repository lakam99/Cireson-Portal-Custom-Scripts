var useEffect = React.useEffect;
function Dashboard(props) {
    var {filter, dashboard_id, queryId, sortOn} = props;

    useEffect(()=>{
        $(`#${dashboard_id}`).kendoChart({
            dataSource: {
                transport: {
                    read: {
                        url: window.location.origin + "/Dashboard/GetDashboardDataById",
                        dataType: 'json',
                        data: {
                            queryId,
                            filter
                        }
                    }
                }
            },
            sort: {
                field: sortOn,
                dir: "asc"
            }
        })
    }, [])

    return (
        <div id={dashboard_id}></div>
    )
}