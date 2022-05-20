class OldOpenTickets extends WebsocketProviderClient {
    constructor() {
        super('Old Open Tickets');
        this.construct_ui();
        this.close_notes = new textBoxPopup("Resolution Comments", 5, "Please provide a detailed resolution comment.");
    }

    construct_ui() {
        this.ui = {
            template: customGlobalLoader.get_str_url('/CustomSpace/Templates/Old Open Tickets/old-open-tickets-ui.html'),
            required_elems: ['/CustomSpace/CustomElements/OldTickets.js', '/CustomSpace/CustomElements/OldTicket.js'],
            dialog: {
                height: "85%",
                width: "45%",
                title: 'Your Old Open Tickets',
                modal: true,
                visible: false,
                closable: false,
                actions: [
                    {text: "Close All", action: this.close_all.bind(this), primary: true},
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
        }), Promise.all(customGlobalLoader.main.load_files({array:this.ui.required_elems.map(elem=>new urlObj(elem))}))]
    }

    ask_provider_to_work() {
        this.send({request:'work', params: {userId:session.user.Id}});
    }

    report_update(data) {
        this.send({request:'report', data:data});
    }

    build_ui(data) {
        this.ui_built = new Promise((resolve) => {
            customGlobalLoader.main.load_react().then(()=>{
                Promise.all(this.load_assets()).then(()=>{
                    this.ui.dialog.content = this.ui.template;
                    $('body').append(this.ui.dialog.content);
                    this.ui.model = $('#old-open-tickets-ui').kendoDialog(this.ui.dialog);
                    let reactRoot = $('.old-ticket-container')[0];
                    reactRoot = ReactDOM.createRoot(reactRoot);
                    reactRoot.render(React.createElement(OldTickets, {tickets:data, socket_provider:this}));
                    resolve(true);
                })
            })
        });
    }

    get model() {
        return this.ui.model.data('kendoDialog');
    }

    show_ui(data) {
        if (!this.ui_built) this.build_ui(data);
        this.ui_built.then(()=>{this.model.open()});
    }

    static get_user_obj() {
        return {Id: session.user.Id, Name: session.user.Name, UserName: session.user.userName};
    }

    close_all() {
        this.close_notes.prompt_comment().then((cancelled)=>{
            if (cancelled) {this.model.open();return};
            this.model.close();
            ticketManipulator.show_loading();
            this.send({request:'work', params: {close_all: true, user: OldOpenTickets.get_user_obj(), closing_comment:this.close_notes.get_comment()}});
            ticketManipulator.request_tickets_close(window.oldTicketsUI.state.tickets, this.close_notes.get_comment()).then((r)=>{
                ticketManipulator.remove_loading();
                this.model.open();
                this.report_update([]);
            });
        });
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
            else
                this.connection.close();
        } else {
            console.log(data);
        }
    }
}

const oldOpenTickets = new OldOpenTickets();