var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var OldTicket = function (_React$Component) {
    _inherits(OldTicket, _React$Component);

    function OldTicket(props) {
        _classCallCheck(this, OldTicket);

        var _this = _possibleConstructorReturn(this, (OldTicket.__proto__ || Object.getPrototypeOf(OldTicket)).call(this, props));

        if (!props.ticket) throw "Must include ticket data.";
        _this.ticket = props.ticket;
        return _this;
    }

    _createClass(OldTicket, [{
        key: 'get_ticket_url',
        value: function get_ticket_url() {
            var url = '';
            var ticket = this.ticket;
            if (ticket.WorkItemType.includes('ServiceRequest')) {
                url = window.location.origin + '/ServiceRequest/Edit/';
            } else if (ticket.WorkItemType.includes('Incident')) {
                url = window.location.origin + '/Incident/Edit/';
            } else if (ticket.WorkItemType.includes('Activity')) {
                url = window.location.origin + '/Activity/Edit/';
            } else {
                return '#';
            }
            url += ticket.Id;
            return url;
        }
    }, {
        key: 'close_ticket',
        value: function close_ticket(e) {
            $(e.target).before('<img alt=\'loading\' name=\'' + this.ticket.Id + '\' src="' + customGlobalLoader.get_str_url('/CustomSpace/CustomElements/loading.gif') + '"></img>');
            this.props._close(this.ticket);
        }
    }, {
        key: 'open_ticket',
        value: function open_ticket() {
            this.window = window.open(this.get_ticket_url(), '_blank', 'location=yes,height=570,width=520,scrollbars=yes,status=yes');
        }
    }, {
        key: 'render',
        value: function render() {
            return React.createElement(
                'div',
                { 'class': 'list-item' },
                React.createElement(
                    'a',
                    { title: this.ticket.CreatedDate, 'class': 'old-ticket-title', onClick: this.open_ticket.bind(this) },
                    this.ticket.Id,
                    ':',
                    this.ticket.Title
                ),
                React.createElement(
                    'a',
                    { 'class': 'close-ticket', onClick: this.close_ticket.bind(this) },
                    'Close'
                )
            );
        }
    }]);

    return OldTicket;
}(React.Component);