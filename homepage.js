var template = null;
var done = false;
var homepage = "/CustomSpace/homepage/test.html";
console.log("homepage.js loaded");

ie_fetch(homepage, function(response) {
    template = response
});

var homepage_id = "bf9ff210-11bf-4845-82c3-f61b782c2671";

$(document).ready(function() {
    console.log("Ready!");
    var wait = setInterval(function() {
        if (app.getNavNodeIdFromUrl() == homepage_id && !done) {
            var placeholder = $("[adf-id='object:9']").find("div.ng-binding").find("div");
            if (placeholder[0]) {
                placeholder.append(template);
                console.log("My work here is done.");
                done = true;
                clearInterval(wait);
                $(document).off("ready");
            }
        }
    }, 800);
});

function ie_fetch(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open("get", url, false);
    
    xhr.onreadystatechange = function() {
        if (xhr.readyState == XMLHttpRequest.DONE) {
            request_done = true;
            callback(xhr.responseText);
        }
    }
	
    xhr.send();
}
