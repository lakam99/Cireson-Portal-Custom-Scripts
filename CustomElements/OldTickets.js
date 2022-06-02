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
        _this.socket_provider = props.socket_provider;
        _this.original_count = _this.state.tickets.length;
        window.oldTicketsUI = _this;
        _this.close_notes = new textBoxPopup("Resolution Comments", 5, "Please provide a detailed resolution comment.");
        return _this;
    }

    _createClass(OldTickets, [{
        key: "clear_tickets",
        value: function clear_tickets() {
            this.setState({ tickets: [] });
        }
    }, {
        key: "close_ticket",
        value: function close_ticket(ticket) {
            var _this2 = this;

            var p_resolve = undefined;
            var r = new Promise(function (resolve) {
                return p_resolve = resolve;
            });
            this.close_notes.prompt_comment().then(function (cancelled) {
                var resolution = _this2.close_notes.get_comment();
                if (cancelled || cancelled == '!criteria') {
                    p_resolve(false);return;
                }

                var ticket_index = _this2.state.tickets.indexOf(ticket);
                if (ticket_index == -1) throw "Cannot find ticket in array.";
                ticketManipulator.dynamic_request_tickets_close([ticket], resolution).then(function (r) {
                    var tickets = _this2.state.tickets.filter(function (parent_ticket) {
                        return parent_ticket != ticket;
                    }); //remove ticket from ticket array
                    _this2.setState({ tickets: tickets });
                    _this2.socket_provider.report_update(tickets);
                    p_resolve(true);
                });
            });
            return r;
        }
    }, {
        key: "render",
        value: function render() {
            var _this3 = this;

            return React.createElement(
                "div",
                { "class": "old-ticket-app" },
                React.createElement(
                    "h4",
                    { "class": "old-ticket-counter" },
                    this.state.tickets.length,
                    "\xA0/\xA0",
                    this.original_count
                ),
                React.createElement(
                    "div",
                    { "class": "old-ticket-list" },
                    this.state.tickets.length > 0 ? this.state.tickets.map(function (ticket) {
                        return React.createElement(OldTicket, { key: ticket.Id, ticket: ticket, _close: _this3.close_ticket.bind(_this3) });
                    }) : React.createElement("img", { alt: "groovy", "class": "groovy", src: customGlobalLoader.get_str_url('/CustomSpace/CustomElements/groovy.png') })
                )
            );
        }
    }]);

    return OldTickets;
}(React.Component);