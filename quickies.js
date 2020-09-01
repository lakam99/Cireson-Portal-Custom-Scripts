//Written by Arkam Mazrui for the Cireson web portal
//arkam.mazrui@nserc-crsng.gc.ca
//arkam.mazrui@gmail.com

var enabled = true;
var done = false;

$(document).ready(function() {
    if (loc("/View/02efdc70-55c7-4ba8-9804-ca01631c1a54") && enabled) {
        //disabled
        var key_replace = setInterval(function() {
            var key = $("#da117d71-69fe-a1ff-5461-459a8465d95d");
            if (key.length) {
                key.find("img").attr("src", "https://i.imgur.com/CH7ZOQ7.png");
                clearInterval(key_replace);
            }
        }, 800);
    }

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

