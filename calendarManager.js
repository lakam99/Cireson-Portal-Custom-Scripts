//Written by Arkam Mazrui for the Cireson web portal
//arkam.mazrui@nserc-crsng.gc.ca
//arkam.mazrui@gmail.com

function calendarEvent(title, description, start, end) {
    this.title = title, this.description = description, this.start = new Date(start), this.end = new Date(end);
}

var calendarManager = {
    obj: "[data-role='scheduler']",
    pages: ["/View/dc7957ab-6842-4453-aa7a-a5f2852043d7", "/View/1ae3ffa1-fc12-4f9b-966b-57671cb06ce8"],
    page: {"/View/dc7957ab-6842-4453-aa7a-a5f2852043d7": "myworkitems", "/View/1ae3ffa1-fc12-4f9b-966b-57671cb06ce8": "myteamsworkitems"},
    data: [],
    data_loaded: false,
    setup: [
        async function(page_num) {
            page_num = page_num ? page_num : 1;
            calendar_type = calendarManager.page[window.location.pathname];

            $.ajax({
                url: "http://ottansm2/grid/data/",
                type: "post",
                dataType: "json",
                async: true,
                data: {
                    sort: null, page: page_num,
                    pageSize: 100, group:null,
                    filter: null,
                    filters: JSON.stringify(
                        {"gridType":"WorkItem",
                        "subType":calendar_type,
                        "showActivities":"true",
                        "showInActives":"true"})},

                success: function(re){
                    calendarManager.data = calendarManager.data.concat(re.Data);
                    if (re.Total < calendarManager.data.length) {
                        //queue more requests
                        calendarManager.setup[0](page_num + 1);
                    }
                    calendarManager.data_loaded = true;
                }
            })
        },

        function(){
            var data_w8 = setInterval(function(){
                if (calendarManager.data_loaded) {
                    var clean = [];
                    calendarManager.data.forEach(function(ticket){
                        if (ticket.ScheduledStartDate && ticket.ScheduledEndDate) {
                            clean.push(new calendarEvent(ticket.Title, ticket.Status, ticket.ScheduledStartDate, ticket.ScheduledEndDate));
                        }
                    });
                    calendarManager.data = clean;
                    calendarManager.obj.setDataSource(calendarManager.data);    //zinger
                    clearInterval(data_w8);
                }
            }, 100);
        }
    ],

    stall_start: async function() {
        if (calendarManager.pages.includes(window.location.pathname)) {
            var cal_w8 = setInterval(function() {
                if ($(calendarManager.obj).length) {
                    clearInterval(cal_w8);
                    calendarManager.obj = $(calendarManager.obj).data("kendoScheduler");
                    calendarManager.setup.forEach(function(f){f()});
                }
            }, 100);

        }
    }
}

calendarManager.stall_start();
