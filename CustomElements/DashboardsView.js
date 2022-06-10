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
                        { "class": "jumbotron" },
                        "Dashboards"
                    )
                ),
                React.createElement(
                    "div",
                    { id: "dashboard-mgr-dashboard-view" },
                    dashboards.map(function (dashboard) {
                        Object.assign(dashboard, { aspectRatio: aspectRatio });
                        return React.createElement(
                            "div",
                            { className: "lil-chart", onClick: function onClick() {
                                    expandChart(dashboard);
                                } },
                            React.createElement(ChartComponent, dashboard)
                        );
                    })
                )
            )
        )
    );
}