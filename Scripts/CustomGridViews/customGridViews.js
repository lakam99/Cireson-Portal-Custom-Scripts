!(function() {
    const hide_all_columns = () => grid.columns.forEach(column => grid.hideColumn(column));
    const get_column_by_name = (name) => grid.columns.find(column => column.title === name);
    const apply_configuration = (config) => {
        //where config is a list of column names, in order. Any column not in here is hidden.
        hide_all_columns();
        config.forEach((column_name, i) => {
            const column = get_column_by_name(column_name);
            if (!column) throw "Failed to retrieve column " + column_name;
            grid.reorderColumn(i, column);
            grid.showColumn(column);
        });
    }
    
    window._gridViewSelectorTools = {apply_configuration};
})()