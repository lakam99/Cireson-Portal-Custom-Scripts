!(async function() {
    const config_path = customGlobalLoader.get_str_url("/CustomSpace/CustomData/Dashboards/dashboards.json");
    const wrapper = '#main_wrapper';
    var config = await $.getJSON(config_path);
    await customGlobalLoader.main.load_react();
    var assets = customGlobalLoader.main.load_file(new urlObj("/CustomSpace/CustomElements/Dashboard.js"));

    config.forEach((c)=>{
        if (c.filter == ">~<today>~<")
            c.filter = moment().format('MM/DD/yy');
    })


    $(wrapper).html('<div id="root"></div>');
    var root = $('#root')[0];
    var reactRoot = ReactDOM.createRoot(root);
    await assets;
    reactRoot.render(React.createElement(Dashboard, config[0]))

})()