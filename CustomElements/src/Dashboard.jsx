class Dashboard extends React.Component {
    constructor(props) {
        super();
        var {filters, dashboard_id, queryId, sortOn, name, chartType, useDatePicker, filterName, multiDataset, multiDatasetSortOn, usingDateAxis, click} = props.dashboard;
        Object.assign(this, {filters, dashboard_id, queryId, sortOn, name, data:[], useDatePicker, filterName, backToMgr: props.resetView, chartType, multiDataset, multiDatasetSortOn, usingDateAxis, click});
        this.state = {filter: {index: 0, filter: this.filters[0].filter}, useDateRange: false, useDatePicker: false, labels: []};
        this.applyFilter = this.useCustomFilter.bind(this);
    }

    getStateCopy() {
        let current = {};
        Object.assign(current, this.state);
        return current;
    }

    updateFilterByIndex(index) {
        let current = this.getStateCopy();
        current.filter.index = index;
        current.filter.filter = this.filters[index].filter;
        this.setState(current);
    }

    _updateFilter(filter) {
        let current = this.getStateCopy();
        current.filter.filter = filter;
        this.setState(current);
    }

    setDatePicker(value) {
        let current = this.getStateCopy();
        current.useDatePicker = value;
        this.setState(current);
    }

    setDateRange(value) {
        let current = this.getStateCopy();
        current.useDateRange = value;
        this.setState(current);
    }

    setFilter(e) {
        let index = e.target.value;
        let filter = this.filters[index].filter;
        if (!filter) {
            if (this.useDatePicker) this.setDatePicker(true);
            else this.setDateRange(true);
        } else {
            let newState = {filter: {index, filter}, useDateRange:false, useDatePicker: false};
            this.setState(newState);
        }
    }

    useCustomFilter(filter) {
        this._updateFilter(filter);
    }

    render_datepicker() {
        if (this.state.useDateRange)
            return <DateRangePickerComponent id={this.dashboard_id + "-date-range"} onApply={this.applyFilter} hidden={!this.state.useDateRange}></DateRangePickerComponent>
        else if (this.state.useDatePicker)
            return <DatePickerComponent onApply={this.applyFilter} hidden={!this.state.useDatePicker}></DatePickerComponent>
    }

    getChartElem() {
        return $(`#${this.dashboard_id}`).data('chart');
    }

    updateChart() {
        let state = this.getStateCopy();
        state.labels = this.getAllLabels();
        this.setState(state);
        this.getChartElem().update();
    }

    toggleLabel(index) {
        let chart = this.getChartElem();
        let value = chart._metasets[index].hidden;
        chart._metasets[index].hidden = !value;
        chart.update();
    }

    hideAllLabels() {
        this.getChartElem()._metasets.forEach(d=>d.hidden = true);
        this.updateChart();
    }

    showAllLabels() {
        this.getChartElem()._metasets.forEach(d=>d.hidden = false);
        this.updateChart();
    }

    getAllLabels() {
        return this.getChartElem()._metasets.map((label, i)=>{
            let r = {text: '', value: false, index: undefined};
            r.text = label.label;
            r.value = label.visible;
            r.index = i;
            return r;
        })
    }

    render() {
        return (
            <div className="cust-dashboard">
                <div className="cust-dashboard-header">
                    <a href="#" className="cust-dashboard-back-btn" onClick={this.backToMgr}>&#8249;</a>
                <h1 className="cust-dashboard-title">{this.name}</h1></div>
                <div className="cust-dashboard-tools">
                    <div className="cust-dashboard-tool">
                        { this.data ? 
                        <div className="cust-dashboard-filter-select">
                            <span>{this.filterName}&nbsp;</span>
                            <select className="cust-dashboard-filter" onChange={this.setFilter.bind(this)}>
                            {this.filters.map((filter, i)=><option value={i} key={'filter-'+i}>{filter.name}</option>)}
                        </select>
                        </div>
                        : undefined }
                    </div>
                    <div className="cust-dashboard-tool">
                        <span>&nbsp;</span>
                        {this.render_datepicker()}
                    </div>
                    <div className="cust-dashboard-tool float-right align-bottom">
                        <div id='label-list'>
                            <StandaloneSearchDropdown options={this.state.labels} toggleVisibility={this.toggleLabel.bind(this)}></StandaloneSearchDropdown>
                        </div>
                    </div>
                    <div className="cust-dashboard-tool align-bottom">
                        <a className="btn btn-primary" onClick={this.hideAllLabels.bind(this)}>Hide All</a>
                    </div>
                    <div className="cust-dashboard-tool align-bottom">
                        <a className="btn btn-primary" onClick={this.showAllLabels.bind(this)}>Show All</a>
                    </div>
                </div>
                <ChartComponent
                    {...{name:this.name, dashboard_id: this.dashboard_id,
                        queryId: this.queryId, filter: this.state.filter.filter,
                        sortOn: this.sortOn, chartType: this.chartType,
                        multiDataset: this.multiDataset, multiDatasetSortOn: this.multiDatasetSortOn,
                        usingDateAxis: this.usingDateAxis, click: this.click}}>
                        </ChartComponent>
            </div>
        )
    }
}