function DateRangePickerComponent({id, onApply, hidden}) {

    var elem = () => $(`#${id}`);

    useEffect(()=>elem().data('daterange', new DateRangePicker(elem()[0])),[]);

    var applyFilter = () => {
        let start = $(`#${id} > input[name="start"]`).val();
        let end = $(`#${id} > input[name="end"]`).val();
        if (start && end) {
            start = moment(start).format('yy/MM/DD');
            end = moment(end).format('yy/MM/DD');
            let filter = `Created >= '${start}' and Created <= '${end}'`;
            onApply(filter);
        } else
            kendo.alert("Date range cannot have empty values.");
    }

    return (
        <div id={id} hidden={hidden}>
            <input type="text" name="start" className="date-range-input" autoComplete="off"></input>
            <span>&nbsp;to&nbsp;</span>
            <input type="text" name="end" className="date-range-input" autoComplete="off"></input>
            &nbsp;
            <a className="btn btn-primary" onClick={applyFilter}>Apply</a>
        </div>
    );
}