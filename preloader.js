//Written by Arkam Mazrui for the Cireson web portal
//arkam.mazrui@nserc-crsng.gc.ca
//arkam.mazrui@gmail.com

function get_settings() {
    var s = localStorage.getItem("settings");
    return s==null?false:JSON.parse(s);
}

var s = get_settings();
if (s && s.darkMode && s.darkMode.value) {
    var link = window.location.origin + "/CustomSpace/CustomSettings/darkMode/darkMode.css";
    $("head").before('<link type="text/css" rel="stylesheet"' +
    'id="dark-mode-general-link" href="'+link+'">');
}