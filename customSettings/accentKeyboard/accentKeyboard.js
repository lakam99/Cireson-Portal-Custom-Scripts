customSettings.helperFunctions.accentKeyboard = {};

customSettings.helperFunctions.accentKeyboard.keys = [].concat.apply([], [
    accentSuggest.constants.suggest_letters.a, accentSuggest.constants.suggest_letters.c,
    accentSuggest.constants.suggest_letters.e, accentSuggest.constants.suggest_letters.i,
    accentSuggest.constants.suggest_letters.o, accentSuggest.constants.suggest_letters.u,
    accentSuggest.constants.suggest_letters.y]);

customSettings.helperFunctions.accentKeyboard.build_UI = function(e) {
    if (("#keyboard").length) {
        $("#keyboard").remove();
        $("body").off("click");
    }
    $(e).parent().before(`<div id='keyboard' class='container'></div>`);
    var keys = customSettings.helperFunctions.accentKeyboard.keys;
    keys.forEach(function(letter){
        $("#keyboard").append("<a class='k-btn btn btn-xs letter'>"+
        String.fromCharCode(letter)+"</a>")
    });
    $(".letter").toArray().forEach(function(btn){
        $(btn).on("click", function(){
            var $input = $(btn).parent().parent().find('input');
            var val = $input.val();
            $input.val(val + $(btn).text());
            $input.focus();
            setTimeout(function(){
                $input.data("kendoAutoComplete").popup.open();
                //$input.click();
                //$input.selectionStart = $input.selectionEnd = $input.val().length + 1;
            },300);
        });
    });
}

var accentKeyboardOn = function() {
    var zxi = setInterval(function(){
        var pickers = accentSuggest.getters.get_page_userpickers();
        if (pickers.length) {
            clearInterval(zxi);
            pickers.forEach(function(e){
                $(e).on("click", function(){
                    customSettings.helperFunctions.accentKeyboard.build_UI(e);
                    var parent = $("#keyboard").parent().parent()[0];
                    $(body).on("click", function(ev){
                        if (!parent.contains(ev.target)) {
                            $("#keyboard").remove();
                            $(body).off("click");
                        }
                    });
                });
            });
        }
    }, 100);
}

var accentKeyboardOff = function() {
}

