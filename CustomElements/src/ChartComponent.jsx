const {useEffect} = React;
function ChartComponent({dashboard_id, queryId, filter, filters, sortOn, name, aspectRatio, chartType}) {

    _filter = !filter ? (filters ? filters[0].filter : "") : filter;

    var getData = function getData() {
        return $.getJSON(window.location.origin + "/Dashboard/GetDashboardDataById", {queryId, filter:_filter});
    }

    var getCountData = function getCountData(data) {
        var r = {};
        data.forEach((item) =>  {
            if (r[item[sortOn]]) r[item[sortOn]]++;
            else r[item[sortOn]] = 1;
        });
        return r;
    }

    var getConfig = function getConfig(data) {
        let countData = getCountData(data);
        let labels = Object.keys(countData);
        let values = Object.values(countData);
        let cdata = {labels, datasets: [{label: name, data:values, borderColor: values.map(()=>randColor()), backgroundColor: values.map(()=>randColor())}]};
        //let plugins = chartType == "line" ? {} : {plugins: {legend: {labels: {}}}}
        let config = {type: chartType || 'line', data:cdata, options: {aspectRatio: aspectRatio || 2.3}};
        return config;
    }

    useEffect(()=>{
        ticketManipulator.show_loading();
        getData().then((results)=>{
            let dashboard_elem = $(`#${dashboard_id}`);
            let data = getConfig(results)
            if (dashboard_elem.data('chart')) {
                dashboard_elem.data('chart').data = data.data;
                dashboard_elem.data('chart').update();
            }
            else dashboard_elem.data({chart: new Chart(dashboard_elem[0], data)});
            ticketManipulator.remove_loading();
        })
    }, [filter]);

    return (
        <canvas id={dashboard_id}></canvas>
    )
}