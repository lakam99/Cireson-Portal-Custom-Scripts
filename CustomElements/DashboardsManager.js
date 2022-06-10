var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _React = React,
    useState = _React.useState;

function DashboardsManager(_ref) {
    var dashboards = _ref.dashboards;

    var aspectRatio = 1;

    var expandChart = function expandChart(dashboard) {
        setView({ ComponentName: Dashboard, data: { dashboard: dashboard, resetView: resetView } });
    };
    var defaultView = { ComponentName: DashboardsView, data: { dashboards: dashboards, aspectRatio: aspectRatio, expandChart: expandChart } };

    var resetView = function resetView() {
        setView(defaultView);
    };

    var _useState = useState(defaultView),
        _useState2 = _slicedToArray(_useState, 2),
        currentView = _useState2[0],
        setView = _useState2[1];

    var generateView = function generateView() {
        return React.createElement(currentView.ComponentName, currentView.data);
    };

    return generateView();
}