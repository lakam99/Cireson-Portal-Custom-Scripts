var darkModeOn = function() {
    var link = window.location.origin + "/CustomSpace/CustomSettings/darkMode/darkMode.css";
    $("head").before(`<link type="text/css" rel="stylesheet" 
    id="dark-mode-general-link" href="${link}">`);
}

var darkModeOff = function() {
    $("#dark-mode-general-link").remove();
}