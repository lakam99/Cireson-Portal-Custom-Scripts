class OldOpenTickets extends WebsocketProviderClient {
    constructor() {
        super('Old Open Tickets');
        this.construct_ui();
    }

    construct_ui() {
        this.ui = {
            template: customGlobalLoader.get_str_url('/CustomSpace/Templates/Old Open Tickets/old-open-tickets-ui.html'),
            required_elems: ['/CustomSpace/CustomElements/OldTickets.js', '/CustomSpace/CustomElements/OldTicket.js'],
            dialog: {
                height: "85%",
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
        }), Promise.all(customGlobalLoader.main.load_files({array:this.ui.required_elems.map(elem=>new url(elem))}))]
    }

    ask_provider_to_work() {
        this.send({request:'work', params: {userId:session.user.Id}});
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
                    reactRoot.render(React.createElement(OldTickets, {tickets:data}));
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