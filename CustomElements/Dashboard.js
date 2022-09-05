var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Dashboard = function (_React$Component) {
    _inherits(Dashboard, _React$Component);

    function Dashboard(props) {
        _classCallCheck(this, Dashboard);

        var _this = _possibleConstructorReturn(this, (Dashboard.__proto__ || Object.getPrototypeOf(Dashboard)).call(this));

        var _props$dashboard = props.dashboard,
            defaultFilter = _props$dashboard.defaultFilter,
            filters = _props$dashboard.filters,
            dashboard_id = _props$dashboard.dashboard_id,
            queryId = _props$dashboard.queryId,
            sortOn = _props$dashboard.sortOn,
            name = _props$dashboard.name,
            chartType = _props$dashboard.chartType,
            useDatePicker = _props$dashboard.useDatePicker,
            filterName = _props$dashboard.filterName,
            multiDataset = _props$dashboard.multiDataset,
            multiDatasetSortOn = _props$dashboard.multiDatasetSortOn,
            usingDateAxis = _props$dashboard.usingDateAxis,
            click = _props$dashboard.click;

        Object.assign(_this, { defaultFilter: defaultFilter, filters: filters, dashboard_id: dashboard_id, queryId: queryId, sortOn: sortOn, name: name, data: [], useDatePicker: useDatePicker, filterName: filterName, backToMgr: props.resetView, chartType: chartType, multiDataset: multiDataset, multiDatasetSortOn: multiDatasetSortOn, usingDateAxis: usingDateAxis, click: click });
        _this.state = { filter: { index: 0, filter: _this.filters[0].filter }, useDateRange: false, useDatePicker: false, labels: [] };
        _this.applyFilter = _this.useCustomFilter.bind(_this);
        if (props.dashboard.subChart !== true) window.previousDashboard = props;
        return _this;
    }

    _createClass(Dashboard, [{
        key: 'getStateCopy',
        value: function getStateCopy() {
            var current = {};
            Object.assign(current, this.state);
            return current;
        }
    }, {
        key: 'updateFilterByIndex',
        value: function updateFilterByIndex(index) {
            var current = this.getStateCopy();
            current.filter.index = index;
            current.filter.filter = this.filters[index].filter;
            this.setState(current);
        }
    }, {
        key: '_updateFilter',
        value: function _updateFilter(filter) {
            var current = this.getStateCopy();
            current.filter.filter = this.defaultFilter + filter;
            this.setState(current);
        }
    }, {
        key: 'setDatePicker',
        value: function setDatePicker(value) {
            var current = this.getStateCopy();
            current.useDatePicker = value;
            this.setState(current);
        }
    }, {
        key: 'setDateRange',
        value: function setDateRange(value) {
            var current = this.getStateCopy();
            current.useDateRange = value;
            this.setState(current);
        }
    }, {
        key: 'setFilter',
        value: function setFilter(e) {
            var index = e.target.value;
            var filter = this.filters[index];
            if (!filter.filter || filter.name.includes('Custom')) {
                if (this.useDatePicker) this.setDatePicker(true);else this.setDateRange(true);
            } else {
                var newState = { filter: { index: index, filter: filter.filter }, useDateRange: false, useDatePicker: false };
                this.setState(newState);
            }
        }
    }, {
        key: 'useCustomFilter',
        value: function useCustomFilter(filter) {
            this._updateFilter(filter);
        }
    }, {
        key: 'render_datepicker',
        value: function render_datepicker() {
            if (this.state.useDateRange) return React.createElement(DateRangePickerComponent, { id: this.dashboard_id + "-date-range", onApply: this.applyFilter, hidden: !this.state.useDateRange });else if (this.state.useDatePicker) return React.createElement(DatePickerComponent, { onApply: this.applyFilter, hidden: !this.state.useDatePicker });
        }
    }, {
        key: 'getChartElem',
        value: function getChartElem() {
            return $('#' + this.dashboard_id).data('chart');
        }
    }, {
        key: 'updateChart',
        value: function updateChart() {
            var state = this.getStateCopy();
            state.labels = this.getAllLabels();
            this.setState(state);
            this.getChartElem().update();
        }
    }, {
        key: 'toggleLabel',
        value: function toggleLabel(index) {
            var chart = this.getChartElem();
            var value = chart._metasets[index].hidden;
            chart._metasets[index].hidden = !value;
            chart.update();
        }
    }, {
        key: 'hideAllLabels',
        value: function hideAllLabels() {
            this.getChartElem()._metasets.forEach(function (d) {
                return d.hidden = true;
            });
            this.updateChart();
        }
    }, {
        key: 'showAllLabels',
        value: function showAllLabels() {
            this.getChartElem()._metasets.forEach(function (d) {
                return d.hidden = false;
            });
            this.updateChart();
        }
    }, {
        key: 'getAllLabels',
        value: function getAllLabels() {
            return this.getChartElem()._metasets.map(function (label, i) {
                var r = { text: '', value: false, index: undefined };
                r.text = label.label;
                r.value = label.visible;
                r.index = i;
                return r;
            });
        }
    }, {
        key: 'render',
        value: function render() {
            return React.createElement(
                'div',
                { className: 'cust-dashboard' },
                React.createElement(
                    'div',
                    { className: 'cust-dashboard-header' },
                    React.createElement(
                        'a',
                        { href: '#', className: 'cust-dashboard-back-btn', onClick: this.backToMgr },
                        '\u2039'
                    ),
                    React.createElement(
                        'h1',
                        { className: 'cust-dashboard-title' },
                        this.name
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'cust-dashboard-tools' },
                    React.createElement(
                        'div',
                        { className: 'cust-dashboard-tool' },
                        this.data ? React.createElement(
                            'div',
                            { className: 'cust-dashboard-filter-select' },
                            React.createElement(
                                'span',
                                null,
                                this.filterName,
                                '\xA0'
                            ),
                            React.createElement(
                                'select',
                                { className: 'cust-dashboard-filter', onChange: this.setFilter.bind(this) },
                                this.filters.map(function (filter, i) {
                                    return React.createElement(
                                        'option',
                                        { value: i, key: 'filter-' + i },
                                        filter.name
                                    );
                                })
                            )
                        ) : undefined
                    ),
                    React.createElement(
                        'div',
                        { className: 'cust-dashboard-tool' },
                        React.createElement(
                            'span',
                            null,
                            '\xA0'
                        ),
                        this.render_datepicker()
                    ),
                    React.createElement(
                        'div',
                        { className: 'cust-dashboard-tool float-right align-bottom' },
                        React.createElement(
                            'label',
                            { 'for': 'labels' },
                            'Labels'
                        ),
                        React.createElement(
                            'div',
                            { id: 'label-list' },
                            React.createElement(StandaloneSearchDropdown, { id: 'labels', options: this.state.labels, toggleVisibility: this.toggleLabel.bind(this) })
                        )
                    ),
                    React.createElement(
                        'div',
                        { className: 'cust-dashboard-tool align-bottom' },
                        React.createElement(
                            'a',
                            { className: 'btn btn-primary', onClick: this.hideAllLabels.bind(this) },
                            'Hide All'
                        )
                    ),
                    React.createElement(
                        'div',
                        { className: 'cust-dashboard-tool align-bottom' },
                        React.createElement(
                            'a',
                            { className: 'btn btn-primary', onClick: this.showAllLabels.bind(this) },
                            'Show All'
                        )
                    )
                ),
                React.createElement(ChartComponent, { name: this.name, dashboard_id: this.dashboard_id,
                    queryId: this.queryId, filter: this.state.filter.filter,
                    sortOn: this.sortOn, chartType: this.chartType,
                    multiDataset: this.multiDataset, multiDatasetSortOn: this.multiDatasetSortOn,
                    usingDateAxis: this.usingDateAxis, click: this.click })
            );
        }
    }]);

    return Dashboard;
}(React.Component);