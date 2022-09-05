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
            let [compiled, expressions] = compileFilter(filter);
            expressions.forEach((expression,j)=>c.filters[i].filter = c.filters[i].filter.replace(expression[0], compiled[j])); //need to test
        })
    })

    var root;
    var reactRoot;
    await Promise.all(assets);
    await Promise.all(queryId_retrieval);
    await Promise.all(compile_handlers);
    const resetView = ((type, props)=>{
        $(wrapper).html('<div id="root"></div>');
        root = $('#root')[0];
        reactRoot = ReactDOM.createRoot(root);
        reactRoot.render(React.createElement(type, props));

    });
    window._setView = resetView;
    resetView(DashboardsManager, {dashboards:config});
})()