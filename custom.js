//Written by Arkam Mazrui for the Cireson web portal
//arkam.mazrui@nserc-crsng.gc.ca
//arkam.mazrui@gmail.com

function get_settings(q) {
	q = !q ? "settings":q;
	var s = localStorage.getItem(q);
	return s==null?false:JSON.parse(s);
}

var s = get_settings();
if (s && s.darkMode && s.darkMode.value) {
	var link = window.location.origin + "/CustomSpace/CustomSettings/darkMode/darkMode.css";
	$("head").before('<link type="text/css" rel="stylesheet"' +
	'id="dark-mode-general-link" href="'+link+'">');
}

$(document).ready(function(){
	$("body").append(`<style>span.k-in.k-state-selected {background-color: rgb(58, 25, 85) !important;}</style>`);
});

/* ----------------------------------------------- */
/* ----------------- Script Loader --------------- */
/* ----------------------------------------------- */

var loadScript = function (path) {

	var result = $.Deferred(),
		script = document.createElement("script");
	script.async = "async";
	script.type = "text/javascript";
	script.src = path;// + "?=" + Math.round(Math.random() * 15);
	script.onload = script.onreadystatechange = function(_, isAbort) {
		if (!script.readyState || /loaded|complete/.test(script.readyState)) {
			if (isAbort)
				result.reject();
			else
				result.resolve();
		}
	};
	script.onerror = function () { console.log(result); result.reject(); };
	$("head")[0].appendChild(script);
	console.log("Loaded " + path)
	return result.promise();
	
};

function loadScripts(script_arr, xtra) {
	xtra = !xtra? "" : xtra;
	script_arr.forEach(function(script){loadScript(script+xtra)});
}

/* ----------------------------------------------- */
/* --------------- END Script Loader ------------- */
/* ----------------------------------------------- */

var scripts = [ "/CustomSpace/Scripts/templateApplier/templateApplier.js",
				"/CustomSpace/Scripts/activityAdder/activityAdder.js",
				"/CustomSpace/Scripts/ticketConverter/ticketConverter.js",
				"/CustomSpace/Scripts/ticketManipulator/ticketManipulator.js",
				"/CustomSpace/Scripts/customSettings/customSettings.js",
				"/CustomSpace/Scripts/mapController/map_controller.js",
				"/CustomSpace/Scripts/accentSuggest/accentSuggest.js",
				"/CustomSpace/Scripts/Quickies/quickies.js",
				"/CustomSpace/Scripts/homepageLocalization/homepageLocalizer.js",
				"/CustomSpace/Scripts/gridControl/gridControl.js",
				"/CustomSpace/Scripts/gridSaver/gridSaver.js",
				"/CustomSpace/Scripts/watchListControl/watchListControl.js",
				"/CustomSpace/Scripts/autoGroupAssigner/autoGroupAssigner.js",
				"/CustomSpace/Scripts/formCreateCI/formCreateCI.js",
				"/CustomSpace/Scripts/hiddenUserFinder/hiddenUserFinder.js",
				"/CustomSpace/Scripts/portalUserEmailManager/portalUserEmailManager.js"];

dependency_arr = [ 	"/CustomSpace/Scripts/ClientRequestManager/ClientRequestManager.js",
					"/CustomSpace/Scripts/settings_controller/settings_controller.js",
					"/CustomSpace/Scripts/accentSuggest/accentSuggest.js"];
				
$("head").append('<meta http-equiv="X-UA-Compatible" content="IE=11, IE=10, IE=9, ie=8, ie=7">');

var u = (s = get_settings().update_required) && s.value ? Math.round(Math.random()*15) : "";

loadScript(dependency_arr[0] + u).then(function(){
	loadScript(dependency_arr[1] + u).then(function() {
		loadScript(dependency_arr[2] + u).then(function(){
			loadScripts(scripts, u);
		});
	}) 
});