class ArrayList extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        var r = '<ul>';
        $(this).data('array').forEach(item=>r += `<li>${item}</li>`);
        r += '</ul>'
        this.innerHTML = r;
    }
}

customElements.define('array-list', ArrayList);