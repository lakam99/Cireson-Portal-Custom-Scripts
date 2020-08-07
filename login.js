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