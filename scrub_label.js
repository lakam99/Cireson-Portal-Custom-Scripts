//Written by Arkam Mazrui for the Cireson web portal
//arkam.mazrui@nserc-crsng.gc.ca
//arkam.mazrui@gmail.com

$(document).ready(function(){
    var hunter = setInterval(function() {
        var label = $(".label-danger");
         if (label.length) {
             label.remove();
             clearInterval(hunter);
         }
     }, 100);
});
