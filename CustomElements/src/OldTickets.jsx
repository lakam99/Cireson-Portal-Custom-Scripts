class OldTickets extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tickets: Array.isArray(props.tickets) ? props.tickets:[]
        }
        this.socket_provider = props.socket_provider;
        this.original_count = this.state.tickets.length;
        window.oldTicketsUI = this;
        this.close_notes = new textBoxPopup("Resolution Comments", 5, "Please provide a detailed resolution comment.");
    }

    clear_tickets() {
        this.setState({tickets:[]})
    }

    close_ticket(ticket) {
        var p_resolve = undefined;
        var r = new Promise((resolve)=>p_resolve = resolve);
        this.close_notes.prompt_comment().then((cancelled)=>{
            let resolution = this.close_notes.get_comment();
            if (cancelled || cancelled == '!criteria') {p_resolve(false);return;}

            let ticket_index = this.state.tickets.indexOf(ticket);
            if (ticket_index == -1) throw "Cannot find ticket in array.";
            ticketManipulator.dynamic_request_tickets_close([ticket], resolution).then((r)=>{
                let tickets = this.state.tickets.filter(parent_ticket=>parent_ticket!=ticket); //remove ticket from ticket array
                this.setState({tickets});
                this.socket_provider.report_update(tickets);
                p_resolve(true);
            })
        })
        return r;
    }

    render() {
        return (
            <div className='old-ticket-app'>
                <h4 className='old-ticket-counter'>{this.state.tickets.length}&nbsp;/&nbsp;{this.original_count}</h4>
                <div className='old-ticket-list'>
                    {
                        this.state.tickets.length > 0 ? this.state.tickets.map(ticket=><OldTicket key={ticket.Id} ticket={ticket} _close={this.close_ticket.bind(this)}></OldTicket>) : <img alt='groovy' className='groovy' src={customGlobalLoader.get_str_url('/CustomSpace/CustomElements/groovy.png')}></img>
                    }
                </div>
            </div>
        );
    }
}