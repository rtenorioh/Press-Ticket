const configCache = {};

// Busca uma variável de configuração pelo nome.
function getConfig(name, defaultValue = null, warn = true) {
    if (configCache[name] !== undefined) {
        return configCache[name];
    }

    const value = window.ENV?.[name] || process.env[name] || defaultValue;

    if (value === null || value === undefined) {
        console.warn(`Configuração "${name}" não encontrada. Usando valor padrão: ${defaultValue}`);
    }

    configCache[name] = value;
    return value;
}

// Retorna a URL do backend.
export function getBackendUrl() {
    return getConfig("REACT_APP_BACKEND_URL", "http://localhost:8080");
}

// Retorna o número de horas para fechar tickets automaticamente.
export function getHoursCloseTicketsAuto() {
    return getConfig("REACT_APP_HOURS_CLOSE_TICKETS_AUTO", "", false);
}
