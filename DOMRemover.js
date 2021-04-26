//Written by Arkam Mazrui for the Cireson web portal
//arkam.mazrui@nserc-crsng.gc.ca
//arkam.mazrui@gmail.com

var DOMRemover = {
    config: "DOMRemover-Config",
    queue: [],
    _main: null,
    
    setup: [
        function() {
            $.ajax({
                url: customGlobalLoader.get_url(DOMRemover.config),
                async: true,
                dataType: "json",
                success: function(re) {
                    DOMRemover.config = re;
                    DOMRemover.queue = DOMRemover.queue.concat(DOMRemover.config.removeItems);
                    DOMRemover.run_queue();
                }
            });
        }
    ],

    run_queue: function() {
        DOMRemover._main = setInterval(function() {
            if (DOMRemover.queue.length) {
                DOMRemover.queue.forEach(function(item) {
                    if (item.enabled) {
                        if (item.page && item.page != window.location.pathname) {
                            item.remove = true;
                        }
                        else if (item.permission && !item.granted) {
                            if (formTasks.user_has_permission(item.permission)) {
                                item.remove = true;
                            } else {
                                item.granted = true;
                            }
                        }
                        if ($(item.identify).length) {
                            $(item.identify).remove();
                            item.remove = true;
                        }
                    }
                });
            }
            DOMRemover.clean_queue();
        }, 100);
    },

    clean_queue: function() {
        DOMRemover.queue.forEach(function(item){
            if (item.remove) {
                DOMRemover.queue.splice(DOMRemover.queue.indexOf(item), 1);
            }
        });
    },

    new_queue_item(identify, permission, page, enabled) {
        DOMRemover.queue.push({identify, permission, enabled});
    },

    start: function() {
        DOMRemover.setup.forEach(function(f){f()});
    }
}

DOMRemover.start();