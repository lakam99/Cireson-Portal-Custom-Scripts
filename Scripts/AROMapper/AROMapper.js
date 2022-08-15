!(function(){
    const instructions = settings_controller.get_setting('transfer-to-aro');
    if (instructions && Array.isArray(instructions) && instructions.length > 0)
    var x = setInterval(()=>{
        if ($('.page-panel').length) {
            clearInterval(x);
            instructions.forEach((instruction)=>{
                $(`.question-container:nth(${instruction.inputIndex}) > div > div > textarea`).val(instruction.data);
                $(`.question-container:nth(${instruction.inputIndex}) > div > div > input`).removeClass('ng-empty')
                .removeClass('ng-pristine').removeClass('ng-invalid').removeClass('ng-untouched');
                $(`.question-container:nth(${instruction.inputIndex}) > div > div > input`).val(instruction.data);
            })
            settings_controller.set_setting('transfer-to-aro', undefined);
        }
    }, 100)
})()