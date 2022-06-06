var emailTemplateClient = {
    api: "https://ottansm1.nserc.ca:5000/template",
    existing_template: null,
    existence: null,
    ui_hook: '#templateDiv > span > input',
    kendo_ui: null,
    text: ['Create One!', 'Modify Template'],
    template_input_dialog: {
        width: "502px",
        title: "Create / Modify your Template",
        modal: true,
        visible: false
    },
    promise_resolver:undefined,

    dialog: {
        get_dialog: function() {
            var r = emailTemplateClient.template_input_dialog;
            r.content = `<textarea id='edit-template-text'></textarea>`;
            r.actions = [{text: "Submit", action: emailTemplateClient.dialog.actions.submit, primary: true},
                         {text: "Cancel", action: null, primary: false}];
            return r;
        },

        open_dialog: function() {
            $('#email-template-edit-container').data('kendoDialog').open();
        },

        actions: {
            submit: function() {
                var template = $("#edit-template-text").val();
                var data = {username: session.user.UserName, template: template};
                emailTemplateClient.api_scope(`
                $.ajax({
                    url: "${emailTemplateClient.api}/write",
                    type: "post",
                    data: ${JSON.stringify(data)},
                    async: false,
                    success: (r) => {
                        parent.window.postMessage({type: 'write-template', success: true}, '*');
                    },
                    error: (e) => {
                        parent.window.postMessage({type: 'write-template', success: false, error: e}, '*');
                    }
                });
                `);
            }
        }
    },

    setup: async function() {
        $("body").append(`<iframe id='api-scope' src='https://ottansm1.nserc.ca:5000/index'></iframe>`);
        window.addEventListener('message', (e)=>{
            switch (e.data.type) {
                case 'get-template':
                    emailTemplateClient.promise_resolver(e.data.data);
                    break;
                case 'write-template':
                    if (e.data.success) {
                        kendo.alert("Successfully saved template.");
                        window.location.reload();
                    } else {
                        kendo.alert("Failed to save template..." + e.data.error);
                    }
                    break;
                default:
                    break;
            }
        })
        await emailTemplateClient.api_scope(`
        $.ajax({
            url: "${emailTemplateClient.api}",
            type: 'get',
            data: {username: "${session.user.UserName}"},
            dataType: 'json',
            async: true,
            success: (r) => {
                parent.window.postMessage({type: 'get-template', data: r}, '*');
            },
            error: (e) => {
                parent.window.postMessage({type: 'get-template', data: undefined}, '*');
            }
        });`)
        return new Promise((resolve,reject)=>{emailTemplateClient.promise_resolver = resolve});
    },
    
    load_ui: function() {
        return new Promise((resolve,reject)=>{
            if (window.location.href.includes('/Edit/')) {
                emailTemplateClient.existence = setInterval(()=>{
                    if ($(emailTemplateClient.ui_hook).length) {
                        clearInterval(emailTemplateClient.existence);
                        emailTemplateClient.kendo_ui = $(emailTemplateClient.ui_hook).data('kendoComboBox');
                        if (emailTemplateClient.existing_template) {
                            emailTemplateClient.kendo_ui.dataSource.add(emailTemplateClient.existing_template);
                            emailTemplateClient.kendo_ui.dataSource.add({Id:'', Name:emailTemplateClient.text[1]});
                            var bind_click = ()=>{
                                var modify_btn = Array.from(emailTemplateClient.kendo_ui.ul.children()).find((e)=>{return $(e).text() == emailTemplateClient.text[1]});
                                $(modify_btn).on('click', (e)=>{
                                    e.preventDefault();
                                    emailTemplateClient.dialog.open_dialog();
                                    $("#edit-template-text").val(emailTemplateClient.existing_template.Content);
                                })
                            };
                            bind_click();
                            emailTemplateClient.kendo_ui.bind('change', bind_click);

                        } else {
                            emailTemplateClient.kendo_ui.dataSource.add({Id:'', Name:emailTemplateClient.text[0]});
                            var bind_click = ()=>{
                                var create_btn = Array.from(emailTemplateClient.kendo_ui.ul.children()).find((e)=>{return $(e).text() == emailTemplateClient.text[0]});
                                $(create_btn).on('click', (e)=>{
                                    e.preventDefault();
                                    emailTemplateClient.dialog.open_dialog();
                                })
                            };
                            bind_click();
                            emailTemplateClient.kendo_ui.bind('change', bind_click);
                        }
                    }
                },500);
            }
        });
    },

    api_scope: function(str_function) {
        return new Promise((resolve,reject)=>{
            var b = setInterval(()=>{
                var n = 'api-scope';
                if ((`#${n}`).length) {
                    clearInterval(b);
                    $(`#${n}`)[0].contentWindow.postMessage({method: str_function}, '*');
                    resolve(true);
                }
            }, 500);
        })
    },

    start: function() {
        emailTemplateClient.setup().then((r)=>{
            emailTemplateClient.existing_template = r;
            $(body).append(`<div id='email-template-edit-container'></div>`);
            $('#email-template-edit-container').kendoDialog(emailTemplateClient.dialog.get_dialog());
            emailTemplateClient.load_ui()
        })
    }
}

emailTemplateClient.start();