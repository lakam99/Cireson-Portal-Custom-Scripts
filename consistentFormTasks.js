class ConsistentFormTask extends HTMLElement {
    constructor() {
        super();

        this.onclick = (e) => {
            this.callback(null, customGlobalLoader.ticket);
        }
    }

    set type(value) {
        this.setAttribute('type', value);
    }

    set label(value) {
        this.setAttribute('label', value);
    }

    get type() {
        return this.getAttribute('type');
    }

    get label() {
        return this.getAttribute('label');
    }

    static get observedAttributes() {
        return ['label','type'];
    }

    connectedCallback() {
        this.innerHTML = `<li class='link cs-form__task cs-form__task--custom'>${this.label}</li>`;
    }
}

var consistentFormTasks = {
    tasks: [],
    awaiting_render: [],
    render_waiter: undefined,

    add: (type, label, callback) => {
        if (label === null) {
            app.custom.formTasks.add(type, label, callback);
        } else {
            let e = document.createElement('consistent-form-task');
            e.label = label;
            e.type = type;
            e.callback = callback;
            consistentFormTasks.tasks.push(e);
            consistentFormTasks.render();
        }
    },

    get_srq_tasks: () => {
        return consistentFormTasks.tasks.filter(task=>task.type==formTasks.type.srq);
    },

    get_inc_tasks: () => {
        return consistentFormTasks.tasks.filter(task=>task.type==formTasks.type.inc);
    },

    ticket_is_srq: () => {
        return window.location.href.includes('/ServiceRequest/');
    },

    ticket_is_inc: () => {
        return window.location.href.includes('/Incident/');
    },

    get_task_list: () => {
        return $('ul.taskmenu');
    },

    task_list_exists: () => {
        return consistentFormTasks.get_task_list().length != 0;
    },

    start_render_waiter: () => {
        consistentFormTasks.render_waiter = setInterval(()=>{
            if (consistentFormTasks.task_list_exists()) {
                clearInterval(consistentFormTasks.render_waiter);
                consistentFormTasks.awaiting_render.forEach(task=>consistentFormTasks.get_task_list().append(task));
            }
        }, 1000);
    },

    render: () => {
        var tasks = [];
        if (consistentFormTasks.ticket_is_srq()) {
            tasks = consistentFormTasks.get_srq_tasks();
        } else {
            tasks = consistentFormTasks.get_inc_tasks();
        }
        tasks.forEach((task)=>{
            if (consistentFormTasks.task_list_exists()) {
                consistentFormTasks.get_task_list().append(task);
            } else {
                consistentFormTasks.awaiting_render.push(task);
                if (consistentFormTasks.render_waiter === undefined) 
                    consistentFormTasks.start_render_waiter();
            }
        })
    }
}

customElements.define('consistent-form-task', ConsistentFormTask);