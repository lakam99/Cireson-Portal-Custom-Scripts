class OldTickets extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tickets: Array.isArray(props.tickets) ? props.tickets:[]
        }
        this.original_count = this.state.tickets.length;
    }

    render() {
        return (
            <div class='old-ticket-app'>
                <h4 class='old-ticket-counter'>{this.state.tickets.length}&nbsp;/&nbsp;{this.original_count}</h4>
                <div class='old-ticket-list'>
                    {
                        this.state.tickets.length > 0 ? this.state.tickets.map(ticket=><OldTicket ticket={ticket} parent={this}></OldTicket>) : <img alt='groovy' class='groovy' src='groovy.png'></img>
                    }
                </div>
            </div>
        );
    }
}