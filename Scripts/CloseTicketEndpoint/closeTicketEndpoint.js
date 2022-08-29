!(async function(){
    const write = (text) => {$('#main_wrapper').html(`<h1 style='text-align:center'>${text}</h1>`)}
    const ticketId = new URLSearchParams(window.location.search).get('ticketId');
    if (!ticketId) {
        write("No ticket id provided to close. 😢");
        return;
    }
    let ticket = await customAPI.loadTicketJSON(ticketId);
    if (!ticket) {
        write(`Failed to retrieve ticket ${ticketId}.`);
        return;
    }

    write(`<img src='${window.location.origin}\\CustomSpace\\CustomElements\\loading.gif'>`);
    await fetch(`https://ottansm1.nserc.ca:5000/close-ticket?ticketId=${ticket.BaseId}`);
    write(`${ticketId} is now closed!`);
})()