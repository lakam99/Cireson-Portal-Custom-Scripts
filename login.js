//Written by Arkam Mazrui for the Cireson web portal
//arkam.mazrui@nserc-crsng.gc.ca
//arkam.mazrui@gmail.com

var form = null;

$("body").css("background-color", "white");
$(document).ready(function() {
    var wait = setInterval(function() {
        form = $("form");
        if (form) {
            form.before("<img src='/CustomSpace/logo_nserc.jpg'></img>");
        }
    }, 800);
});