class OldTickets extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tickets: Array.isArray(props.tickets) ? props.tickets:[]
        }
        this.original_count = this.state.tickets.length;
    }

    close_ticket(ticket) {
        let ticket_index = this.state.tickets.indexOf(ticket);
        if (ticket_index == -1) throw "Cannot find ticket in array.";
        let tickets = this.state.tickets.filter(parent_ticket=>parent_ticket!=ticket);
        this.setState({tickets})
    }

    render() {
        return (
            <div class='old-ticket-app'>
                <h4 class='old-ticket-counter'>{this.state.tickets.length}&nbsp;/&nbsp;{this.original_count}</h4>
                <div class='old-ticket-list'>
                    {
                        this.state.tickets.length > 0 ? this.state.tickets.map(ticket=><OldTicket key={ticket.Id} ticket={ticket} _close={this.close_ticket.bind(this)}></OldTicket>) : <img alt='groovy' class='groovy' src='groovy.png'></img>
                    }
                </div>
            </div>
        );
    }
}