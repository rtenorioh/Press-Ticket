const configCache = {};

function getConfig(name, defaultValue = null, warn = true) {
    if (configCache[name] !== undefined) {
        return configCache[name];
    }

    const value = window.ENV?.[name] || import.meta.env[name] || defaultValue;

    if (value === null || value === undefined) {
        console.warn(`Configuração "${name}" não encontrada. Usando valor padrão: ${defaultValue}`);
    }

    configCache[name] = value;
    return value;
}

export function getBackendUrl() {
    return getConfig("VITE_BACKEND_URL", "http://localhost:4000");
}

export function getHoursCloseTicketsAuto() {
    return getConfig("VITE_HOURS_CLOSE_TICKETS_AUTO", "", false);
}
