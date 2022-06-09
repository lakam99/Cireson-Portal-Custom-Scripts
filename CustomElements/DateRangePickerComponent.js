function DateRangePickerComponent(_ref) {
    var id = _ref.id,
        onApply = _ref.onApply;


    var elem = function elem() {
        return $('#' + id);
    };

    useEffect(function () {
        return elem().data('daterange', new DateRangePicker(elem()[0]));
    }, []);

    var applyFilter = function applyFilter() {
        var start = $('#' + id + ' > input[name="start"]').val();
        var end = $('#' + id + ' > input[name="end"]').val();
        if (start && end) {
            start = moment(start).format('yy/MM/DD');
            end = moment(end).format('yy/MM/DD');
            var filter = 'Created >= \'' + start + '\' and Created <= \'' + end + '\'';
            onApply(filter);
        } else kendo.alert("Date range cannot have empty values.");
    };

    return React.createElement(
        'div',
        { id: id },
        React.createElement('input', { type: 'text', name: 'start', className: 'date-range-input', autoComplete: 'off' }),
        React.createElement(
            'span',
            null,
            '\xA0to\xA0'
        ),
        React.createElement('input', { type: 'text', name: 'end', className: 'date-range-input', autoComplete: 'off' }),
        '\xA0',
        React.createElement(
            'a',
            { className: 'btn btn-primary', onClick: applyFilter },
            'Apply'
        )
    );
}