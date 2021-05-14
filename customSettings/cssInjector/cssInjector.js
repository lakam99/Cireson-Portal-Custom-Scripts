customSettings.helperFunctions.cssInjector = {};

customSettings.helperFunctions.cssInjector.inject_css = function(raw_style) {
    if ($("style#css-inject").length) {
        $("style#css-inject").append(raw_style);
    } else {
        $("head").append("<style id='css-inject'></style>");
        customSettings.helperFunctions.cssInjector.inject_css(raw_style);
    }
}

customSettings.helperFunctions.cssInjector.ready = function(response) {
    customSettings.helperFunctions.cssInjector.queue = response;
    response.inject.forEach(function(css_inject) {
        if (!css_inject.condition || (css_inject.condition && eval(css_inject.condition))) {
            if (!css_inject.raw) {
                $.ajax({
                    url: customGlobalLoader.get_str_url(css_inject.content),
                    dataType: "text",
                    async: true,
                    success: function(r) {
                        customSettings.helperFunctions.cssInjector.inject_css(r);
                    }
                });
            } else {
                customSettings.helperFunctions.cssInjector.inject_css(css_inject.content);
            }
        }
    });
}

var cssInjectorOn = function() {
    var link = customGlobalLoader.get_str_url("/CustomSpace/custom.css");
    $("head").before('<link type="text/css" rel="stylesheet" href="'+link+'">');

    $.ajax({
        url: customGlobalLoader.get_url("CSSInjector-Config"),
        dataType: "json",
        async: true,
        success: function(r) {
            customSettings.helperFunctions.cssInjector.ready(r);
        }
    });
}

var cssInjectorOff = function() {

}