var scriptPatcherOn = function() {
    $.ajax({
        url: window.location.origin + "/CustomSpace/customSettings/scriptPatcher/versions.json?v="+Math.round(Math.random()*15),
        dataType: "json",
        success: function(res) {
            var settings = "scriptPatcher-data";
            var current = settings_controller.get_setting(settings);

            if ((!current.data) || res.data.version != current.data.version) {
                settings_controller.set_setting_value("update_required", true);
                location.reload();
            }

            settings_controller.set_setting(settings, res);
        }
    });
}

var scriptPatcherOff = function() {
}