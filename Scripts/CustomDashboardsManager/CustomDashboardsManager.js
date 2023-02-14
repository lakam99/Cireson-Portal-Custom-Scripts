function generateDashboardClickHandler(suptGroupColumnName, dashboard) {
    return function generateClickHandler(chartReference) {
        return async (clickEvent) => {
            const clickedOn = chartReference.getElementsAtEventForMode(clickEvent, 'nearest', {intersect: true}, true)[0];
            if (!clickedOn) return;
            const label = chartReference.data.datasets[clickedOn.datasetIndex].label;
            const defaultFilter = `${suptGroupColumnName} = '${label}' and `; 
            dashboard.filters.forEach((filter)=>{
                if (!filter.compiled) filter.original = filter.filter;
                filter.filter = defaultFilter + completeCompileFilter(filter.original);
                filter.compiled = true;
            });
            dashboard.queryId = await customAPI.getQueryId(dashboard.queryName);
            dashboard.defaultFilter = defaultFilter;
            const resetView = () => {setView(Dashboard, window.previousDashboard)};
            console.log(clickedOn);
            console.log(chartReference.data.datasets[clickedOn.datasetIndex].label);
            setView(Dashboard, {dashboard, resetView});
        }
    }
}

/**
 * 
 * @param {Array<Object>} obj Array of objects containing uniform headers
 */
function jsonToCsv(obj) {
    if (!Array.isArray(obj)) throw "Object must be array of objects.";
    const headers = Object.keys(obj[0]);
    let csv = headers.join(',') + '\n';
    obj.forEach((o) => {
        headers.forEach((header, i) => csv += o[header] + (i != headers.length - 1 ? ',' : ''));
        csv += '\r\n';
    });
    return csv;
}

!(async function() {
    $('head').append(`<link rel='stylesheet' href="${window.location.origin}/CustomSpace/Templates/Homepage/datepicker.min.css">
    <style>html, body, #root, #main_wrapper, #dashboard-mgr-view {height: 100%; width: 100%;} #root {margin: auto; margin-top: 3vh; overflow:hidden;}</style>`);

    const config_path = customGlobalLoader.get_str_url("/CustomSpace/CustomData/Dashboards/dashboards.json");
    const wrapper = '#main_wrapper';
    var config = await $.getJSON(config_path);
    await customGlobalLoader.main.load_react();
    var assets = ["/CustomSpace/CustomElements/DashboardsManager.js","/CustomSpace/CustomElements/Dashboard.js",
     "/CustomSpace/CustomElements/DateRangePickerComponent.js","/CustomSpace/CustomElements/DatePickerComponent.js",
     "/CustomSpace/CustomElements/ChartComponent.js","/CustomSpace/CustomElements/DashboardsView.js",
     "/CustomSpace/Templates/Homepage/datepicker-full.min.js", "/CustomSpace/CustomData/Dashboards/plugins/customLabels.js",
     "/CustomSpace/CustomElements/StandaloneSearchDropdown.js"];
    assets = customGlobalLoader.main.load_files({array: assets.map((asset)=>new urlObj(asset))});

    window.compileFilter = (filter) => {
        const expressionRegex = /{{([\s\S]*?)}}/g;
        let expressions = [...filter.matchAll(expressionRegex)]; //returns all the expressions in THIS filter
        let compiled = expressions.map((expression)=>eval(expression[1]));
        return [compiled, expressions];
    }

    window.completeCompileFilter = (filter) => {
        const [compiled, expressions] = compileFilter(filter);
        if (!expressions.length) return filter;
        var r = filter; expressions.forEach((expression,j)=>r = r.replace(expression[0], compiled[j]));
        return r;
    }

    //get queryId
    let queryId_retrieval = config.map(async (c)=>{
        let query = await $.getJSON(window.location.origin + '/DashboardQuery/GetDashboardQueryByName', {name: c.queryName});
        if (!query.length) throw "Failed to retrieve qeury " + c.queryName;
        if (query.length > 1) throw `Query name ${c.queryName} returned ${query.length} results instead of 1.`;
        c.queryId = query[0].Id;
    })

    //compile handlers 
    let compile_handlers = config.map(async (c) => {
        if (c.click) {
            let temp = await fetch(customGlobalLoader.get_str_url(c.click));
            temp = await temp.text();
            eval('c.click = ' + temp);
        }
    })

    //compile filters
    config.forEach((c)=>{
        c.filters.forEach(({filter}, i)=>{
            c.filters[i].filter = completeCompileFilter(filter);
        })
    })

    var root;
    var reactRoot;
    await Promise.all(assets);
    await Promise.all(queryId_retrieval);
    await Promise.all(compile_handlers);
    window.setView = ((type, props)=>{
        $(wrapper).html('<div id="root"></div>');
        root = $('#root')[0];
        reactRoot = ReactDOM.createRoot(root);
        reactRoot.render(React.createElement(type, props));
    });
    window.resetView = () => {setView(DashboardsManager, {dashboards: config})}
    resetView();
})()