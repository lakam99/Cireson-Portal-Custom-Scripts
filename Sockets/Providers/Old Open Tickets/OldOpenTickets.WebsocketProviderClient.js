class OldOpenTickets extends WebsocketProviderClient {
    constructor() {
        super('Old Open Tickets');
    }

    ask_provider_to_work() {
        this.send({request:'work', params: {userId:session.user.Id}});
    }

    process_provider(data) {
        if (data.error) {
            throw data.message;
        } else {
            console.log(data.data);
        }
    }
}