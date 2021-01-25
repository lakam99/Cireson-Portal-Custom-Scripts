var darkModeOn = function() {
    var link = customGlobalLoader.get_url("darkModeStylesheet");
    $("head").before('<link type="text/css" rel="stylesheet"' +
    'id="dark-mode-general-link" href="'+link+'">');
}

var darkModeOff = function() {
    $("#dark-mode-general-link").remove();
}