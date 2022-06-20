function textBoxPopup (title, min_chars, warn_msg) {
    Object.assign(this, {title, min_chars, warn_msg});
    this.id = {container: create_UUID(), textarea: create_UUID()};
    this.comment_added = undefined;

    this.comment_model = () => {
        return this.comment_dialog.model.data('kendoDialog');
    }

    this.prompt_comment = () => {
        if (!this.comment_dialog.built) this.build_comment_model();
        var p = new Promise((resolve)=>{this.comment_added = {resolve}});
        this.comment_dialog.built.then(()=>{
            this.comment_model().open();
        });
        return p;
    }

    this.submit_comment = () => {
        let val = this.get_comment();
        let strip_val = val.replaceAll(' ', '');
        if (strip_val.length < this.min_chars) {
            kendo.alert(this.warn_msg);
            this.comment_added.resolve('!criteria');
        } else {
            this.close_comment = val;
            this.comment_model().close();
            this.comment_added.resolve(false); //not cancelled
        }
    }

    this.cancel_comment = () => {
        this.comment_model().close();
        this.comment_added.resolve(true); //cancelled
    }

    this.get_comment = () => {
        return $(`#${this.id.textarea}`).val();
    }

    this.build_comment_model = () => {
        this.comment_dialog.built = new Promise((resolve)=>{
            $(body).append(this.comment_dialog.template);
            this.comment_dialog.model = $(`#${this.id.container}`).kendoDialog(this.comment_dialog.properties);
            resolve(true);
        })
    }

    this.comment_dialog = {
        built: undefined,
        model: undefined,
        template: `<div id='${this.id.container}'><textarea id='${this.id.textarea}'></textarea></div>`,
        properties: {
            height: "25%",
            title: this.title,
            modal: false,
            visible: false,
            closable: false,
            actions: [
                {text: "Submit", action: this.submit_comment.bind(this), primary: true},
                {text: "Cancel", action: this.cancel_comment.bind(this), primary: false}
            ]
        }
    }
}