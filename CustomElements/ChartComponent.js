function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

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
        chartType = _ref.chartType,
        multiDataset = _ref.multiDataset,
        multiDatasetSortOn = _ref.multiDatasetSortOn,
        usingDateAxis = _ref.usingDateAxis,
        displayLegend = _ref.displayLegend,
        displayTitle = _ref.displayTitle;


    filter = !filter ? filters ? filters[0].filter : "" : filter;

    var getData = function getData() {
        return $.getJSON(window.location.origin + "/Dashboard/GetDashboardDataById", { queryId: queryId, filter: filter });
    };

    var getCountData = function getCountData(data) {
        var _sortOn = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : sortOn;

        var r = {};
        data.forEach(function (item) {
            if (r[item[_sortOn]]) r[item[_sortOn]]++;else r[item[_sortOn]] = 1;
        });
        return r;
    };

    var getMultiDatasetCountData = function getMultiDatasetData(data, labels) {
        if (!multiDatasetSortOn) throw "No parameter passed for multiDatasetSortOn";
        var r = {};
        var dataset = [];

        data.forEach(function (item) {
            var parent_prop = item[multiDatasetSortOn];
            var child_prop = item[sortOn];
            if (r[parent_prop]) {
                if (r[parent_prop][child_prop]) r[parent_prop][child_prop]++;else r[parent_prop][child_prop] = 1;
            } else {
                r[parent_prop] = {};
                r[parent_prop][child_prop] = 1;
            }
        });

        dataset = Object.keys(r).map(function (key) {
            var rgb = randColor();
            var z = { skipNull: true, borderColor: rgb, backgroundColor: rgb };
            z['label'] = key;
            z['data'] = labels.map(function (label) {
                if (r[key][label]) return { x: label, y: r[key][label] };else return { x: label, y: 0 };
            });
            if (usingDateAxis) z['data'] = z['data'].sort(function (a, b) {
                return moment(a.x) - moment(b.x);
            });
            return z;
        });

        return dataset;
    };

    var getConfig = function getConfig(data) {
        var countData = getCountData(data);
        var labels = Object.keys(countData);
        labels = usingDateAxis ? labels.sort(function (a, b) {
            return moment(a) - moment(b);
        }) : labels;
        var emptyDataset = Array(labels.length).fill(null);
        var datasets = [];

        if (chartType == 'bar') {
            datasets = labels.map(function (label, keyIndex) {
                var this_dataset = [].concat(_toConsumableArray(emptyDataset));
                this_dataset[keyIndex] = countData[label]; //an array filled with 0s except for at a specific index!
                return { label: label, skipNull: true, data: this_dataset, borderColor: randColor(), backgroundColor: randColor() };
            });
        } else if (multiDataset) {
            datasets = getMultiDatasetCountData(data, labels);
        } else {
            var values = Object.values(countData);
            datasets = [{ label: name, data: values, borderColor: values.map(function () {
                    return randColor();
                }), backgroundColor: values.map(function () {
                    return randColor();
                }) }];
        }

        var cdata = { labels: labels, datasets: datasets };
        var config = {
            type: chartType || 'line',
            data: cdata,
            options: {
                aspectRatio: aspectRatio || 2.3,
                plugins: {
                    legend: {
                        display: displayLegend != undefined ? displayLegend : false
                    }
                }
            }
        };
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

    return React.createElement(
        "div",
        null,
        React.createElement(
            "h3",
            null,
            displayTitle ? name : ''
        ),
        React.createElement("canvas", { id: dashboard_id })
    );
}