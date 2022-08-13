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

export function getColorThemeDefault() {
    return getConfig('COLOR_THEME','primary');
}

export function getSysName() {
    return getConfig('SYS_NAME',system.name);
}