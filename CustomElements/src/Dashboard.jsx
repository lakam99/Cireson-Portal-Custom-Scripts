class Dashboard extends React.Component {
    constructor(props) {
        super();
        var {filters, dashboard_id, queryId, sortOn, name, chartType, useDatePicker, filterName} = props.dashboard;
        Object.assign(this, {filters, dashboard_id, queryId, sortOn, name, data:[], useDatePicker, filterName, backToMgr: props.resetView, chartType});
        this.state = {filter: {index: 0, filter: this.filters[0].filter}, useDateRange: false, useDatePicker: false};
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
                        {this.render_datepicker()}
                    </div>
                </div>
                <ChartComponent name={this.name} dashboard_id={this.dashboard_id} queryId={this.queryId} filter={this.state.filter.filter} sortOn={this.sortOn} chartType={this.chartType}></ChartComponent>
            </div>
        )
    }
}