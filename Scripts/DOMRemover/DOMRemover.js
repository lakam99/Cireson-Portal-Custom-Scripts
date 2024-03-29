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
                for (var i = 0, item = DOMRemover.queue[i]; i < DOMRemover.queue.length; i++, item = DOMRemover.queue[i]) {
                    if (item.enabled) {
                        if (item.pages && !item.pages.includes(window.location.pathname)) {
                            item.remove = true;
                            continue;
                        }
                        if ((item.permission === null || item.permission) && !item.granted) {
                            var condition = formTasks.user_has_permissions(item.permission);
                            if (item.mode && item.mode == "inclusive")
                                condition = !condition;
                            if (condition) {
                                item.remove = true;
                                continue;
                            } else {
                                item.granted = true;
                            }
                        }
                        const identity = typeof(item.identify) === 'function' ? item.identify() : $(item.identify);
                        if(identity.length) {
                            $(identity).remove();
                            item.remove = true;
                        }
                    }
                }
            }
            DOMRemover.clean_queue();
        }, 1000);
    },

    clean_queue: function() {
        DOMRemover.queue.forEach(function(item){
            if (item.remove) {
                DOMRemover.queue.splice(DOMRemover.queue.indexOf(item), 1);
            }
        });
    },

    new_queue_item(identify, permission, pages, enabled, mode) {
        if (pages && !Array.isArray(pages)) {
            throw Error("Pages parameter must be array.");
        }
        DOMRemover.queue.push({'identify':identify, 'permission':permission, pages, 'enabled':enabled, 'mode':mode});
    },

    start: function() {
        DOMRemover.setup.forEach(function(f){f()});
    }
}

DOMRemover.start();