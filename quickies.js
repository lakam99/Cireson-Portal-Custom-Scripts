//Written by Arkam Mazrui for the Cireson web portal
//arkam.mazrui@nserc-crsng.gc.ca
//arkam.mazrui@gmail.com

var enabled = true;
var done = false;
imgs = [
    {
        id: "da117d71-69fe-a1ff-5461-459a8465d95d",
        img: "https://i.imgur.com/CH7ZOQ7.png"
    },
    {
        id: "a6254395-3fa1-1727-dd84-3ca5958dec95",
        img: "https://www.clker.com/cliparts/8/3/3/4/1195445190322000997molumen_red_round_error_warning_icon.svg.hi.png"
    }
]

var addCommentColor = setInterval(function(){
    var o = $("#commentBoxEditor")[0]|| $("body[contenteditable='true']");
    if ((o.length === undefined || o.length) && settings_controller.get_setting_value("darkMode")) {
        clearInterval(addCommentColor);
        o.style.backgroundColor = "rgba(1,1,1,0.1)";
        o.style.color = "white";
    }
}, 100);

var acknowledgeTaskCyaL8r = setInterval(function(){
    var a0 = $("[data-bind='click: acknowledge']");
    if (a0.length) {
        clearInterval(acknowledgeTaskCyaL8r);
        a0.remove();
    }
}, 100);

$(document).ready(function() {
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

    var dropdown_resizer = {
        dropdown_height: 550,
        dropdown_font_size: 13,
        resized: true,
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
                    if (!$(".drawer-drawermenu").find(n).length) {
                        dropdown_resizer.gogo_resize(d + n2.height);
                    }
                }
            });
        }, 100)
    };
    
});

function loc(test) {
    return window.location.pathname == test;
}

