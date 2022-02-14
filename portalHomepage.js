var portalHomepage = {
    homepage_template: customGlobalLoader.get_url('homepage-template'),
    wrapper: '#main_wrapper',
    existence: null,
    iframe: '#arkam-homepage',

    setup: [
        function() {
            $('head').append(`<style>
            html, body, #arkam-homepage, #main_wrapper {
                height: 100%;
                width: 100%;
            }

            #arkam-homepage {
                border: none;
            }
            </stlye>`)
        },

        function() {
            portalHomepage.existence = setInterval(()=>{
                if ($(portalHomepage.wrapper).length) {
                    clearInterval(portalHomepage.existence);
                    $(portalHomepage.wrapper).html(`<iframe id='arkam-homepage' src="${portalHomepage.homepage_template}"></iframe>`);
                    $(portalHomepage.iframe).on('load',(e)=>{
                        $(portalHomepage.iframe).contents().find('#main').after(`
                        <script src='ARO-card-builder.js?v=${customGlobalLoader.get_current_version()}' type="text/javascript"></script>
                        <script src='homepage-render.js?v=${customGlobalLoader.get_current_version()}' type="text/javascript"></script>
                        <script src='updates-manager.js?v=${customGlobalLoader.get_current_version()}' type="text/javascript"></script>
                        `);
                        $(portalHomepage.iframe).off('load');
                    });
                }
            }, 500);
        }
    ],

    start: function() {
        portalHomepage.setup.forEach((f)=>{f()});
    }
}

portalHomepage.start();