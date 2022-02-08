var HomepageRenderer = {
    aros: parent.window.AROManager.aro,
    service_offerings: undefined,
    request_offerings: {},
    dropdown: '#help',
    content: '#content',
    pages: 'div.service-page',

    setup: [
        function () {
            //first, get service offerings
            HomepageRenderer.service_offerings = [...new Set(HomepageRenderer.aros.map((a)=>{return a.Service}))]; //return a unique array of services
        },

        function () {
            //then build dropdown list, service offering pages, and sort request offerings
            HomepageRenderer.service_offerings.forEach((service, i)=>{
                $(HomepageRenderer.dropdown).append(`<option value='${i+1}'>${service}</option>`);
                $(HomepageRenderer.content).append(`<div name='${i+1}' id="${service.replace(' ','-')}" class="service-page border border-4 rounded" style="display:none"></div>`);
                HomepageRenderer.request_offerings[service] = HomepageRenderer.aros.filter((aro)=>{
                    return aro.Service == service;
                })
            })
        }
    ],

    functionality: {
        hide_all: function() {
            $(HomepageRenderer.pages).toArray().forEach((e)=>{
                $(e).css('display', 'none');
            })
        },

        show: function(numeric_name) {
            $(`div[name='${numeric_name}']`).css('display', 'block');
        }
    },

    start: function() {
        HomepageRenderer.setup.forEach((f)=>{f()});
    }
}

HomepageRenderer.start();