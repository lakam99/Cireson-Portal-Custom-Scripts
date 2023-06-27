function GridViewSelector() {
    let [views, setViews] = React.useState([]);
    let [currentView, setCurrentView] = React.useState({});

    $.getJSON(`https://ottansm1.nserc.ca:5000/get-user-grid-view-config?userId=${session.User.Id}`).then(col => setColumns(col));

    return (
        <span className="k-header k-grid-toolbar" id="grid-view-select-container">
            <label htmlFor="view-se">Selected View</label>
            <select></select>
        </span>
    )
}