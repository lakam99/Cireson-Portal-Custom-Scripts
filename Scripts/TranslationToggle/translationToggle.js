const ENU = 'ENU';
const FRA = 'FRA';
const ENGLISH = "English";
const FRENCH = "Français";
const FRA_CODE = {Id: FRA, Name: "French"};
const ENU_CODE = {Id: ENU, Name: ENGLISH};

/**
 * 
 * @returns 
 */
async function toggle_lang() {
    let resolver = null;
    const promise = new Promise((resolve) => resolver = resolve);
    const setTo = isEng() ? FRA_CODE : ENU_CODE;
    const user_settings_old = await customAPI.getUserSettings();
    const user_settings_new = JSON.parse(JSON.stringify(user_settings_old));
    user_settings_old.isDirty = true;
    user_settings_old.view = [];
    user_settings_new.LanguageCode = setTo;
    delete user_settings_new.isDirty;
    
    const payload = encodeURIComponent(JSON.stringify({isDirty: true, current: user_settings_new, original: user_settings_old}));
    $.ajax({
        url: window.location.origin + "/Settings/User/SaveUserProfile/",
        type: 'post',
        dataType: 'text',
        data: `formJson=${payload}`,
        success: (r) => resolver(),
        error: (e) => console.error(e)
    });
    return promise;
}

function isEng() {
    return session.user.LanguageCode == ENU;
}

/**
 * 
 * @param {Function} criteria 
 * @param {boolean} resolveWithCallback 
 * @param {Number} waitMS 
 * @returns 
 */
function existence_waiter(criteria, resolveWithCallback=false, waitMS=1000) {
    if (typeof criteria != 'function') throw 'Param must be a function returning a value to check if not 0/undefined/null';
    return new Promise((resolve,reject)=>{
        if (criteria()) resolve(!resolveWithCallback ? true : criteria());
        else {
            var wait = setInterval(()=>{
                if (criteria()) {
                    clearInterval(wait);
                    resolve(!resolveWithCallback ? true : criteria());
                }
            }, waitMS);
        }
    })
}

(async () => {
    const USER_MENU_ELEM = 'ul.nav.navbar-nav.navbar-right';
    const USER_DROPDOWN = USER_MENU_ELEM + ' > li.user_menu';
    const ENGLISH_SELECT_ID = 'eng-select';
    const FRENCH_SELECT_ID = 'fra-select';
    const BUTTON_STYLE_CLASSNAME = 'nav-translate-btn';
    const DISABLED = 'disabled';
    const STYLE_REQUIREMENT = `<style>.${BUTTON_STYLE_CLASSNAME} {display: flex !important; flex-direction: row;}.${DISABLED}{pointer-events:none;cursor:not-allowed;}</style>`
    const TEMPLATE = `<li class='${BUTTON_STYLE_CLASSNAME}'><a class="${isEng() ? DISABLED:''}" id='${ENGLISH_SELECT_ID}'>${ENGLISH}</a>&nbsp;|&nbsp;<a class="${!isEng() ? DISABLED:''}" id='${FRENCH_SELECT_ID}'>${FRENCH}</a></li>`
    const POLL_INTERVAL = 230;

    $('body').append(STYLE_REQUIREMENT);
    await existence_waiter(() => $(USER_MENU_ELEM).length > 0, false, POLL_INTERVAL);
    $(USER_DROPDOWN).before(TEMPLATE);
    $(`#${ENGLISH_SELECT_ID},#${FRENCH_SELECT_ID}`).on('click', async (e) => {
        if (!e.target.classList.contains(DISABLED)) {
            ticketManipulator.show_loading();
            await toggle_lang();
            app.clearAllLocalStorage();
            window.location.reload();
        }
    });
})();