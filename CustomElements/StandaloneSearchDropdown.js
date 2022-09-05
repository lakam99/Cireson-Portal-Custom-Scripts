var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var _React = React,
    useState = _React.useState,
    useEffect = _React.useEffect;


function Option(props) {
    return React.createElement(
        'div',
        { className: 'sad-option ' + (props.value ? 'sad-checked' : ''), onClick: props.toggle },
        React.createElement(
            'span',
            null,
            props.text
        )
    );
}

function StandaloneSearchDropdown(props) {
    var _useState = useState(props.options),
        _useState2 = _slicedToArray(_useState, 2),
        options = _useState2[0],
        setOptions = _useState2[1];

    var original = props.options;

    var getDropdown = function getDropdown() {
        return document.getElementById('sad-options');
    };

    var getInputVal = function getInputVal() {
        return document.getElementById('sad-select').value;
    };

    var getContainer = function getContainer() {
        return document.getElementById('sad-select-container');
    };

    var hideDropdown = function hideDropdown(e) {
        getDropdown().style.display = 'none';
        document.getElementById('sad-select').value = '';
    };

    var getChartElem = function getChartElem() {
        return $('canvas').data('chart');
    };

    var getAllLabels = function getAllLabels() {
        return getChartElem()._metasets.map(function (label, i) {
            var r = { text: '', value: false, index: undefined };
            r.text = label.label;
            r.value = label.visible;
            r.index = i;
            return r;
        });
    };

    var showDropdown = function showDropdown(e) {
        var current = getAllLabels();
        if (current != options) setOptions(current);
        getDropdown().style.display = 'flex';
    };

    var filterResults = function filterResults(e) {
        var input = getInputVal();
        var current = getAllLabels();
        if (input.trim() == '') setOptions(current);else {
            var filtered = current.filter(function (o) {
                return o.text.toLowerCase().includes(input.toLowerCase());
            });
            setOptions(filtered);
        }
    };

    useEffect(function () {
        document.addEventListener('mousedown', function (e) {
            var container = getContainer();
            if (!container.contains(e.target)) hideDropdown();
        });
    }, []);

    var sortFiltered = function sortFiltered(o) {
        var reg = function reg(a, b) {
            if (a == b) return 0;
            if (a > b) return 1;
            if (a < b) return -1;
        };
        var current = [].concat(_toConsumableArray(o));
        current = current.sort(function (a, b) {
            return a.text >= b.text;
        });
        current = current.sort(function (a, b) {
            var c = b.value - a.value;
            if (c == 0) return reg(a.text, b.text);else return c;
        });
        return current;
    };

    var genToggleMethod = function genToggleMethod(option) {
        var og = option;
        return function () {
            var o = [].concat(_toConsumableArray(options));
            var obj = o.filter(function (i) {
                return i.text == og.text;
            })[0];
            var current_index = o.indexOf(obj);
            o[current_index].value = !o[current_index].value;
            setOptions(sortFiltered(o));
            props.toggleVisibility(og.index);
        };
    };

    return React.createElement(
        'div',
        { id: 'sad-select-container', style: { width: props.container_width || '100%', height: props.container_height || '25%' } },
        React.createElement(
            'span',
            { style: { display: 'flex', width: '100%', border: '1px solid #a3b7c1', borderRadius: '3px' } },
            React.createElement('input', { placeholder: 'Search', onKeyUp: filterResults, onFocus: showDropdown, title: 'd', type: 'text', id: 'sad-select', style: { border: '0' } }),
            React.createElement(
                'a',
                { 'class': 'dropdowntree-button k-button', style: { top: '4px' }, onClick: showDropdown },
                React.createElement('span', { 'class': 'k-icon k-i-arrow-s' })
            )
        ),
        React.createElement(
            'div',
            { id: 'sad-options', style: { display: 'none' } },
            options.map(function (option, i) {
                return React.createElement(Option, { key: i, text: option.text, value: option.value, toggle: genToggleMethod(option) });
            }),
            options.length == 0 ? React.createElement(
                'span',
                null,
                'Sorry, no results.'
            ) : ''
        )
    );
}