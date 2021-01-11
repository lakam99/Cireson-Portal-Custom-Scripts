var darkModeOn = function() {
    var version = (s = get_settings.update_darkmode) && s.value ? "?v=" + Math.round(Math.random()*15):'';
    set_settings("update_darkmode", {value: false});
    var link = window.location.origin + "/CustomSpace/CustomSettings/darkMode/darkMode.css"+version;
    $("head").before('<link type="text/css" rel="stylesheet"' +
    'id="dark-mode-general-link" href="'+link+'">');
}

var darkModeOff = function() {
    $("#dark-mode-general-link").remove();
}