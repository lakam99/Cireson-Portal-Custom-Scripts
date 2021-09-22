var testZIP = function(zip) {
    var correct = new RegExp(/^(\d{5}(-\d{4})?|[a-zA-Z]\d[a-zA-Z] ?\d[a-zA-Z]\d)$/);
    return correct.test(zip);
}