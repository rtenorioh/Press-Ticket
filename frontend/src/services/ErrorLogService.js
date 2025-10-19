import api from "./api";

const ErrorLogService = {
  async logError(errorData) {
    try {
      if (!errorData || (!errorData.message && !errorData.stack)) {
        console.warn("Dados insuficientes para registrar erro");
        return null;
      }

      const { message, stack, component, severity = "error" } = errorData;
      
      const data = {
        source: "frontend",
        message: message || "Erro desconhecido",
        stack: stack || "",
        component: component || window.location.pathname,
        url: window.location.href || "",
        userAgent: navigator.userAgent || "",
        severity
      };

      try {
        const userData = JSON.parse(localStorage.getItem("profile")) || {};
        if (userData.id) {
          data.userId = userData.id;
          data.username = userData.name || "";
        }
      } catch (profileError) {
        console.warn("Erro ao obter perfil do usuário:", profileError);
      }

      try {
        const localLogs = JSON.parse(localStorage.getItem("errorLogs") || "[]");
        localLogs.push({ ...data, createdAt: new Date().toISOString() });
        if (localLogs.length > 50) {
          localLogs.shift();
        }
        localStorage.setItem("errorLogs", JSON.stringify(localLogs));
      } catch (storageError) {
        console.warn("Erro ao armazenar log localmente:", storageError);
      }

      try {
        return await api.post("/error-logs", data);
      } catch (apiError) {
        console.warn("API de logs não disponível:", apiError.message);
        return null;
      }
    } catch (error) {
      console.error("Erro ao processar log de erro:", error);
      return null;
    }
  },

  async getLogs(params = {}) {
    try {
      const response = await api.get("/error-logs", { params });
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar logs:", error);
      return { logs: [], count: 0 };
    }
  },
  
  async findAll(params = {}) {
    try {
      const response = await api.get("/error-logs", { params });
      return response;
    } catch (error) {
      console.error("Erro ao buscar logs (findAll):", error);
      return { data: { logs: [], count: 0 } };
    }
  },

  async getLog(id) {
    try {
      const response = await api.get(`/error-logs/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar log ${id}:`, error);
      return null;
    }
  },

  async findById(id) {
    try {
      const response = await api.get(`/error-logs/${id}`);
      return response;
    } catch (error) {
      console.error(`Erro ao buscar detalhes do log ${id}:`, error);
      throw error;
    }
  },

  async cleanupOldLogs(days = 30) {
    try {
      const response = await api.delete(`/error-logs/cleanup?days=${days}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao limpar logs antigos:", error);
      return { message: "Não foi possível limpar os logs antigos" };
    }
  },

  async deleteOldLogs(days = 30) {
    try {
      const response = await api.delete(`/error-logs/cleanup?days=${days}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao excluir logs antigos:", error);
      throw error;
    }
  },

  async downloadLogs(params = {}) {
    try {
      const { data } = await api.get("/error-logs", { params });
      
      if (!data || !data.logs || !data.logs.length) {
        throw new Error("Nenhum log encontrado para download");
      }
      
      const textContent = this.generateTextFile(data.logs);
      const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `press-ticket-logs-${new Date().toISOString().split("T")[0]}.txt`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return { success: true, message: "Logs baixados com sucesso" };
    } catch (error) {
      console.error("Erro ao baixar logs:", error);
      throw error;
    }
  },

  getLocalLogById(id) {
    try {
      const localLogs = JSON.parse(localStorage.getItem("errorLogs") || "[]");
      const log = localLogs.find(log => log.id === parseInt(id));
      return log || null;
    } catch (error) {
      console.error(`Erro ao buscar log local ${id}:`, error);
      return null;
    }
  },

  generateTextFile(logs) {
    if (!logs || !logs.length) {
      return "Nenhum log encontrado.";
    }

    let content = "LOGS DE ERRO - PRESS-TICKET®\n\n";
    
    logs.forEach(log => {
      content += `=== LOG ID: ${log.id} ===\n`;
      content += `Data: ${new Date(log.createdAt).toLocaleString()}\n`;
      content += `Origem: ${log.source}\n`;
      content += `Severidade: ${log.severity}\n`;
      content += `Usuário: ${log.username || "Não identificado"} (ID: ${log.userId || "N/A"})\n`;
      content += `URL: ${log.url || "N/A"}\n`;
      content += `Componente: ${log.component || "N/A"}\n`;
      content += `Navegador: ${log.userAgent || "N/A"}\n`;
      content += `Mensagem: ${log.message}\n`;
      
      if (log.stack) {
        content += `\nStack Trace:\n${log.stack}\n`;
      }
      
      content += "\n-------------------------------------------\n\n";
    });

    return content;
  }
};

export default ErrorLogService;
