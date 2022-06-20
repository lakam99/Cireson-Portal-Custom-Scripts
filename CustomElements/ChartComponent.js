var _React = React,
    useEffect = _React.useEffect;

function ChartComponent(_ref) {
    var dashboard_id = _ref.dashboard_id,
        queryId = _ref.queryId,
        filter = _ref.filter,
        filters = _ref.filters,
        sortOn = _ref.sortOn,
        name = _ref.name,
        aspectRatio = _ref.aspectRatio,
        chartType = _ref.chartType;


    filter = !filter ? filters ? filters[0].filter : "" : filter;

    var getData = function getData() {
        return $.getJSON(window.location.origin + "/Dashboard/GetDashboardDataById", { queryId: queryId, filter: filter });
    };

    var getCountData = function getCountData(data) {
        var r = {};
        data.forEach(function (item) {
            if (r[item[sortOn]]) r[item[sortOn]]++;else r[item[sortOn]] = 1;
        });
        return r;
    };

    var getConfig = function getConfig(data) {
        var countData = getCountData(data);
        var labels = Object.keys(countData);
        var values = Object.values(countData);
        var cdata = { labels: labels, datasets: [{ label: name, data: values, borderColor: values.map(function () {
                    return randColor();
                }), backgroundColor: values.map(function () {
                    return randColor();
                }) }] };
        //let plugins = chartType == "line" ? {} : {plugins: {legend: {labels: {}}}}
        var config = { type: chartType || 'line', data: cdata, options: { aspectRatio: aspectRatio || 2.3 } };
        return config;
    };

    useEffect(function () {
        ticketManipulator.show_loading();
        getData().then(function (results) {
            var dashboard_elem = $("#" + dashboard_id);
            var data = getConfig(results);
            if (dashboard_elem.data('chart')) {
                dashboard_elem.data('chart').data = data.data;
                dashboard_elem.data('chart').update();
            } else dashboard_elem.data({ chart: new Chart(dashboard_elem[0], data) });
            ticketManipulator.remove_loading();
        });
    }, [filter]);

    return React.createElement("canvas", { id: dashboard_id });
}