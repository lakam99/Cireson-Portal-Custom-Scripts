class WebsocketProviderClient {
    constructor(name, onclose) {
        this.name = name;
        this.connection = new WebSocket(WebsocketProviderClient.get_server());
        this.connection.addEventListener('open', this.handshake());
        this.connection.onclose = onclose ? onclose : (d) => {this.connected=false;console.log("Connection aborted.")};
        this.connected = false;
    }

    static get_server() {
        return 'wss://ottansm1.nserc.ca:8181';
    }

    send(data) {
        this.connection.send(JSON.stringify(data));
    }

    static receive(data) {
        return JSON.parse(data);
    }

    process_provider(data) {
        //to override
    }

    ask_provider_to_work() {
        this.send({request:'work', params: []});
    }

    connect_to_provider() {
        this.connected = true;
        this.connection.onmessage = (data) => {
            this.process_message(WebsocketProviderClient.receive(data.data));
        }
        this.ask_provider_to_work();
    }

    process_message(data) {
        if (data.error)
            throw data.error;
         else
            this.process_provider(data);
    }

    handshake() {
        return () => {
            this.send({provider:this.name});
            this.connection.addEventListener('message', (data)=>{
                let parsed = WebsocketProviderClient.receive(data.data);
                if (parsed.accepted) {
                    this.connect_to_provider();
                }
            }, {once:true});
        }
    }
}