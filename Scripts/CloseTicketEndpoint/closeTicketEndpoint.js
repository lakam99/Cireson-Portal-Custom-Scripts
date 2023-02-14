!(async function(){
    const write = (text) => {$('#main_wrapper').html(`<h1 style='text-align:center'>${text}</h1>`)}
    write(`<img src='${window.location.origin}\\CustomSpace\\CustomElements\\loading.gif'>`);
    const url = new URL(window.location.href);
    const params = url.searchParams;
    const ticketId = params.get('ticketId');
    const newStatus = params.get('newStatus');
    const signature = params.get('signature');
    var prevUrl = new URL(window.location.href);
    var noBaseId = false;
    let ticket;
    prevUrl.searchParams.delete('signature');
    prevUrl = prevUrl.toString();
    
    if (!ticketId) {
        write("No ticket id provided to close. 😢");
        return;
    }
    try {
        ticket = await customAPI.loadTicketJSON(ticketId);
    } catch {
        if (!signature) {
            write("Unauthorized request");
            return;
        } else {
            noBaseId = true;
        }
    }

    const ticketBaseId = noBaseId ? ticketId : (ticketId.toLowerCase().slice(0,3) == 'mna' ? ticket?.Activity?.find(activity => activity.Id == ticketId) : ticket).BaseId;
    if (ticketBaseId) {
        const setStatus = newStatus ? newStatus : (ticketId.toLowerCase().slice(0, 3) == 'srq' || 'mna' ? 'Completed' : 'Resolved');
        try {
            await new Promise((resolve, reject) => {
                $.ajax({
                    url: 'https://ottansm1.nserc.ca:5000/change-status',
                    type: 'post',
                    data: {
                        ticketId: ticketBaseId,
                        newStatus: setStatus,
                        signature,
                        prevUrl,
                        noBaseId
                    },
                    success: () => {resolve()},
                    error: (e) => {reject(e)}
                });
            });
            write(`${ticketId} is now ${setStatus}!`);
        } catch(e) {
            write(`Something went wrong: <br> ${e.message}`);
        }
    } else {
        write(`Failed to retrieve BaseId for ticket ${ticketId}.`);
    }

})()