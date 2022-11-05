import { system } from "../package.json";
function getConfig(name, defaultValue=null) {
    // If inside a docker container, use window.ENV
    if( window.ENV !== undefined ) {
        return window.ENV[name] || defaultValue;
    }
    console.log(process.env);
    return process.env[name] || defaultValue;
}

export function getBackendUrl() {
    return getConfig('REACT_APP_BACKEND_URL');
}

export function getHoursCloseTicketsAuto() {
    return getConfig('REACT_APP_HOURS_CLOSE_TICKETS_AUTO');
}

export function getClientLogo(defaultValue=null){
    return getConfig('REACT_APP_CLIENT_LOGO',defaultValue);
}
export function getClientLogoDash(defaultValue=null){
    return getConfig('REACT_APP_CLIENT_LOGO_DASH',defaultValue);
}
export function getProductMainLogo(defaultValue=null){
    return getConfig('REACT_APP_LOGO_PRODUCT',defaultValue);
}
export function getColorThemeDefault(defaultValue=null){
    return getConfig('REACT_APP_CLIENT_THEME',defaultValue);
}
export function getThemePrimaryColor(defaultValue=null){
    return getConfig('REACT_APP_THEME_PRIMARY_COLOR',defaultValue || '#6B62FE');
}
export function getThemeSecondaryColor(defaultValue=null){
    return getConfig('REACT_APP_THEME_SECONDARY_COLOR',defaultValue || '#F50057');
}

export function getSysName() {
    return getConfig('SYS_NAME',system.name);
}