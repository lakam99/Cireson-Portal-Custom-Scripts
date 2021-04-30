//Written by Arkam Mazrui for the Cireson web portal
//arkam.mazrui@nserc-crsng.gc.ca
//arkam.mazrui@gmail.com

var AROManager = {
    config: "AROManagerConfig",
    aro: undefined,
    queue: [],
    _main: null,
    setup: [
        function() {
            $.ajax({
                url: window.location.origin + "/ServiceCatalog/GetUserRequestOffering",
                type: "get",
                dataType: "json",
                async: false,
                success: function(re) {
                    AROManager.aro = re;
                }
            });
        },

        function() {
            $.ajax({
                url: customGlobalLoader.get_url(AROManager.config),
                dataType: "json",
                async: "true",
                success: function(re) {
                    AROManager.config = re;
                    AROManager.queue = AROManager.config.steal.service_offerings;
                    AROManager.ready();
                }
            });
        }
    ],

    ready: function() {
        AROManager.queue.forEach(function(so) {
            var name = AROManager.get_SO_from_id(so.service_offering_id).Category.replaceAll(" ", "-").toLowerCase();
            var category_id = AROManager.get_SO_from_id(so.service_offering_id).CategoryId;
            DOMRemover.new_queue_item(`div.cat:has(h4#${so.service_offering_id}),div.cat-${name}`, undefined, so.steal_from, true);
            DOMRemover.new_queue_item(`li:has(a.cat-link[data-target='#${category_id}'])`, undefined, so.steal_from, true);
        });
        AROManager.run_listener();
    },

    run_listener: function() {
        AROManager._main = setInterval(function(){
            AROManager.queue.forEach(function(item){
                if (window.location.pathname == item.move_to && AROManager.UI_Builder.ready) {
                    AROManager.UI_Builder.build_and_render_SO(item.service_offering_id);
                    item.remove = true;
                }
            });
            AROManager.clean_queue();
        }, 100);
    },

    clean_queue: function() {
        AROManager.queue.forEach(function(item){
            if (item.remove) {
                AROManager.queue.splice(AROManager.queue.indexOf(item), 1);
            }
        })
    },

    get_SO_from_id(service_offering_id) {
        var so = {ro: []};
        for (var i = 0, item = AROManager.aro[i]; i < AROManager.aro.length; i++, item = AROManager.aro[i]) {
            if (item.ServiceOfferingId == service_offering_id) {
                if (!so.Category) {
                    so = Object.assign(so, item); 
                }
                so.ro.push(item);
            }
        }
        return so;
    },

    start: function() {
        AROManager.UI_Builder.setup();
        AROManager.setup.forEach(function(f){f()});
    },

    UI_Builder: {
        SO_template: "SO-template",
        RO_template: "RO-template",
        ready: false,
        setup: 
            function() {
                $.ajax({
                    url: customGlobalLoader.get_url(AROManager.UI_Builder.SO_template),
                    dataType: "text",
                    async: false,
                    success: function(re) {
                        AROManager.UI_Builder.SO_template = kendo.template(re);
                        $.ajax({
                            url: customGlobalLoader.get_url(AROManager.UI_Builder.RO_template),
                            dataType: "text",
                            async: true,
                            success: function(re) {
                                AROManager.UI_Builder.RO_template = kendo.template(re);
                                AROManager.UI_Builder.ready = true;
                            }
                        });
                    }
                });
            },

        build_and_render_SO: function(service_offering_id) {
            var so = AROManager.get_SO_from_id(service_offering_id);
            var template = AROManager.UI_Builder.SO_template;
            var html_so = template(so);
            var dom_so = document.createElement('template');
            dom_so.innerHTML = html_so;
            dom_so = dom_so.content.childNodes[0];
            var ros = $(dom_so).find("div.sc-item-list")[0];
            $(ros).append(AROManager.UI_Builder.build_request_offerings(so));
            var xyz_summon = setInterval(function(){
                if ($("#nserc-dump").length) {
                    $("#nserc-dump").append(dom_so);
                    clearInterval(xyz_summon);
                }
            }, 10);
        },

        build_request_offerings: function(so) {
            var html = "";
            so.ro.forEach(function(ro) {
                html += AROManager.UI_Builder.build_request_offering(ro);
            });
            return html;
        },

        build_request_offering: function(ro) {
            var template = AROManager.UI_Builder.RO_template;
            return template(ro);
        }
    },
}

AROManager.start();