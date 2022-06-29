function DatePickerComponent(_ref) {
    var onApply = _ref.onApply,
        hidden = _ref.hidden;

    var getElem = function getElem() {
        return $('input[name="datepicker"]');
    };

    useEffect(function () {
        var e = getElem();
        e.data('datepicker', new Datepicker(e[0], { maxDate: new Date() }));
    }, []);

    function applyFilter() {
        var date = moment(getElem().val()).format('yy/MM/DD');
        var filter = 'Created <= \'' + date + '\'';
        onApply(filter);
    }

    return React.createElement(
        'div',
        { className: 'datepicker-container', hidden: hidden },
        React.createElement('input', { name: 'datepicker', readOnly: true }),
        '\xA0',
        React.createElement(
            'a',
            { className: 'btn btn-primary', onClick: applyFilter },
            'Apply'
        )
    );
}