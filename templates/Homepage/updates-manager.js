var updatesManager = {
    updates: undefined,
    api: "http://ottansm1:6942/home-update",
    icons: {
        2: {src:'./assets/maintenance.png', alt:'maintenance', type: 2},
        1: {src:'./assets/warn.png', alt:'issue', type: 1},
        3: {src:'./assets/complete.png', alt:'resolved', type: 3}
    },
    item_count: 0,
    container: '#updates',
    new_template: undefined,
    edit_mode: false,
    buttons: {
        edit: '#edit-btn',
        save: '#save-btn',
        cancel: '#cancel-btn'
    },

    setup: [
        function() {
            $.ajax({
                url: updatesManager.api,
                dataType: "json",
                async: false,
                success: (r) => {
                    updatesManager.updates = r;
                }
            })
        },

        function() {
            $.ajax({
                url: updatesManager.api + "/new-template",
                async: false,
                success: (r) => {
                    updatesManager.new_template = r;
                }
            })
        },

        function() {
            updatesManager.listeners.forEach((f)=>{f()});
        }
    ],

    UI: {
        reset_container: function() {
            $(updatesManager.container).html('');
            updatesManager.item_count = 0;
        },

        get_indexes: function() {
            return $(".accordion:not(#item-x)").toArray().map((e)=>{return parseInt($(e).attr('id').replace('item-',''))});
        },

        existing: {
            build_update: function(update_obj) {
                updatesManager.item_count++;
                let icon = updatesManager.icons[update_obj.type];
                update_obj.timestamp === undefined ? new Date().toDateString():update_obj.timestamp;
                return `
                <div class="col-sm-4">
                  <div class="accordion" id='item-${item_count}'>
                    <div class="accordion-item">
                      <h2 class="accordion-header" id='item${item_count}-h'>
                        <button class="accordion-button type-${icon.type}" type="button" data-bs-toggle="collapse" data-bs-target="#item${item_count}-b" data-bs-parent="#item${item_count}">
                          <img class="update-icon" src="${icon.src}" alt='${icon.alt}'>
                          ${update_obj.title}
                        </button>
                      </h2>
                      <div id="item${item_count}-b" class="accordion-collapse collapse show" data-bs-parent="#item${item_count}">
                        <div class="accordion-body">
                            <p>${update_obj.text}</p>
                            <p class="timestamp"> Posted ${update_obj.timestamp} </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                `;
            },
    
            build_updates: function() {
                updatesManager.UI.reset_container();
                updatesManager.updates.forEach((update)=>{
                    $(updatesManager.container).append(updatesManager.UI.existing.build_update(update));
                })
            }
        },

        modify: {
            build_update: function(update_obj) {
                updatesManager.item_count++;
                let icon = updatesManager.icons[update_obj.type];
                update_obj.timestamp === undefined ? new Date().toDateString():update_obj.timestamp;
                return `
                <div class="col-sm-4">
                  <div class="accordion" id='item-${item_count}'>
                    <div class="accordion-item">
                      <h2 class="accordion-header" id='item${item_count}-h'>
                        <div class="accordion-button type-${icon.type}">
                          <img class="update-icon" src="${icon.src}" alt='${icon.alt}'>
                          <input type='text' class='form-control modify-title' value="${update_obj.title}" id='modify-title-${item_count}'/>
                        </div>
                      </h2>
                      <div id="item${item_count}-b" class="accordion-collapse collapse show" data-bs-parent="#item${item_count}">
                        <div class="accordion-body">
                            <textarea class='form-control' id='modify-text-${item_count}'>${update_obj.text}</textarea>
                            <p class="timestamp"> Posted ${update_obj.timestamp} </p>
                            <div class='float-right garbage'></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                `;
            },

            build_updates: function() {
                updatesManager.UI.reset_container();
                updatesManager.updates.forEach((update)=>{
                    $(updatesManager.container).append(updatesManager.UI.modify.build_update(update));
                });
                $(updatesManager.container).append(updatesManager.new_template);

            }
        }
    },

    listeners: [
        function() {
            $(updatesManager.buttons.edit).on('click', (e)=>{
                updatesManager.UI.modify.build_updates();
                updatesManager.toggle_edit_mode(true);
            });
        },

        function() {
            $(updatesManager.buttons.cancel).on('click', (e)=>{
                if (updatesManager.edit_mode) {
                    updatesManager.toggle_edit_mode(false);
                    updatesManager.UI.existing.build_updates();
                }
            })
        },

        function() {
            $(updatesManager.buttons.save).on('click', (e)=>{
                if (updatesManager.edit_mode) {
                    updatesManager.toggle_edit_mode(false);
                    updatesManager.save_updates();
                    updatesManager.UI.existing.build_updates();
                }
            })
        }
    ],

    save_updates: function() {
        var indexes = updatesManager.UI.get_indexes();
        var new_updates = [];
        indexes.forEach((i)=>{
          new_updates.push({
            type: $(`#item${i}-h > div > img`).attr('alt'),
            title: $(`#modify-title-${i}`).val(),
            text: $(`#modify-text-${i}`).val(),
            timestamp: $(`#item-${i} > .accordion-item > div > div > .timestamp`).text().replace('Posted ','').substring(1) || new Date().toDateString()
          });
        });
        updatesManager.updates = new_updates;
        updatesManager.request_save();
    },

    request_save: function() {
        let data = {empty:this.updates.length == 0, updates: updatesManager.updates};
        $.ajax({
            url: updatesManager.api + "/write",
            async: true,
            type: "post",
            data: data,
            success: (r) => {
                kendo.Alert("Successfully saved updates.");
            }
        })
    },

    toggle_edit_mode: function(toggle) {
        updatesManager.edit_mode = toggle;
        if (updatesManager.edit_mode) {
            $(updatesManager.buttons.save).removeClass('disabled');
            $(updatesManager.buttons.cancel).removeClass('disabled');
        } else {
            $(updatesManager.buttons.save).addClass('disabled');
            $(updatesManager.buttons.cancel).addClass('disabled');
        }
    },

    start: function() {
        updatesManager.setup.forEach((f)=>{f()});
    }
}

updatesManager.start();