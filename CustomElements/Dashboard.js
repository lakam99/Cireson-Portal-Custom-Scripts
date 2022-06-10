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
            filters = _props$dashboard.filters,
            dashboard_id = _props$dashboard.dashboard_id,
            queryId = _props$dashboard.queryId,
            sortOn = _props$dashboard.sortOn,
            name = _props$dashboard.name,
            chartType = _props$dashboard.chartType;

        Object.assign(_this, { filters: filters, dashboard_id: dashboard_id, queryId: queryId, sortOn: sortOn, name: name, data: [] });
        Object.assign(_this, { backToMgr: props.resetView });
        _this.state = { filter: { index: 0, filter: _this.filters[0].filter }, useDateRange: false };
        _this.setState(_this.state);
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
            current.filter.filter = filter;
            this.setState(current);
        }
    }, {
        key: 'useDateRange',
        value: function useDateRange() {
            return this.state.useDateRange;
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
            var filter = this.filters[index].filter;
            if (!filter) this.setDateRange(true);else {
                var newState = { filter: { index: index, filter: filter }, useDateRange: false };
                this.setState(newState);
            }
        }
    }, {
        key: 'useCustomFilter',
        value: function useCustomFilter(filter) {
            this._updateFilter(filter);
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            this._updateFilter(this.state.filter.index);
            $('.cust-dashboard-filter').on('change', this.setFilter.bind(this));
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
                            'select',
                            { className: 'cust-dashboard-filter' },
                            this.filters.map(function (filter, i) {
                                return React.createElement(
                                    'option',
                                    { value: i, key: 'filter-' + i },
                                    filter.name
                                );
                            })
                        ) : undefined
                    ),
                    React.createElement(
                        'div',
                        { className: 'cust-dashboard-tool' },
                        React.createElement(DateRangePickerComponent, { id: this.dashboard_id + "-date-range", onApply: this.useCustomFilter.bind(this), hidden: !this.useDateRange() })
                    )
                ),
                React.createElement(ChartComponent, { name: this.name, dashboard_id: this.dashboard_id, queryId: this.queryId, filter: this.state.filter.filter, sortOn: this.sortOn, chartType: this.props.dashboard.chartType })
            );
        }
    }]);

    return Dashboard;
}(React.Component);