!(async function() {
    $('head').append(`<style>body, #root {height: 100%; width: 100%} #root {margin: auto; margin-top: 3vh}</style>`)

    const config_path = customGlobalLoader.get_str_url("/CustomSpace/CustomData/Dashboards/dashboards.json");
    const wrapper = '#main_wrapper';
    var config = await $.getJSON(config_path);
    await customGlobalLoader.main.load_react();
    var asset = customGlobalLoader.main.load_file(new urlObj("/CustomSpace/CustomElements/Dashboard.js"));
    const expressionRegex = /{{([\s\S]*?)}}/g;

    config.forEach((c)=>{
        c.filters.forEach(({filter}, i)=>{
            let expressions = [...filter.matchAll(expressionRegex)]; //returns all the expressions in THIS filter
            let compiled = expressions.map((expression)=>eval(expression[1]));
            expressions.forEach((expression,j)=>c.filters[i].filter = c.filters[i].filter.replace(expression[0], compiled[j])); //need to test
        })
    })

    $(wrapper).html('<div id="root"></div>');
    var root = $('#root')[0];
    var reactRoot = ReactDOM.createRoot(root);
    await asset;
    reactRoot.render(React.createElement(Dashboard, config[0]))

})()