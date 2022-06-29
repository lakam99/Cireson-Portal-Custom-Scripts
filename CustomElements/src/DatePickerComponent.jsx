function DatePickerComponent({onApply, hidden}) {
    const getElem  = () => $('input[name="datepicker"]');

    useEffect(()=>{
        let e = getElem();
        e.data('datepicker', new Datepicker(e[0], {maxDate: new Date()}));
    }, []);

    function applyFilter() {
        const date = moment(getElem().val()).format('yy/MM/DD');
        const filter = `Created <= '${date}'`;
        onApply(filter);
    }

    return (
        <div className="datepicker-container" hidden={hidden}>
            <input name="datepicker" readOnly={true}></input>&nbsp;
            <a className="btn btn-primary" onClick={applyFilter}>Apply</a>
        </div>
    )
}