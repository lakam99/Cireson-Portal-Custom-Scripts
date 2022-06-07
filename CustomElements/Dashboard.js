import _regeneratorRuntime from 'babel-runtime/regenerator';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var _React = React,
    useEffect = _React.useEffect,
    useState = _React.useState;

function Dashboard(props) {
    var _this = this;

    var filter = props.filter,
        dashboard_id = props.dashboard_id,
        queryId = props.queryId,
        sortOn = props.sortOn,
        name = props.name;

    var data = useState({});
    var dimensions = useState({ width: window.innerWidth, height: window.innerHeight });

    var getData = function () {
        var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee() {
            return _regeneratorRuntime.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            _context.next = 2;
                            return $.getJSON(window.location.origin + "/Dashboard/GetDashboardDataById", { queryId: queryId, filter: filter });

                        case 2:
                            return _context.abrupt('return', _context.sent);

                        case 3:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, _this);
        }));

        return function getData() {
            return _ref.apply(this, arguments);
        };
    }();
    var getCountData = function getCountData(data) {
        var r = {};
        data.forEach(function (item) {
            if (r[item[sortOn]]) r[item[sortOn]]++;else r[item[sortOn]] = 1;
        });
        return r;
    };

    var getConfig = function getConfig(data) {
        var countData = getCountData(data);
        var labels = Object.keys(countData);
        var values = Object.values(countData);
        var cdata = { labels: labels, datasets: [{ label: name, data: values, borderColor: values.map(function () {
                    return randColor();
                }), backgroundColor: values.map(function () {
                    return randColor();
                }) }] };
        var config = { type: 'line', data: cdata, options: {} };
        return config;
    };

    var render = function render() {
        var dashboard_elem = $('#' + dashboard_id);
        dashboard_elem.data({ chart: new Chart(dashboard_elem[0].getContext('2d'), getConfig(data)) });
    };

    useEffect(_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee2() {
        return _regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        _context2.next = 2;
                        return getData();

                    case 2:
                        data = _context2.sent;

                        render();

                    case 4:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, _this);
    })), []);

    useEffect(function () {
        return render();
    }, [data]);

    return React.createElement(
        'div',
        { className: 'cust-dashboard' },
        React.createElement('select', { className: 'cust-dashboard-filter' }),
        React.createElement('canvas', { id: dashboard_id })
    );
}