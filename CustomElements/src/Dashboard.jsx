var {useEffect, useState, useRef} = React;
function Dashboard(props) {
    var {filters, dashboard_id, queryId, sortOn, name} = props;
    var [selectedFilterIndex, setFilterIndex] = useState(0);
    var data = useRef([]);

    var getData = async () => await $.getJSON(window.location.origin + "/Dashboard/GetDashboardDataById", {queryId, filter:filters[selectedFilterIndex].filter});
    var getCountData = () => {
        var r = {};
        data.current.forEach((item) =>  {
            if (r[item[sortOn]]) r[item[sortOn]]++;
            else r[item[sortOn]] = 1;
        });
        return r;
    }

    var getConfig = () => {
        let countData = getCountData(data.current);
        let labels = Object.keys(countData);
        let values = Object.values(countData);
        let cdata = {labels, datasets: [{label: name, data:values, borderColor: values.map(()=>randColor()), backgroundColor: values.map(()=>randColor())}]};
        let config = {type: 'line', data:cdata, options: {}};
        return config;
    }

    var render = () => {
        let dashboard_elem = $(`#${dashboard_id}`);
        if (dashboard_elem.data('chart')) {
            dashboard_elem.data('chart').data = getConfig(data.current).data;
            dashboard_elem.data('chart').update();
        }
        else dashboard_elem.data({chart: new Chart(dashboard_elem[0], getConfig(data.current))});
    }

    var setFilterIndexCB = (e) => { ticketManipulator.show_loading(); setFilterIndex(e.target.value);};

    useEffect(()=>{
        getData().then((results)=>{
            data.current = results;
            ticketManipulator.remove_loading();
            render();
        })
    }, [selectedFilterIndex]);

    useEffect(()=>{
        $('.cust-dashboard-filter').on('change', setFilterIndexCB);
    },[]);

    return (
        <div className="cust-dashboard">
            <select className="cust-dashboard-filter">
                {filters.map((filter, i)=><option value={i} key={'filter-'+i}>{filter.name}</option>)}
            </select>
            <canvas id={dashboard_id}></canvas>
        </div>
    )
}