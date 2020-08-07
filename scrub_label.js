$(document).ready(function(){
    var hunter = setInterval(function() {
        var label = $(".label-danger");
         if (label.length) {
             label.remove();
         }
     }, 100);
});
