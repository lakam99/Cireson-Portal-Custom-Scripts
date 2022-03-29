var HomepageRenderer = {
    aros: parent.window.AROManager.aro,
    service_offerings: undefined,
    request_offerings: {},
    dropdown: '#help',
    content: '#content',
    pages: 'div.service-page',
    aro_pages: 'div.service-page:not(#newsletter)',
    options: '.service-option',

    setup: [
        /*function() {
            if (parent.settings_controller.get_setting_value('darkMode')) {
                var link = parent.customGlobalLoader.get_str_url("/CustomSpace/CustomSettings/darkMode/darkMode.css");
                $("head").before('<link type="text/css" rel="stylesheet"' +
                'id="dark-mode-general-link" href="'+link+'">');
            }
        },*/
        
        function () {
            $(document).prop('title', 'Service Manager Portal Homepage');
        },

        function () {
            //first, get service offerings
            HomepageRenderer.service_offerings = [...new Set(HomepageRenderer.aros.map((a)=>{return a.Service}))]; //return a unique array of services
        },

        function () {
            //then build dropdown list, service offering pages, and sort request offerings
            HomepageRenderer.service_offerings.forEach((service, i)=>{
                HomepageRenderer.request_offerings[service] = HomepageRenderer.aros.filter((aro)=>{
                    return aro.Service == service;
                });

                $(HomepageRenderer.dropdown).append(`<option class='service-option' value='${i+1}'>${service}</option>`);
                $(HomepageRenderer.content).append(`<div name='${i+1}' id="${service.replace(' ','-')}" class="service-page border border-4 rounded" style="display:none"></div>`);
            
                $(`div[name='${i+1}'`).data({aros: HomepageRenderer.request_offerings[service]});
            })
        },

        function() {
            //build ARO pages
            $(HomepageRenderer.aro_pages).toArray().forEach((page)=>{
                $(page).html(AROCardBuilder.build_service_page($(page).data().aros));
            });
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
        },

        display: function(numeric_name) {
            HomepageRenderer.functionality.hide_all();
            HomepageRenderer.functionality.show(numeric_name);
        }
    },

    listeners: [
        function() {
            //dropdowns
            $(HomepageRenderer.dropdown).on('change', (e)=>{
                HomepageRenderer.functionality.display($(HomepageRenderer.dropdown).val());
            });
        }
    ],

    bind_listeners: function() {
        HomepageRenderer.listeners.forEach((f)=>{f()});
    },

    start: function() {
        HomepageRenderer.setup.forEach((f)=>{f()});
        HomepageRenderer.bind_listeners();
    }
}

HomepageRenderer.start();