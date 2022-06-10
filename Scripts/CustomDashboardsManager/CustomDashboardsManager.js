!(async function() {
    $('head').append(`<link rel='stylesheet' href="${window.location.origin}/CustomSpace/Templates/Homepage/datepicker.min.css">
    <style>html, body, #root, #main_wrapper, #dashboard-mgr-view {height: 100%; width: 100%;} #root {margin: auto; margin-top: 3vh; overflow:hidden;}</style>`);

    const config_path = customGlobalLoader.get_str_url("/CustomSpace/CustomData/Dashboards/dashboards.json");
    const wrapper = '#main_wrapper';
    var config = await $.getJSON(config_path);
    await customGlobalLoader.main.load_react();
    var assets = ["/CustomSpace/CustomElements/DashboardsManager.js","/CustomSpace/CustomElements/Dashboard.js",
     "/CustomSpace/CustomElements/DateRangePickerComponent.js","/CustomSpace/CustomElements/ChartComponent.js",
     "/CustomSpace/CustomElements/DashboardsView.js","/CustomSpace/Templates/Homepage/datepicker-full.min.js"];
    assets = customGlobalLoader.main.load_files({array: assets.map((asset)=>new urlObj(asset))});

    window.compileFilter = (filter) => {
        const expressionRegex = /{{([\s\S]*?)}}/g;
        let expressions = [...filter.matchAll(expressionRegex)]; //returns all the expressions in THIS filter
        let compiled = expressions.map((expression)=>eval(expression[1]));
        return [compiled, expressions];
    }

    config.forEach((c)=>{
        c.filters.forEach(({filter}, i)=>{
            let [compiled, expressions] = compileFilter(filter);
            expressions.forEach((expression,j)=>c.filters[i].filter = c.filters[i].filter.replace(expression[0], compiled[j])); //need to test
        })
    })

    $(wrapper).html('<div id="root"></div>');
    var root = $('#root')[0];
    var reactRoot = ReactDOM.createRoot(root);
    await Promise.all(assets);
    reactRoot.render(React.createElement(DashboardsManager, {dashboards:config}))

})()