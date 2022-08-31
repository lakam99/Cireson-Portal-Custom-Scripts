//Written by Arkam Mazrui for the Cireson web portal
//arkam.mazrui@nserc-crsng.gc.ca
//arkam.mazrui@gmail.com

var enabled = true;
var done = false;
var rgbToHex = (r, g, b) => "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
var rand = (max) => Math.round(Math.random() * max + 1);
var randColor = () => rgbToHex(rand(255), rand(255), rand(255));

var create_UUID = function(){
    var dt = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (dt + Math.random()*16)%16 | 0;
        dt = Math.floor(dt/16);
        return (c=='x' ? r :(r&0x3|0x8)).toString(16);
    });
    return uuid;
}

var fixCommentBox = setInterval(function(){
    var name = "iframe[title='Editable area. Press F10 for toolbar.']";
    if (window.location.pathname.includes("/Edit/") && settings_controller.get_setting_value("darkMode")) {
        if ($(name).length) {
            $(name)[0].contentDocument.body.style = "background-color: #333333 !important; color: #dcdcdc !important;";
            clearInterval(fixCommentBox);
        }
    } else {
        clearInterval(fixCommentBox);
    }
}, 100);

$(document).ready(function() {
    if (settings_controller.get_setting_value("darkMode")) {
        $("head").append(`
                <style>
                    .k-ext-treeview.k-treeview span.k-in.k-state-selected {
                        background-color: rgba(105, 58, 143, 0.452) !important;
                    }
                
                    .k-ext-treeview.k-treeview span.k-in.k-state-hover {
                        background-color: rgb(58, 25, 85) !important;
                    }
                </style>
        `);
    }
    if (loc("/View/02efdc70-55c7-4ba8-9804-ca01631c1a54") && enabled) {
        //disabled
        var key_replace = setInterval(function() {
            imgs.forEach(function(img){
                var key = $("#"+img.id);
                if (key.length) {
                    key.find("img").attr("src", img.img);
                    clearInterval(key_replace);
                }
            });
        }, 800);
    }
    var dropdown_resizer = {
        dropdown_height: 550,
        dropdown_font_size: 13,
        resized: true,
        resized_window:false,
        og_height: undefined,
        set_dropdown_height: function(arg) {dropdown_resizer.dropdown_height = arg; dropdown_resizer.resized = true;},
        resize: function() {
            if (dropdown_resizer.resized) {
                $("div.k-treeview").css("max-height", dropdown_resizer.dropdown_height + "px").css("font-size", dropdown_resizer.dropdown_font_size + "px").css("z-index", "6")
                dropdown_resizer.resized = false;
            }
        },
        gogo_resize: function(arg) {
            dropdown_resizer.set_dropdown_height(arg);
            dropdown_resizer.resize();
        },

        dif: setInterval(function() {
            var footer = $(".drawer")[0].getBoundingClientRect();
            var downs = [];
            $("div.k-treeview").toArray().forEach(function(n,i){
                if ($(n).hasClass("k-custom-visible")) {
                    var n2 = n.getBoundingClientRect();
                    var d = footer.top - n2.bottom;
                    var nh = d + n2.height;
                    if (!dropdown_resizer.resized_window) {
                        dropdown_resizer.og_height = $('body').height();
                    }
                    if (nh <= 100) {$('body').css('min-height', dropdown_resizer.og_height+500);dropdown_resizer.resized_window = true}
                    n2 = n.getBoundingClientRect();
                    d = footer.top - n2.bottom;
                    if (!$(".drawer-drawermenu").find(n).length) {
                        dropdown_resizer.gogo_resize(d + n2.height);
                    }
                } else if (!$('div.k-treeview').toArray().some((n)=>{return $(n).hasClass("k-custom-visible")})) {
                    if (dropdown_resizer.resized_window) {
                        $('body').css('min-height', dropdown_resizer.og_height);
                    }
                }
            });
    }, 100)
    };
    
});

var screw_the_save_btn = setInterval(function(){
    var btn = "button.btn:has(div):contains('Save')";
    if (window.location.href.includes('/New/')) {
        if ($(btn).length) {
            clearInterval(screw_the_save_btn);
            $(btn).on("click", function(e){
                e.preventDefault();
                $("button.btn:has(div):contains('Apply')").click();
                ClientRequestManager.send_request(
                "get", window.location.origin + "/api/V3/Settings/GetSetting",{settingKey:'EndUserHomePage'},false, true)
                .then(function(r){
                    r = JSON.parse(r).Value;
                    window.location.href = window.location.origin + '/View/' + r;
                });
            });
        }
    } else {
        clearInterval(screw_the_save_btn);
    }
}, 500);

var default_private_comments = setInterval(function(){
    if (!window.location.href.includes('/Edit')) {
        clearInterval(default_private_comments);
        return;
    }

    var priv_check = "input#actionLogisPrivate:nth(0)";
    var reg_comment_btn = "button.action-log-add-button";
    var mobile_comment_btn = "button[data-bind='click: addComment']";
    var comment_btn = "";
    var mobile_mode = function() {return $("div.action-log-mobile-buttons").parent().parent().css('display') == 'block'};

    if ($(priv_check).length) {
        $(priv_check).click();
        comment_btn = mobile_mode() ? mobile_comment_btn:reg_comment_btn;
        $(comment_btn).on("click", function(e){
            $(priv_check).click();
        });
        clearInterval(default_private_comments);
    }
}, 1000);

var ARO_changer_cuz_we_cant_be_bothered_to_make_a_new_way_to_make_AROs = setInterval(function(){
    if (window.location.pathname.includes('RequestOffering')) {
        if ($('div[data-control="checkboxGridByCriteriaOld"]').length) {
            $('div[data-control="checkboxGridByCriteriaOld"]').toArray().forEach(function(i){$(i).data('kendoGrid').dataSource.data([])});
            $('textarea').toArray().forEach(function(i){$(i).on('input', function(e){$(e.currentTarget).css('height','').css('height',e.currentTarget.scrollHeight+'px')});});
            clearInterval(ARO_changer_cuz_we_cant_be_bothered_to_make_a_new_way_to_make_AROs);
        }
    } else {
        clearInterval(ARO_changer_cuz_we_cant_be_bothered_to_make_a_new_way_to_make_AROs);
    }
}, 800);

function loc(test) {
    return window.location.pathname == test;
}

function test_loc(test) {
    return window.location.href.includes(test);
}

function existence_waiter(criteria, resolveWithCallback=false, waitMS=1000) {
    if (typeof criteria != 'function') throw 'Param must be a function returning a value to check if not 0/undefined/null';
    return new Promise((resolve,reject)=>{
        if (criteria()) resolve(!resolveWithCallback ? true : criteria());
        else {
            var wait = setInterval(()=>{
                if (criteria()) {
                    clearInterval(wait);
                    resolve(!resolveWithCallback ? true : criteria());
                }
            }, waitMS);
        }
    })
}

async function getVerificationToken() {
    var get_token = () => $($('input[name="__RequestVerificationToken"]')[1]).val();     //hehe nice try cireson >:)
    return (await existence_waiter(get_token, true));
}

async function sendNewEmail([To, ...Cc], Subject, Body) {
    var p;
    var token = await getVerificationToken();
    $.ajax({
        url: 'http://ottansm2/EmailNotification/SendEmailNotification',
        type: 'post',
        dataType: 'json',
        data: {To, Cc, Subject, Body},
        success: (r) => {p.resolve(r)},
        error: (e) => {p.reject(e)}
    });
    return new Promise((resolve,reject)=>{p = {resolve,reject}});
}

function assignToMe() {
    pageForm.viewModel.AssignedWorkItem.set("DisplayName", session.user.Name);
    pageForm.viewModel.AssignedWorkItem.set("BaseId", session.user.Id);
    accentSuggest.getters.get_page_userpicker_objs()[1].dataSource._data.splice(0, 1);
}

(function(){
    if (!(test_loc('ServiceRequest') || test_loc('Incident'))) return;
    const condition = () => {return $('#ChangeStatusWindow.cireson-window:visible').length > 0}
    let onChangeStatus;
    const hookToStatusChange = async () => {
        await existence_waiter(condition);
        onChangeStatus();
    }
    onChangeStatus = () => {
        const okBtn = () => $('#ChangeStatusWindow.cireson-window:visible').find('button.btn-primary');
        okBtn().on('click', ()=>{
            const newStatus = pageForm.viewModel.Status.Name;
            if (newStatus == 'Completed' || newStatus == 'Resolved' || newStatus == 'Cancelled') assignToMe();
        })
    }

    hookToStatusChange();
})();

(function(){
    const forbiddenOne = 'Please make a selection';
    if (session.user.Analyst && formTasks.user_has_permission(formTasks.permissions.sc) && test_loc('ServiceRequest') && pageForm.viewModel.Area.Name == forbiddenOne) {
        const getObj = () => {return $('div.form-group:has(label[for="Area"]) > div > div[data-role="treeview"]')};
        const disableExit = () => {
        $('#drawer-taskbar > button:visible:not(:nth(2))').attr('disabled', true);
        $('label[for="Area"]').append(`<span id="area-warn" style="color:red;font-size:small">${forbiddenOne}</span>`)
        }
        const enableExit = () => {
            $('#drawer-taskbar > button:visible:not(:nth(2))').attr('disabled', false);
            $('#area-warn').remove();
        }
        existence_waiter(getObj).then(()=>{
            disableExit();
            getObj().data('kendoTreeView').bind('change', (e)=>{
                const selectedArea = $('div.form-group:has(label[for="Area"]) > div > span > span > input.k-input.k-ext-dropdown').val();
                if (selectedArea == forbiddenOne) disableExit();
                else enableExit();
            });
        });
    }
})();

const create_filter = (field, operator, ...values) => {
    return [...values].map((value)=>{
        return {field, operator, value};
    })
}

!(function() {
    if (!test_loc('/Page/0bc19d4f-ed58-4937-8997-1964409723cb')) return;
    const filters = [{field:'AssignedUser', operator: 'equals', value: session.user.Name},
                    {logic: 'or', filters:session.user.user_groups.map((group)=>({field:'SupportGroup', operator: 'equals', value: group.Name}))}];
    
    const setFilters = () => {grid.dataSource.filter(filters);grid.dataSource._filter.logic = 'and';} 

    existence_waiter(()=>{try {return grid} catch {}}).then(()=>{
        setFilters();
        grid.bind('filter', setFilters);
    })
})()