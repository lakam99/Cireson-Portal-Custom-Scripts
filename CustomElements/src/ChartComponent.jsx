const {useEffect} = React;
function ChartComponent({dashboard_id, queryId, filter, filters, sortOn, name, aspectRatio, chartType, multiDataset, multiDatasetSortOn, usingDateAxis, displayLegend, displayTitle, click}) {

    filter = !filter ? (filters ? filters[0].filter : "") : filter;

    var getData = function getData() {
        return $.getJSON(window.location.origin + "/Dashboard/GetDashboardDataById", {queryId, filter});
    }

    var getCountData = function getCountData(data, _sortOn=sortOn) {
        var r = {};
        data.forEach((item) =>  {
            if (r[item[_sortOn]]) r[item[_sortOn]]++;
            else r[item[_sortOn]] = 1;
        });
        return r;
    }

    var getMultiDatasetCountData = function getMultiDatasetData(data, labels) {
        if (!multiDatasetSortOn) throw "No parameter passed for multiDatasetSortOn";
        var r = {};
        var dataset = [];

        data.forEach((item)=>{
            const parent_prop = item[multiDatasetSortOn];
            const child_prop = item[sortOn];
            if (r[parent_prop]) {
                if (r[parent_prop][child_prop]) r[parent_prop][child_prop]++;
                else r[parent_prop][child_prop] = 1;
            } else {
                r[parent_prop] = {};
                r[parent_prop][child_prop] = 1;
            }
        })

        dataset = Object.keys(r).map((key)=>{
            const rgb = randColor();
            let z = {skipNull: true, borderColor:rgb, backgroundColor: rgb};
             z['label'] = key;
             z['data'] = labels.map((label)=>{
                if (r[key][label]) return {x:label, y:r[key][label]}
                else return {x:label, y:0}
             })
             if (usingDateAxis) z['data'] = z['data'].sort((a,b)=>moment(a.x) - moment(b.x));
             return z;
         })

        return dataset;
    }

    var getConfig = function getConfig(data) {
        const countData = getCountData(data);
        var labels = Object.keys(countData);
        labels = usingDateAxis ? labels.sort((a,b)=>moment(a) - moment(b)) : labels;
        const emptyDataset = Array(labels.length).fill(null);
        var datasets = [];

        if (chartType == 'bar') {
            datasets = labels.map((label, keyIndex)=>{
                let this_dataset = [...emptyDataset];
                this_dataset[keyIndex] = countData[label]; //an array filled with 0s except for at a specific index!
                return {label, skipNull:true, data: this_dataset, borderColor: randColor(), backgroundColor: randColor()}
            })
        } else if (multiDataset) {
            datasets = getMultiDatasetCountData(data, labels);
        } else {
            const values = Object.values(countData);
            datasets = [{label: name, data:values, borderColor: values.map(()=>randColor()), backgroundColor: values.map(()=>randColor())}];
        }

        let cdata = {labels, datasets};
        let config = {
            type: chartType || 'line',
            data: cdata,
            options: {
                aspectRatio: aspectRatio || 2.3,
                plugins: {
                    legend: {
                        display: (displayLegend != undefined ? displayLegend : false)
                    }
                }
            }
        };
        return config;
    }

    useEffect(()=>{
        ticketManipulator.show_loading();
        getData().then((results)=>{
            let dashboard_elem = $(`#${dashboard_id}`);
            let data = getConfig(results)
            if (dashboard_elem.data('chart')) {
                dashboard_elem.data('chart').data = data.data;
                dashboard_elem.data('chart').update();
            }
            else {
                const chart = new Chart(dashboard_elem[0], data);
                dashboard_elem.data({chart});
                if (click) dashboard_elem.on('click', click(chart));
            }
            ticketManipulator.remove_loading();
        })
    }, [filter]);

    return (
        <div>
            <h3>{displayTitle ? name : ''}</h3>
            <canvas id={dashboard_id}></canvas>
        </div>
    )
}