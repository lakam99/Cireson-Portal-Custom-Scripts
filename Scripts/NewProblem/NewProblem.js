!(async function() {
    $('head').append(`<style>html, body, #main_wrapper,#root {height: 100%;width:100%;margin:unset;padding:unset;}</style>`);
    const wrapper = "#main_wrapper";
    const frame = "#incARO";
    $(wrapper).html(`<iframe id='incARO' src='https://ottansm1.nserc.ca:5000/incidentARO.html' style='height:100%;width:100%;'>`)


    existence_waiter(()=>{return $(frame).length > 0}, null, 100).then(()=>{
        setTimeout(()=>{
            $('#incARO')[0].contentWindow.postMessage({name: session.user.FirstName}, '*');
        }, 1000)
    })

    window.addEventListener('message', ({data}) => {
        if (data.open_inc) {
            settings_controller.set_setting('transfer-to-aro', [{inputIndex: 0, data: data.product}]);
            window.location.assign(window.location.origin + '/SC/ServiceCatalog/RequestOffering/a6360a4e-2444-4270-47c5-f9a52bc3668a,0ee5afaa-a0be-e5bd-e6b8-42bc867fd9c5');
        }
    })
})()