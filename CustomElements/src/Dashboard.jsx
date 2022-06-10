class Dashboard extends React.Component {
    constructor(props) {
        super();
        var {filters, dashboard_id, queryId, sortOn, name, chartType} = props.dashboard;
        Object.assign(this, {filters, dashboard_id, queryId, sortOn, name, data:[]});
        Object.assign(this, {backToMgr: props.resetView})
        this.state = {filter: {index: 0, filter: this.filters[0].filter}, useDateRange: false};
        this.setState(this.state);
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

    useDateRange() {
        return this.state.useDateRange;
    }

    setDateRange(value) {
        let current = this.getStateCopy();
        current.useDateRange = value;
        this.setState(current);
    }

    setFilter(e) {
        let index = e.target.value;
        let filter = this.filters[index].filter;
        if (!filter)
            this.setDateRange(true);
        else {
            let newState = {filter: {index, filter}, useDateRange:false};
            this.setState(newState);
        }
    }

    useCustomFilter(filter) {
        this._updateFilter(filter);
    }

    componentDidMount() {
        this._updateFilter(this.state.filter.index);
        $('.cust-dashboard-filter').on('change', this.setFilter.bind(this));
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
                        <select className="cust-dashboard-filter">
                            {this.filters.map((filter, i)=><option value={i} key={'filter-'+i}>{filter.name}</option>)}
                        </select> : undefined }
                    </div>
                    <div className="cust-dashboard-tool">
                        <DateRangePickerComponent id={this.dashboard_id + "-date-range"} onApply={this.useCustomFilter.bind(this)} hidden={!this.useDateRange()}></DateRangePickerComponent>
                    </div>
                </div>
                <ChartComponent name={this.name} dashboard_id={this.dashboard_id} queryId={this.queryId} filter={this.state.filter.filter} sortOn={this.sortOn} chartType={this.props.dashboard.chartType}></ChartComponent>
            </div>
        )
    }
}