class OldTickets extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tickets: Array.isArray(props.tickets) ? props.tickets:[]
        }
        this.original_count = this.state.tickets.length;
        window.oldTicketsUI = this;
    }

    static request_tickets_close(tickets) {
        return new Promise((resolve,reject)=>{
            if (!tickets.length) {resolve(false);return;}
            var ticket_projection = tickets[0].WorkItemType == 'System.WorkItem.ServiceRequest' ? '7ffc8bb7-2c2c-0bd9-bd37-2b463a0f1af7':'2d460edd-d5db-bc8c-5be7-45b050cba652';
            var close_status = ticketManipulator.constants.statuses.closed[tickets[0].WorkItemType].Id;
            $.ajax({
                url: window.location.origin + '/api/V3/WorkItem/BulkEditWorkItems',
                dataType: 'json',
                type: 'post',
                data: JSON.stringify({
                    ProjectionId: ticket_projection,
                    UpdateServiceManagement: true,
                    ItemIds: tickets.map(ticket=>ticket.BaseId),
                    EditedFields: [
                        {PropertyName: 'Status',
                        PropertyType: 'enum',
                        EditedValue: close_status}
                    ]
                }),
                success: (r)=>{resolve(r)},
                error: (e)=> {reject(e)}
            })
        })
    }

    static dynamic_request_tickets_close(tickets) {
        return new Promise((resolve,reject)=>{
            let srqs = tickets.filter(ticket=>ticket.WorkItemType=='System.WorkItem.ServiceRequest');
            let incs = tickets.filter(ticket=>ticket.WorkItemType=='System.WorkItem.Incident');
            Promise.all([OldTickets.request_tickets_close(srqs), OldTickets.request_tickets_close(incs)]).then(r=>resolve(true),e=>reject(e));
        })
    }

    close_all_tickets() {
        return new Promise((resolve,reject)=>{
            OldTickets.dynamic_request_tickets_close(this.state.tickets).then(()=>{
                resolve(true);
                this.setState({tickets:[]});
            }, e=>reject(e));
        })
    }

    close_ticket(ticket) {
        return new Promise((resolve)=>{
            let ticket_index = this.state.tickets.indexOf(ticket);
            if (ticket_index == -1) throw "Cannot find ticket in array.";
            OldTickets.dynamic_request_tickets_close([ticket]).then((r)=>{
                let tickets = this.state.tickets.filter(parent_ticket=>parent_ticket!=ticket);
                this.setState({tickets});
                resolve(true);
            })
        })
    }

    render() {
        return (
            <div class='old-ticket-app'>
                <h4 class='old-ticket-counter'>{this.state.tickets.length}&nbsp;/&nbsp;{this.original_count}</h4>
                <div class='old-ticket-list'>
                    {
                        this.state.tickets.length > 0 ? this.state.tickets.map(ticket=><OldTicket key={ticket.Id} ticket={ticket} _close={this.close_ticket.bind(this)}></OldTicket>) : <img alt='groovy' class='groovy' src={customGlobalLoader.get_str_url('/CustomSpace/CustomElements/groovy.png')}></img>
                    }
                </div>
            </div>
        );
    }
}