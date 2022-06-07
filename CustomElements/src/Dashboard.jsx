var {useEffect, useState} = React;
function Dashboard(props) {
    var {filter, dashboard_id, queryId, sortOn, name} = props;
    var data = useState({});
    var dimensions = useState({width:window.innerWidth, height:window.innerHeight});

    var getData = async () => await $.getJSON(window.location.origin + "/Dashboard/GetDashboardDataById", {queryId, filter});
    var getCountData = (data) => {
        var r = {};
        data.forEach((item) =>  {
            if (r[item[sortOn]]) r[item[sortOn]]++;
            else r[item[sortOn]] = 1;
        });
        return r;
    }

    var getConfig = (data) => {
        let countData = getCountData(data);
        let labels = Object.keys(countData);
        let values = Object.values(countData);
        let cdata = {labels, datasets: [{label: name, data:values, borderColor: values.map(()=>randColor()), backgroundColor: values.map(()=>randColor())}]};
        let config = {type: 'line', data:cdata, options: {}};
        return config;
    }

    var render = () => {
        let dashboard_elem = $(`#${dashboard_id}`);
        dashboard_elem.data({chart: new Chart(dashboard_elem[0].getContext('2d'), getConfig(data))});
    }

    useEffect(async ()=>{
        data = await getData();
        render();
    }, []);

    useEffect(()=>render(), [data]);

    return (
        <div className="cust-dashboard">
            <select className="cust-dashboard-filter">

            </select>
            <canvas id={dashboard_id}></canvas>
        </div>
    )
}