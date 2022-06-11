function DashboardsView({dashboards, aspectRatio, expandChart}) {
    return (
        <div id='dashboard-mgr-view'>
            <div id="dashboard-mgr-container">
                <div id="dashboard-mgr-main-grid">
                    <div id="dashboard-mgr-main-title">
                        <h1 className="jumbotron">Dashboards</h1>
                    </div>    
                    <div id="dashboard-mgr-dashboard-view">
                        {dashboards.map((dashboard)=>{
                            Object.assign(dashboard, {aspectRatio});
                            return (
                                <div className="lil-chart" key={dashboard.dashboard_id+'-lil'} onClick={()=>{expandChart(dashboard)}}>
                                    <ChartComponent {...dashboard}></ChartComponent>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}