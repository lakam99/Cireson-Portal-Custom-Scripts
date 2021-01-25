//Written by Arkam Mazrui for the Cireson web portal
//arkam.mazrui@nserc-crsng.gc.ca
//arkam.mazrui@gmail.com

var htmlInjector = {
    
    config: customGlobalLoader.get_url("htmlInjectorConfig"),

    setup: [
        function() {
            $.ajax({
                url: htmlInjector.config,
                dataType: "json",
                async: false,
                success: function(res) {
                    htmlInjector.config = res;
                }
            });
        },

        function() {
            htmlInjector.config.items.forEach(function(item){
                if (item.enabled) {
                    $.ajax({
                        url: window.location.origin + item.template,
                        dataType: "text",
                        async: false,
                        success: function(res) {
                            item.template = res;
                        }
                    });
                }
            });
        }
    ],

    main: {
        render: function() {
            htmlInjector.config.items.forEach(function(item){
                if (item.enabled && window.location.origin + item.page == window.location.href) {
                    var w8_i = setInterval(function(){
                        if ($(item.before_filter).length) {
                            $(item.before_filter).before(item.template);
                            clearInterval(w8_i);
                        }
                    }, 10);
                }
            });
        },

        setup: function() {
            htmlInjector.setup.forEach(function(f){f()});
        },

        run: function() {
            htmlInjector.main.setup();
            $(document).ready(htmlInjector.main.render);
        }
    }
}

htmlInjector.main.run();