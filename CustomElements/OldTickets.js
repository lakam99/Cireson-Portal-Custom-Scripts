var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var OldTickets = function (_React$Component) {
    _inherits(OldTickets, _React$Component);

    function OldTickets(props) {
        _classCallCheck(this, OldTickets);

        var _this = _possibleConstructorReturn(this, (OldTickets.__proto__ || Object.getPrototypeOf(OldTickets)).call(this, props));

        _this.state = {
            tickets: Array.isArray(props.tickets) ? props.tickets : []
        };
        _this.original_count = _this.state.tickets.length;
        window.oldTicketsUI = _this;
        return _this;
    }

    _createClass(OldTickets, [{
        key: 'close_all_tickets',
        value: function close_all_tickets() {
            var _this2 = this;

            return new Promise(function (resolve, reject) {
                OldTickets.dynamic_request_tickets_close(_this2.state.tickets).then(function () {
                    resolve(true);
                    _this2.setState({ tickets: [] });
                }, function (e) {
                    return reject(e);
                });
            });
        }
    }, {
        key: 'close_ticket',
        value: function close_ticket(ticket) {
            var _this3 = this;

            return new Promise(function (resolve) {
                var ticket_index = _this3.state.tickets.indexOf(ticket);
                if (ticket_index == -1) throw "Cannot find ticket in array.";
                OldTickets.dynamic_request_tickets_close([ticket]).then(function (r) {
                    var tickets = _this3.state.tickets.filter(function (parent_ticket) {
                        return parent_ticket != ticket;
                    });
                    _this3.setState({ tickets: tickets });
                    resolve(true);
                });
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this4 = this;

            return React.createElement(
                'div',
                { 'class': 'old-ticket-app' },
                React.createElement(
                    'h4',
                    { 'class': 'old-ticket-counter' },
                    this.state.tickets.length,
                    '\xA0/\xA0',
                    this.original_count
                ),
                React.createElement(
                    'div',
                    { 'class': 'old-ticket-list' },
                    this.state.tickets.length > 0 ? this.state.tickets.map(function (ticket) {
                        return React.createElement(OldTicket, { key: ticket.Id, ticket: ticket, _close: _this4.close_ticket.bind(_this4) });
                    }) : React.createElement('img', { alt: 'groovy', 'class': 'groovy', src: customGlobalLoader.get_str_url('/CustomSpace/CustomElements/groovy.png') })
                )
            );
        }
    }], [{
        key: 'request_tickets_close',
        value: function request_tickets_close(tickets) {
            return new Promise(function (resolve, reject) {
                if (!tickets.length) {
                    resolve(false);return;
                }
                var ticket_projection = tickets[0].WorkItemType == 'System.WorkItem.ServiceRequest' ? '7ffc8bb7-2c2c-0bd9-bd37-2b463a0f1af7' : '2d460edd-d5db-bc8c-5be7-45b050cba652';
                var close_status = ticketManipulator.constants.statuses.closed[tickets[0].WorkItemType].Id;
                $.ajax({
                    url: window.location.origin + '/api/V3/WorkItem/BulkEditWorkItems',
                    dataType: 'json',
                    type: 'post',
                    data: JSON.stringify({
                        ProjectionId: ticket_projection,
                        UpdateServiceManagement: true,
                        ItemIds: tickets.map(function (ticket) {
                            return ticket.BaseId;
                        }),
                        EditedFields: [{ PropertyName: 'Status',
                            PropertyType: 'enum',
                            EditedValue: close_status }]
                    }),
                    success: function success(r) {
                        resolve(r);
                    },
                    error: function error(e) {
                        reject(e);
                    }
                });
            });
        }
    }, {
        key: 'dynamic_request_tickets_close',
        value: function dynamic_request_tickets_close(tickets) {
            return new Promise(function (resolve, reject) {
                var srqs = tickets.filter(function (ticket) {
                    return ticket.WorkItemType == 'System.WorkItem.ServiceRequest';
                });
                var incs = tickets.filter(function (ticket) {
                    return ticket.WorkItemType == 'System.WorkItem.Incident';
                });
                Promise.all([OldTickets.request_tickets_close(srqs), OldTickets.request_tickets_close(incs)]).then(function (r) {
                    return resolve(true);
                }, function (e) {
                    return reject(e);
                });
            });
        }
    }]);

    return OldTickets;
}(React.Component);