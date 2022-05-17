class OldTicket extends React.Component {
    constructor(props) {
        super(props);
        if (!props.ticket) throw "Must include ticket data.";
        this.ticket = props.ticket;
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
        $(e.target).before(`<img alt='loading' name='${this.ticket.Id}' src="${customGlobalLoader.get_str_url('/CustomSpace/CustomElements/loading.gif')}"></img>`)
        this.props._close(this.ticket).then(()=>{
            $(`img[name='${this.ticket.Id}']`).remove();
        });
    }

    open_ticket() {
        this.window = window.open(this.get_ticket_url(), '_blank', 'location=yes,height=570,width=520,scrollbars=yes,status=yes');
    }

    render() {
        return (
            <div class='list-item'>
                <a title={this.ticket.CreatedDate} class="old-ticket-title" onClick={this.open_ticket.bind(this)}>{this.ticket.Id}:{this.ticket.Title}</a>
                <a class="close-ticket" onClick={this.close_ticket.bind(this)}>Close</a>
            </div>
        );
    }
}