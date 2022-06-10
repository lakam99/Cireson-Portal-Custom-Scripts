const {useState} = React;
function DashboardsManager({dashboards}) {
    const aspectRatio = 1;

    var expandChart = function expandChart(dashboard) {
        setView({ComponentName: Dashboard, data: {dashboard, resetView}});
    }
    const defaultView = {ComponentName: DashboardsView, data: {dashboards, aspectRatio, expandChart}};

    var resetView = function resetView() {
        setView(defaultView);
    }

    var [currentView, setView] = useState(defaultView);

    var generateView = function generateView() {
        return React.createElement(currentView.ComponentName, currentView.data);
    }

    return generateView();
}