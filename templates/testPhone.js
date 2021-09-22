var testPhone = function(phone_num){
    var correct = new RegExp(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im);
    return correct.test(phone_num);
}