generateDashboardClickHandler('Tier', {
    "name": "Aging Tickets by Analyst",
    "subChart": true,
    "queryName": "Z Analyst Open WorkItems",
    "dashboard_id": "analyst-aging-tickets-dashboard",
    "chartType": "bar",
    "sortOn": "Name",
    "useDatePicker": true,
    "filterName": "Older Than",
    "display": false,
    "filters": [
        {
            "name": "Seven Days",
            "filter": "Created <= '{{moment().subtract(7,'d').format('yy/MM/DD')}}'"
        },
        {
            "name": "One Month",
            "filter": "Created <= '{{moment().format('yy/MM/01')}}'"
        },
        {
            "name": "One Year",
            "filter": "Created <= '{{moment().format('yy/01/01')}}'"
        },
        {
            "name": "Custom Age",
            "filter": ""
        }
    ]
});