const customLabels = {
    afterUpdate(chart, args, options) {
        const elem = $('#label-list');
        if (elem.length == 0) return;
        console.log(chart, args, options);
        //chart.options.plugins.legend.labels.generateLabels(chart);
        let labels = chart._metasets;
        console.log(labels);
        const app = ReactDOM.createRoot(elem[0]);
        const toggleVisibility = (index) => {chart.toggleDataVisibility(index);chart.update()}
        const dropdownOptions = labels.map((label)=>{
            let r = {text: '', value: false, index: undefined};
            r.text = label.label;
            r.value = label.visible;
            return r;
        })
        console.log(dropdownOptions);
        app.render(React.createElement(StandaloneSearchDropdown, {options:dropdownOptions, toggleVisibility}))
    }
}