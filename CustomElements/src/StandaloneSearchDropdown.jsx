const {useState, useEffect} = React;

function Option(props) {
    return (
        <div style={{backgroundColor: props.backgroundColor}} className={'sad-option ' + (props.value ? 'sad-checked': '')} onClick={props.toggle}>
            {/* <input className='sad-val' title="select" type="checkbox" checked={props.value} onChange={(e)=>{}}/>&nbsp; */}
            <span>{props.text}</span>
        </div>
    )
}

function StandaloneSearchDropdown(props) {
    var [options, setOptions] = useState(props.options);
    const original = props.options;

    const getDropdown = () => {return document.getElementById('sad-options')}

    const getInputVal = () => {return document.getElementById('sad-select').value}

    const getContainer = () => {return document.getElementById('sad-select-container')};

    const hideDropdown = (e) => {
        getDropdown().style.display = 'none';
        document.getElementById('sad-select').value = '';
    }

    const getChartElem = () => {
        return $(`canvas`).data('chart');
    }

    const getAllLabels = () => {
        return getChartElem()._metasets.map((label, i)=>{
            let r = {text: '', value: false, index: undefined};
            r.text = label.label;
            r.value = label.visible;
            r.index = i;
            return r;
        })
    }

    const showDropdown = (e) => {
        const current = getAllLabels();
        if (current != options)
            setOptions(current);
        getDropdown().style.display = 'flex';
    }

    const filterResults = (e) => {
        let input = getInputVal();
        let current = getAllLabels();
        if (input.trim() == '')
            setOptions(current);
        else {
            let filtered = current.filter(o=>o.text.toLowerCase().includes(input.toLowerCase()));
            setOptions(filtered);
        }
    }

    useEffect(()=>{
        document.addEventListener('mousedown', (e)=>{
            const container = getContainer();
            if (!container.contains(e.target))
                hideDropdown();
        })
    },[])

    const sortFiltered = (o) => {
        const reg = (a,b) => {
            if (a == b) return 0;
            if (a > b) return 1;
            if (a < b) return -1;
        }
        let current = [...o];
        current = current.sort((a,b)=>a.text>=b.text);
        current = current.sort((a,b)=>{
            let c = b.value - a.value;
            if (c == 0)
                return reg(a.text, b.text);
            else return c;
        })
        return current;
    }

    const genToggleMethod = (option) => {
        const og = option;
        return () => {
            let o = [...options];
            let obj = o.filter(i=>i.text == og.text)[0];
            let current_index = o.indexOf(obj);
            o[current_index].value = !o[current_index].value;
            setOptions(sortFiltered(o));
            props.toggleVisibility(og.index);
        }
    } 

    return (
        <div id='sad-select-container' style={{width: props.container_width || '100%', height: props.container_height || '25%'}}>
            <span style={{display: 'flex', width: '100%', border: '1px solid #a3b7c1', borderRadius: '3px'}}>
                <input placeholder="Search" onKeyUp={filterResults} onFocus={showDropdown} title="d" type="text" id='sad-select' style={{border: '0'}}></input>
                <a className="dropdowntree-button k-button" style={{top: '4px'}} onClick={showDropdown}><span className="k-icon k-i-arrow-s"></span></a>
            </span>
            <div id='sad-options' style={{display:'none'}}>
                {options.map((option, i)=><Option key={i} backgroundColor={option.backgroundColor} text={option.text} value={option.value} toggle={genToggleMethod(option)}></Option>)}
                {options.length == 0 ? <span>Sorry, no results.</span> : ''}
            </div>
        </div>
    )
}