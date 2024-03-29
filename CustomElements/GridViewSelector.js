var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function GridViewSelector() {
    var _React$useState = React.useState([]),
        _React$useState2 = _slicedToArray(_React$useState, 2),
        views = _React$useState2[0],
        setViews = _React$useState2[1];

    var _React$useState3 = React.useState({}),
        _React$useState4 = _slicedToArray(_React$useState3, 2),
        currentView = _React$useState4[0],
        setCurrentView = _React$useState4[1];

    $.getJSON("https://ottansm1.nserc.ca:5000/get-user-grid-view-config?userId=" + session.User.Id).then(function (col) {
        return setColumns(col);
    });

    return React.createElement(
        "select",
        { onChange: setCurrentView },
        views.map(function (view) {
            return React.createElement(
                "option",
                { value: view.name },
                " ",
                view.name,
                " "
            );
        })
    );
}