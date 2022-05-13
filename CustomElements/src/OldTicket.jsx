class OldTicket extends React.Component {
    constructor(props) {
        super(props);
        if (!props.ticket) throw "Must include ticket data.";
        this.ticket = props.ticket;
        this.parent = props.parent;
    }

    get_ticket_url() {
        var url = '';
        var ticket = this.ticket;
        if (ticket.WorkItemType.includes('ServiceRequest')) {
            url = window.location.origin + '/ServiceRequest/Edit/';
        } else if (ticket.WorkItemType.includes('Incident')) {
            url = window.location.origin + '/Incident/Edit/'
        } else if (ticket.WorkItemType.includes('Activity')) {
            url = window.location.origin + '/Activity/Edit/';
        } else {
            return '#'
        }
        url += ticket.Id;
        return url;
    }

    close_ticket(e) {
        let parent_tickets = Object.create(this.parent.state.tickets);
        let me = parent_tickets.indexOf(this.ticket);
        parent_tickets.splice(me, 1);
        this.parent.setState({tickets: parent_tickets});
    }

    render() {
        return (
            <div class='list-item'>
                <a title={this.ticket.CreatedDate} class="old-ticket-title" href="#">{this.ticket.Title}</a>
                <a class="close-ticket" onClick={this.close_ticket.bind(this)}>Close</a>
            </div>
        );
    }
}