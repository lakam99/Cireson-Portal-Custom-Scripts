//Written by Arkam Mazrui for the Cireson web portal
//arkam.mazrui@nserc-crsng.gc.ca
//arkam.mazrui@gmail.com

var globalSearch = {
    search: function(str_id) {
        return new Promise(function(resolve, reject){
            $.ajax({
                url: window.location.origin + "/search/GetAdHocResults",
                type: "post",
                async: "true",
                dataType: "json",
                data: {
                    sort: null,
                    page: 1,
                    pageSize: 100,
                    group: null,
                    filter: null,
                    filterCriteria: JSON.stringify([{"sectionTypeName":"ALL","displayName":"All Work Items","classId":"",
                    "criteriaRoot":{"groupOperator":"And","items":[{"field":{"name":"WorkItem.WorkItemId","displayKey":"ID",
                    "fieldType":"string","templateValue":"","displayName":"ID"},"operator":"eq","value":{"numericValue":str_id.replace(/\D/g,''),"stringValue":str_id},
                    "type":"criteria","groupId":"4719bdd9-3e76-4923-9cf9-7fabf8203d4e","sectionId":"fff74824-5be6-c19f-dd00-97578e468673",
                    "sectionTypeName":"ALL","showCriteriaControl":true,"guid":284}],"type":"criteriaGroup",
                    "sectionId":"fff74824-5be6-c19f-dd00-97578e468673","sectionTypeName":"ALL"},"sectionId":"fff74824-5be6-c19f-dd00-97578e468673"}]),
                    dataTable: 'WorkItem'
                },
                success: function(r) {
                    resolve(r);
                },
                error: function(e) {
                    reject(e);
                }
            })
        });
    }
}