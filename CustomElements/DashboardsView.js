function DashboardsView(_ref) {
    var dashboards = _ref.dashboards,
        aspectRatio = _ref.aspectRatio,
        expandChart = _ref.expandChart;

    return React.createElement(
        "div",
        { id: "dashboard-mgr-view" },
        React.createElement(
            "div",
            { id: "dashboard-mgr-container" },
            React.createElement(
                "div",
                { id: "dashboard-mgr-main-grid" },
                React.createElement(
                    "div",
                    { id: "dashboard-mgr-main-title" },
                    React.createElement(
                        "h1",
                        { className: "jumbotron" },
                        "Dashboards"
                    )
                ),
                React.createElement(
                    "div",
                    { id: "dashboard-mgr-dashboard-view" },
                    dashboards.map(function (dashboard) {
                        if (dashboard.display === false) return;
                        Object.assign(dashboard, { aspectRatio: aspectRatio });
                        return React.createElement(
                            "div",
                            { className: "lil-chart", key: dashboard.dashboard_id + '-lil', onClick: function onClick() {
                                    expandChart(dashboard);
                                } },
                            React.createElement(ChartComponent, Object.assign({}, dashboard, { displayLegend: false, displayTitle: true }))
                        );
                    })
                )
            )
        )
    );
}