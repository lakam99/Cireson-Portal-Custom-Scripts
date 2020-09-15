/* ----------------------------------------------- */
/* ----------------- Script Loader --------------- */
/* ----------------------------------------------- */

var loadScript = function (path, type) {

	var result = $.Deferred(),
		script = document.createElement("script");
	script.async = "async";
	script.type = type;
	script.src = path;
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

function loadScripts(script_arr, type) {
	var promises = [];
	script_arr.forEach(function(script){promises.push(loadScript(script, type))});
	/**Promise.all(promises).then(function(){
		$(document).ready(function(){
				var w8_babel = setInterval(function(){
					if (babel) {
						babel.transformScriptTags();
						clearInterval(w8_babel);
					}
				}, 1);
		})
	});**/
}

/* ----------------------------------------------- */
/* --------------- END Script Loader ------------- */
/* ----------------------------------------------- */

var scripts = [ "/CustomSpace/Scripts/customSettings/customSettings.js",
				"/CustomSpace/Scripts/apiCaller/APICaller.js",
				"/CustomSpace/Scripts/apiCaller/ClientRequestManager.js",
				"/CustomSpace/Scripts/mapController/map_controller.js",
				"/CustomSpace/Scripts/Quickies/quickies.js",
				"/CustomSpace/Scripts/homepageLocalization/homepageLocalizer.js",
				"/CustomSpace/Scripts/gridControl/gridControl.js",
				"/CustomSpace/Scripts/gridSaver/gridSaver.js",
				"/CustomSpace/Scripts/watchListControl/watchListControl.js",
				"/CustomSpace/Scripts/autoGroupAssigner/autoGroupAssigner.js",
				"/CustomSpace/Scripts/accentSuggest/accentSuggest.js",
				"/CustomSpace/Scripts/formCreateCI/formCreateCI.js",
				"/CustomSpace/Scripts/hiddenUserFinder/hiddenUserFinder.js",
				"/CustomSpace/Scripts/portalUserEmailManager/portalUserEmailManager.js",
				"/CustomSpace/Scripts/templateApplier/templateApplier.js"];
				
$("head").append('<meta http-equiv="X-UA-Compatible" content="IE=11, IE=10, IE=9, ie=8, ie=7">');
/**loadScripts(["/CustomSpace/Scripts/requirejs/requirejs.min.js",
				"/CustomSpace/Scripts/babel/loadBabel.js"], "text/javascript");**/
loadScript("https://cdnjs.cloudflare.com/ajax/libs/babel-polyfill/7.11.5/polyfill.min.js", "text/javascript").then(function(){
	loadScripts(scripts, "text/javascript");
});
