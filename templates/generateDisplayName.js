formCreateCI.helperFunctions.get_user = function(name) {
    var req = {userFilter: name, filterByAnalyst: false,
    groupsOnly: false, maxNumberOfResults: 1, fetchAll: false};
    waiter.request("get", "/api/V3/User/GetUserList", req, false);
    return JSON.parse(waiter.get_return())[0];
}

var generateDisplayName = function(FirstName, LastName) {
    var displayName = LastName + "," + FirstName;
    var existing = formCreateCI.helperFunctions.get_user(displayName);
    if (existing) {
        if (existing.Name == displayName) {
            return generateDisplayName(FirstName + "0", LastName);
        } else {
            return displayName;
        }
    } else {
        return displayName;
    }
}