var {useEffect, useState, useRef} = React;
function Dashboard(props) {
    var {filters, dashboard_id, queryId, sortOn, name} = props;
    var filterIndex = useRef(0);
    var [selectedFilter, setSelectedFilter] = useState(filters[filterIndex.current]);
    var [dateRangeRender, setDateRange] = useState(false);
    var data = useRef([]);

    var getData = async () => await $.getJSON(window.location.origin + "/Dashboard/GetDashboardDataById", {queryId, filter:selectedFilter});
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
            dashboard_elem.data('chart').data = getConfig().data;
            dashboard_elem.data('chart').update();
        }
        else dashboard_elem.data({chart: new Chart(dashboard_elem[0], getConfig(data.current))});
    }

    var setFilter = (e) => {
        let index = e.target.value;
        let filter = filters[index].filter;
        if (!filter) setDateRange(true); //render daterangepicker
        else {
            ticketManipulator.show_loading();
            filterIndex.current = e.target.value;
            setSelectedFilter(filters[filterIndex.current].filter);
        }
    }

    useEffect(()=>{
        setSelectedFilter(filters[filterIndex.current].filter);
        $('.cust-dashboard-filter').on('change', setFilter);
    },[]);

    useEffect(()=>{
        getData().then((results)=>{
            data.current = results;
            ticketManipulator.remove_loading();
            render();
        })
    }, [selectedFilter]);

    var useCustomFilter = (filter) => setFilter(filter);

    return React.createElement(
        'div',
        { className: 'cust-dashboard' },
        React.createElement(
            'div',
            { className: 'cust-dashboard-tools' },
            React.createElement(
                'div',
                { className: 'cust-dashboard-tool' },
                data.current ? React.createElement(
                    'select',
                    { className: 'cust-dashboard-filter' },
                    filters.map(function (filter, i) {
                        return React.createElement(
                            'option',
                            { value: i, key: 'filter-' + i },
                            filter.name
                        );
                    })
                ) : undefined
            ),
            React.createElement(
                'div',
                { className: 'cust-dashboard-tool' },
                dateRangeRender ? React.createElement(DateRangePickerComponent, { float: 'right', id: dashboard_id + "-date-range", onApply: useCustomFilter }) : undefined
            )
        ),
        React.createElement('canvas', { id: dashboard_id })
    );
}