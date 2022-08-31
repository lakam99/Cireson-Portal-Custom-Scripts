!(function () {
    var html = `<div id="af-view"><img alt='loading' src='${customGlobalLoader.get_str_url('/CustomSpace/CustomElements/loading.gif')}'></div>`;
    var columns = [
        {field: "Id", template: `<a target='_blank' href='#var url = app.gridUtils.getLinkUrl(data, "WorkItem");##=url#'>#: Id # </a>`},
        {field: "Title"},
        {field: "Status"},
        {field: "LastModified"}
    ];
    var recheckRate = 500; //ms
    var get_affected_user_id = () => {return accentSuggest.getters.get_page_userpicker_objs()[0].dataSource.data()[0].Id || ''}

    var dataSource = {
        transport: {
            read: {
                url: window.location.origin + "/api/V3/WorkItem/GetGridWorkItemsMyRequests",
                dataType: 'json',
                data: {
                    userId: '',
                    showInactiveItems: 'False'
                }
            }
        },
        filter: {
            logic: 'and',
            filters: create_filter('Status', 'ne', 'Completed','Resolved','Closed','Cancelled','Skipped')
        },
        change: (e) => {
            $('img[alt="loading"]').remove();
        }
    };

    var get_tabs = () => {return $('#myTab')}
    var get_grid = () => {return $('#af-view')}

    var _build = () => {
        var id = get_affected_user_id();
        dataSource.transport.read.data.userId = id;
        if (id != '') {
            $('#af-view').remove();
            get_tabs().after(html);
            get_grid().kendoGrid({columns, dataSource});
        }
    }

    var UI_build_factory = () => {
        var ui_ready = false;
        return () => {
            if (!ui_ready) {
                $('.form-panel').prepend('<div id="cust-tab-container" class="flex-row"></div>');
                get_tabs().detach().appendTo('#cust-tab-container');
                ui_ready = true;
            }
            _build();
        }
    }

    var build = UI_build_factory();

    var ticket_loaded = setInterval(()=>{
        if (get_tabs().length) {
            clearInterval(ticket_loaded);
            if (session.user.Analyst) {
                build();
                accentSuggest.getters.get_page_userpicker_objs()[0].bind('dataBound',build.bind(this));
            }
        }
    }, recheckRate);
    
})()