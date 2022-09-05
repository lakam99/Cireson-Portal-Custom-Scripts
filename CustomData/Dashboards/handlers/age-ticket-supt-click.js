function generateHandler(chartReference) {
    const dashboard = {
        "name": "Aging Tickets by Analyst",
        "subChart": true,
        "queryName": "Z Analyst Open WorkItems",
        "dashboard_id": "analyst-aging-tickets-dashboard",
        "chartType": "bar",
        "sortOn": "Name",
        "useDatePicker": true,
        "filterName": "Older Than",
        "display": false,
        "filters": [
            {
                "name": "Seven Days",
                "filter": "Created <= '{{moment().subtract(7,'d').format('yy/MM/DD')}}'"
            },
            {
                "name": "One Month",
                "filter": "Created <= '{{moment().format('yy/MM/01')}}'"
            },
            {
                "name": "One Year",
                "filter": "Created <= '{{moment().format('yy/01/01')}}'"
            }
        ]
    }
    return async (clickEvent) => {
        const clickedOn = chartReference.getElementsAtEventForMode(clickEvent, 'nearest', {intersect: true}, true)[0];
        if (clickedOn) {
            const label = chartReference.data.datasets[clickedOn.datasetIndex].label;
            const defaultFilter = `Tier = '${label}' and `; 
            dashboard.filters.forEach((filter)=>{
                filter.filter = defaultFilter + filter.filter;
                const [compiled, match] = compileFilter(filter.filter);
                if (!match.length) return;
                filter.filter = filter.filter.replace(match[0][0], compiled);
            });
            dashboard.queryId = await customAPI.getQueryId(dashboard.queryName);
           const resetView = () => {_setView(Dashboard, window.previousDashboard)};
            console.log(clickedOn);
            console.log(chartReference.data.datasets[clickedOn.datasetIndex].label);
            _setView(Dashboard, {dashboard, resetView});
        }
    }
}