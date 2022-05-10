class OldOpenTickets extends WebsocketProviderClient {
    constructor() {
        super('Old Open Tickets');
        this.construct_ui();
    }

    construct_ui() {
        this.ui = {
            template: '/CustomSpace/Templates/Old Open Tickets/old-open-tickets-ui.html',
            required_elem: '/CustomSpace/CustomElements/ArrayList.js',
            dialog: {
                width: '600px',
                title: 'Your Old Open Tickets',
                modal: true,
                visible: false,
                actions: [
                    {text: "Close All", action: undefined, primary: true},
                    {text: "Acknowledge", action: this.send_acknowledgement.bind(this), primary: false}]
            },
            model:undefined
        }
        this.ui_built = false;
    }

    load_assets() {
        return [new Promise((resolve,reject)=>{
            $.ajax({
                url: this.ui.template,
                success: (r) => {this.ui.template = r;resolve()},
                error: (e) => {reject(e)}
            })
        }), customGlobalLoader.main.load_file({url:this.ui.required_elem})]
    }

    ask_provider_to_work() {
        this.send({request:'work', params: {userId:session.user.Id}});
    }

    static get_ticket_url(ticket) {
        var url = '';
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

    static format_data(data) {
        return data.map((ticket)=>{
            return `<a title='${ticket.Created}' href='${OldOpenTickets.get_ticket_url(ticket)}'>${ticket.Id}: ${ticket.Title}</a>`;
        })
    }

    build_ui(data) {
        this.ui_built = new Promise((resolve) => {
            Promise.all(this.load_assets()).then(()=>{
                this.ui.dialog.content = this.ui.template;
                $('body').append(this.ui.dialog.content);
                this.ui.model = $('#old-open-tickets-ui').kendoDialog(this.ui.dialog);
                let list = document.createElement('array-list');
                $(list).data({array:OldOpenTickets.format_data(data)});
                $('#old-tickets-container').append(list);
                resolve(true);
        })});
    }

    get model() {
        return this.ui.model.data('kendoDialog');
    }

    show_ui(data) {
        if (!this.ui_built) this.build_ui(data);
        this.ui_built.then(()=>{this.model.open()});
    }

    send_acknowledgement() {
        this.send({request:'acknowledge'});
        this.model.close();
    }

    process_provider(data) {
        if (data.error) {
            throw data.message;
        } else if (data.data && data.data.length) {
            this.data = data.data;
            if (!data.acknowledged)
                this.show_ui(this.data);
        } else {
            console.log(data);
        }
    }
}