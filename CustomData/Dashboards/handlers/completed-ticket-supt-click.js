generateDashboardClickHandler('SupportGroup', {
    "name": "Completed Tickets by Analyst",
    "subChart": true,
    "queryName": "Z All Completed WorkItems",
    "dashboard_id": "analyst-completed-tickets-dashboard",
    "chartType": "bar",
    "sortOn": "Name",
    "filterName": "Within",
    "display": false,
    "filters": [
        {
            "name": "Last Seven Days",
            "filter": "Completed >= '{{moment().subtract(7,'d').format('yy/MM/DD')}}' and Completed <= '{{moment().add(1,'d').format('yy/MM/DD')}}'"
        },
        {
            "name": "This Month",
            "filter": "Completed >= '{{moment().format('yy/MM/01')}}' and Completed <= '{{moment().add(1,'d').format('yy/MM/DD')}}'"
        },
        {
            "name": "This Quarter",
            "filter": "Completed >= '{{moment().startOf('quarter').format('yy/MM/DD')}}' and Completed <= '{{moment().endOf('quarter').format('yy/MM/DD')}}'"
        },
        {
            "name": "Last Quarter",
            "filter": "Completed >= '{{moment().subtract(1, 'quarter').startOf('quarter').format('yy/MM/DD')}}' and Completed <= '{{moment().subtract(1, 'quarter').endOf('quarter').format('yy/MM/DD')}}'"
        },
        {
            "name": "This Year",
            "filter": "Completed >= '{{moment().format('yy/01/01')}}' and Completed <= '{{moment().add(1,'d').format('yy/MM/DD')}}'"
        },
        {
            "name": "Last Year",
            "filter": "Completed >= '{{moment().subtract(1,'y').format('yy/01/01')}}' and Completed <= '{{moment().subtract(1,'y').format('yy/12/31')}}'"
        },
        {
            "name": "Custom Range",
            "filter": "",
            "filterOn": "Completed"
        }
    ]
});