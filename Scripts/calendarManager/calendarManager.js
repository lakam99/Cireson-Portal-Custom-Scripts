//Written by Arkam Mazrui for the Cireson web portal
//arkam.mazrui@nserc-crsng.gc.ca
//arkam.mazrui@gmail.com

const dayMs = 8.64e7;

function getUid(element) {
    if (!element.dataset.uid) {
        return getUid(element.parentNode);
    } else {
        return element.dataset.uid;
    }
}

function click_wipe(element) {
    if (element.childElementCount) {
        element.onclick = null;
        [].slice.call(element.children).forEach(function(child){click_wipe(child)});
    } else {
        element.onclick = null;
    }
}

function calendarEvent(ticket) {
    this.title = `${ticket.Id}: ${ticket.Title}`, this.description = ticket.Id, this.start = new Date(ticket.ScheduledStartDate),
     this.end = new Date(ticket.ScheduledEndDate), this.parentId = ticket.ParentWorkItemId, this.id = ticket.ParentWorkItemId || ticket.Id;

    if (this.start.getTime() && !this.end.getTime()) {
        this.end = new Date(this.start.getTime() + dayMs);
    } else if (!this.start.getTime() && this.end.getTime()) {
        this.start = new Date(this.start.getTime() - Math.round(dayMs / 2));
    }

    this.onclick = function(e) {
        e.preventDefault();
        var obj = calendarManager.get_by_uid(getUid(e.target));
        var url = window.location.origin + "/";
        var ticket_type = obj.parentId ? obj.parentId : obj.description;
        if (ticket_type.includes("SRQ")) {
            url += "ServiceRequest";
        } else {
            url += "Incident";
        }
        url += "/Edit/" + ticket_type + `?activityId=${obj.description}&tab=activity`;
        window.location = url;
    }
}

var calendarManager = {
    obj: "[data-role='scheduler']",
    pages: ["/View/dc7957ab-6842-4453-aa7a-a5f2852043d7", "/View/1ae3ffa1-fc12-4f9b-966b-57671cb06ce8"],
    page: {"/View/dc7957ab-6842-4453-aa7a-a5f2852043d7": "myworkitems", "/View/1ae3ffa1-fc12-4f9b-966b-57671cb06ce8": "myteamsworkitems"},
    data: [],
    data_loaded: false,
    events_loaded: false,

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
                        if (ticket.ScheduledStartDate || ticket.ScheduledEndDate) {
                            clean.push(new calendarEvent(ticket));
                        }
                    });
                    calendarManager.data = clean;
                    calendarManager.obj.setDataSource(calendarManager.data);    //zinger
                    clearInterval(data_w8);
                    calendarManager.events_loaded = true;
                }
            }, 100);
        },

        function() {
            var events_w8 = setInterval(function(){
                if (calendarManager.events_loaded) {
                    calendarManager.bind_click();
                    calendarManager.obj.bind("navigate", function(){
                        setTimeout(function(){
                            calendarManager.bind_click()
                        },100)});
                    clearInterval(events_w8); 
                }
            }, 100);
        },
    ],

    bind_click: function() {
        click_wipe(calendarManager.obj.element[0]);
        var items = calendarManager.obj.items();
        for (var i = 0, cal_event = items[0]; i < items.length; i++, cal_event = items[i]) {
            cal_event.onclick = calendarManager.get_by_uid(cal_event.dataset.uid).onclick;  //attach listener
        }
    },

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
    },

    get_by_uid: function(str_uid) {
        var items = calendarManager.obj.dataSource.data();
        var uids = items.map(function(i){return i.uid});
        var objs = {};

        uids.forEach(function(uid, i){objs[uid] = items[i]});
        return objs[str_uid];
    }
}

calendarManager.stall_start();
