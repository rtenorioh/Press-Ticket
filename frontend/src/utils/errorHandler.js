import ErrorLogService from "../services/SafeErrorLogService";

export const setupGlobalErrorHandlers = () => {
  window.addEventListener("unhandledrejection", (event) => {
    const error = event.reason;
    
    ErrorLogService.logError({
      message: error.message || "Promessa rejeitada não tratada",
      stack: error.stack,
      component: "unhandledrejection",
      severity: "error"
    });
  });

  window.addEventListener("error", (event) => {
    if (event.target && (event.target.nodeName === "IMG" || event.target.nodeName === "SCRIPT")) {
      return;
    }
    
    ErrorLogService.logError({
      message: event.message || "Erro global não tratado",
      stack: event.error ? event.error.stack : "",
      component: event.filename || "window.onerror",
      severity: "error"
    });
  });

  const originalConsoleError = console.error;
  console.error = (...args) => {
    if (args && args.length > 0) {
      originalConsoleError.apply(console, args);
    } else {
      originalConsoleError.call(console, "Erro sem detalhes");
      return;
    }
    
    try {
      if (!args || args.length === 0) {
        return;
      }
      
      const firstArg = args[0];
      
      if (!firstArg) {
        return;
      }
      
      if (typeof firstArg === "string" && 
          (firstArg.includes("Falha ao registrar erro") || 
           firstArg.includes("Erro ao tentar registrar erro"))) {
        return;
      }

      if (firstArg instanceof Error) {
        ErrorLogService.logError({
          message: firstArg.message || "Erro logado via console.error",
          stack: firstArg.stack,
          component: "console.error",
          severity: "warning"
        });
      } else if (typeof firstArg === "string" && args.length > 1 && args[1] instanceof Error) {
        const error = args[1];
        ErrorLogService.logError({
          message: `${firstArg} ${error && error.message ? error.message : ""}`,
          stack: error && error.stack ? error.stack : "",
          component: "console.error",
          severity: "warning"
        });
      }
    } catch (logError) {
      if (!logError.message || !logError.message.includes("Falha ao registrar erro")) {
        originalConsoleError("Erro ao tentar registrar erro do console:", logError);
      }
    }
  };
};

export const withErrorHandling = (fn, componentName, fallback = null) => {
  try {
    return fn();
  } catch (error) {
    ErrorLogService.logError({
      message: error.message || "Erro não identificado",
      stack: error.stack,
      component: componentName,
      severity: "error"
    });
    
    if (typeof fallback === "function") {
      return fallback(error);
    }
    
    throw error;
  }
};

const errorHandler = {
  setupGlobalErrorHandlers,
  withErrorHandling
};

export default errorHandler;
