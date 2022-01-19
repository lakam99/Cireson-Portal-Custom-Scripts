var emailTemplateClient = {
    api: "http://ottansm1:6942/template",
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
                
                $.ajax({
                    url: emailTemplateClient.api + "/write",
                    type: "post",
                    data: data,
                    async: false,
                    success: (r) => {
                        kendo.alert("Successfully saved template.");
                        window.location.reload();
                    },
                    error: (e) => {
                        kendo.alert("Failed to save template..." + e);
                    }
                });
            }
        }
    },

    setup: function() {
        return new Promise((resolve,reject)=>{
            $.ajax({
                url: emailTemplateClient.api,
                type: 'get',
                data: {username: session.user.UserName},
                dataType: 'json',
                async: true,
                success: (r) => {
                    this.existing_template = r;
                    resolve(true);
                },
                error: (e) => {
                    resolve(false);
                }
            });
        })
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
                            var modify_btn = Array.from(emailTemplateClient.kendo_ui.ul.children()).find((e)=>{return $(e).text() == emailTemplateClient.text[1]});
                            $(modify_btn).on('click', (e)=>{
                                e.preventDefault();
                                emailTemplateClient.dialog.open_dialog();
                                $("#edit-template-text").val(emailTemplateClient.existing_template.Content);
                            })
                        } else {
                            emailTemplateClient.kendo_ui.dataSource.add({Id:'', Name:emailTemplateClient.text[0]});
                            var create_btn = Array.from(emailTemplateClient.kendo_ui.ul.children()).find((e)=>{return $(e).text() == emailTemplateClient.text[0]});
                            $(create_btn).on('click', (e)=>{
                                e.preventDefault();
                                emailTemplateClient.dialog.open_dialog();
                            })
                        }
                    }
                },500);
            }
        });
    },

    start: function() {
        emailTemplateClient.setup().then((r)=>{
            $(body).append(`<div id='email-template-edit-container'></div>`);
            $('#email-template-edit-container').kendoDialog(emailTemplateClient.dialog.get_dialog());
            emailTemplateClient.load_ui()
        })
    }
}

emailTemplateClient.start();