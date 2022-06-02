//Written by Arkam Mazrui for the Cireson web portal
//arkam.mazrui@nserc-crsng.gc.ca
//arkam.mazrui@gmail.com

var enabled = true;
var done = false;

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

function existence_waiter(criteria, resolveWithCallback=false, timeout, waitMS=1000) {
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
