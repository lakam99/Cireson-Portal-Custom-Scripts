var portalHomepage = {
    homepage_template: customGlobalLoader.get_url('homepage-template'),
    wrapper: '#main_wrapper',
    existence: null,
    aros: undefined,

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
                    $('#arkam-homepage').on('load', portalHomepage.ready);
                }
            }, 500);
        }
    ],

    ready: function() {
        portalHomepage.aros = parent.window.AROManager.aro;
    },

    start: function() {
        portalHomepage.setup.forEach((f)=>{f()});
    }
}

portalHomepage.start();