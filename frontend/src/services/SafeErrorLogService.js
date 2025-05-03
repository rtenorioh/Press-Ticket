import api from "./api";

let realService = null;

try {
  import('./ErrorLogService').then(module => {
    realService = module.default;
  }).catch(error => {
    console.warn('Não foi possível carregar ErrorLogService:', error);
  });
} catch (error) {
  console.warn('Erro ao importar ErrorLogService:', error);
}

const isMethodAvailable = (methodName) => {
  return realService && typeof realService[methodName] === 'function';
};

const SafeErrorLogService = {
  logError: (errorData) => {
    if (isMethodAvailable('logError')) {
      try {
        return realService.logError(errorData).catch(err => {
          console.error('Falha ao registrar erro:', err);
          return Promise.resolve();
        });
      } catch (error) {
        console.warn('Erro ao chamar logError:', error);
        return Promise.resolve();
      }
    } else {
      try {
        if (!errorData || (!errorData.message && !errorData.stack)) {
          console.warn("Dados insuficientes para registrar erro");
          return Promise.resolve(null);
        }
        
        const enhancedData = {
          ...errorData,
          url: errorData.url || window.location.href,
          userAgent: navigator.userAgent,
          source: "frontend",
          severity: errorData.severity || "error",
          createdAt: new Date().toISOString()
        };
        
        try {
          const localLogs = JSON.parse(localStorage.getItem('errorLogs') || '[]');
          localLogs.push(enhancedData);
          localStorage.setItem('errorLogs', JSON.stringify(localLogs.slice(-100)));
        } catch (storageError) {
          console.warn("Não foi possível salvar o erro localmente", storageError);
        }
        
        try {
          return api.post('/error-logs', enhancedData);
        } catch (apiError) {
          console.warn("Não foi possível enviar o erro para a API", apiError);
          return Promise.resolve();
        }
      } catch (backupError) {
        console.warn('Erro na implementação de backup do logError:', backupError);
        return Promise.resolve();
      }
    }
  },

  async findAll(params = {}) {
    
    if (isMethodAvailable('findAll')) {
      try {
        const response = await realService.findAll(params);
        return response;
      } catch (err) {
        console.error('Falha ao buscar logs com ErrorLogService.findAll:', err);
        return { data: { logs: [], count: 0 } };
      }
    } else {
      try {
        const { page, pageNumber = 1, limit = 10, searchTerm, source, severity, startDate, endDate } = params || {};
        
        const pageParam = pageNumber || page || 1;
        
        let url = `/error-logs?pageNumber=${pageParam}&limit=${limit}`;
        
        if (searchTerm) url += `&searchTerm=${encodeURIComponent(searchTerm)}`;
        if (source) url += `&source=${encodeURIComponent(source)}`;
        if (severity) url += `&severity=${encodeURIComponent(severity)}`;
        if (startDate) url += `&startDate=${encodeURIComponent(startDate)}`;
        if (endDate) url += `&endDate=${encodeURIComponent(endDate)}`;
        
        return api.get(url)
          .then(response => {
            if (response && response.data) {
              if (Array.isArray(response.data)) {
                const count = parseInt(response.headers['x-total-count'], 10) || response.data.length;
                return {
                  data: {
                    logs: response.data,
                    count: count,
                    limit: parseInt(limit, 10),
                    offset: (parseInt(pageParam, 10) - 1) * parseInt(limit, 10)
                  }
                };
              }
              
              if (response.data.logs && response.data.count !== undefined) {
                return response;
              }
              
              if (response.data.rows && response.data.count !== undefined) {
                return {
                  data: {
                    logs: response.data.rows,
                    count: response.data.count,
                    limit: parseInt(limit, 10),
                    offset: (parseInt(pageParam, 10) - 1) * parseInt(limit, 10)
                  }
                };
              }
              
              const count = parseInt(response.headers['x-total-count'], 10) || response.data.length;
              return {
                data: {
                  logs: response.data,
                  count: count,
                  limit: parseInt(limit, 10),
                  offset: (parseInt(pageParam, 10) - 1) * parseInt(limit, 10)
                }
              };
            }
            return response;
          })
          .catch(err => {
            try {
              const localLogs = JSON.parse(localStorage.getItem('errorLogs') || '[]');
              
              let filteredLogs = [...localLogs];
              
              if (searchTerm) {
                const term = searchTerm.toLowerCase();
                filteredLogs = filteredLogs.filter(log => 
                  (log.message && log.message.toLowerCase().includes(term)) ||
                  (log.stack && log.stack.toLowerCase().includes(term)) ||
                  (log.component && log.component.toLowerCase().includes(term))
                );
              }
              
              if (source) {
                filteredLogs = filteredLogs.filter(log => log.source === source);
              }
              
              if (severity) {
                filteredLogs = filteredLogs.filter(log => log.severity === severity);
              }
              
              if (startDate) {
                const start = new Date(startDate).getTime();
                filteredLogs = filteredLogs.filter(log => new Date(log.createdAt).getTime() >= start);
              }
              
              if (endDate) {
                const end = new Date(endDate).getTime();
                filteredLogs = filteredLogs.filter(log => new Date(log.createdAt).getTime() <= end);
              }
              
              filteredLogs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
              
              const startIndex = (page - 1) * limit;
              const paginatedLogs = filteredLogs.slice(startIndex, startIndex + limit);
              
              return { data: { logs: paginatedLogs, count: filteredLogs.length } };
            } catch (localError) {
              console.error('Erro ao processar logs locais:', localError);
              return { data: { logs: [], count: 0 } };
            }
          });
      } catch (backupError) {
        console.warn('Erro na implementação de backup do findAll:', backupError);
        return Promise.resolve({ data: { logs: [], count: 0 } });
      }
    }
  },
  findById: (id) => {
    if (isMethodAvailable('findById')) {
      try {
        return realService.findById(id).catch(err => {
          console.error('Falha ao buscar log por ID:', err);
          return Promise.resolve({ data: null });
        });
      } catch (error) {
        console.warn('Erro ao chamar findById:', error);
        return Promise.resolve({ data: null });
      }
    } else {
      try {
        return api.get(`/error-logs/${id}`)
          .then(response => response)
          .catch(err => {
            console.warn('Falha ao buscar log da API, buscando localmente:', err);
            try {
              const localLogs = JSON.parse(localStorage.getItem('errorLogs') || '[]');
              const log = localLogs.find(log => log.id === id);
              return { data: log || null };
            } catch (localError) {
              console.error('Erro ao buscar log local:', localError);
              return { data: null };
            }
          });
      } catch (backupError) {
        console.warn('Erro na implementação de backup do findById:', backupError);
        return Promise.resolve({ data: null });
      }
    }
  },

  deleteOldLogs: (days = 30) => {
    if (isMethodAvailable('deleteOldLogs')) {
      try {
        return realService.deleteOldLogs(days).catch(err => {
          console.error('Falha ao excluir logs antigos:', err);
          return Promise.resolve();
        });
      } catch (error) {
        console.warn('Erro ao chamar deleteOldLogs:', error);
        return Promise.resolve();
      }
    } else {
      try {
        return api.delete(`/error-logs/cleanup?days=${days}`)
          .then(response => {
            return response;
          })
          .catch(err => {
            console.warn('Falha ao excluir logs antigos via API, limpando logs locais:', err);
            
            try {
              const localLogs = JSON.parse(localStorage.getItem('errorLogs') || '[]');
              const cutoffDate = new Date();
              cutoffDate.setDate(cutoffDate.getDate() - days);
              const cutoffTime = cutoffDate.getTime();
              
              const filteredLogs = localLogs.filter(log => {
                if (!log.createdAt) return true;
                const logDate = new Date(log.createdAt).getTime();
                return logDate >= cutoffTime;
              });
              
              localStorage.setItem('errorLogs', JSON.stringify(filteredLogs));
              
              return Promise.resolve();
            } catch (localError) {
              console.error('Erro ao limpar logs locais:', localError);
              return Promise.resolve();
            }
          });
      } catch (backupError) {
        console.warn('Erro na implementação de backup do deleteOldLogs:', backupError);
        return Promise.resolve();
      }
    }
  },

  downloadLogs: (filters) => {
    if (isMethodAvailable('downloadLogs')) {
      try {
        return realService.downloadLogs(filters).catch(err => {
          console.error('Falha ao fazer download de logs:', err);
          return Promise.resolve();
        });
      } catch (error) {
        console.warn('Erro ao chamar downloadLogs:', error);
        return Promise.resolve();
      }
    } else {
      try {
        const { searchTerm, source, severity, startDate, endDate } = filters || {};
        
        let url = `/error-logs?page=1&limit=1000`;
        
        if (searchTerm) url += `&searchTerm=${encodeURIComponent(searchTerm)}`;
        if (source) url += `&source=${encodeURIComponent(source)}`;
        if (severity) url += `&severity=${encodeURIComponent(severity)}`;
        if (startDate) url += `&startDate=${encodeURIComponent(startDate)}`;
        if (endDate) url += `&endDate=${encodeURIComponent(endDate)}`;
        
        return api.get(url)
          .then(response => {
            if (response && response.data && response.data.logs) {
              const logs = response.data.logs;
              
              let content = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f2f2f2; }
    tr:nth-child(even) { background-color: #f9f9f9; }
  </style>
</head>
<body>
  <table>
    <thead>
      <tr>
        <th>ID</th>
        <th>Data</th>
        <th>Fonte</th>
        <th>Severidade</th>
        <th>Componente</th>
        <th>Mensagem</th>
        <th>URL</th>
      </tr>
    </thead>
    <tbody>`;
              
              logs.forEach(log => {
                const escapeHtml = (text) => {
                  if (text === null || text === undefined) return '';
                  return String(text)
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#039;')
                    .replace(/\n/g, '<br>')
                    .replace(/\r/g, '');
                };
                
                const date = log.createdAt ? new Date(log.createdAt).toLocaleString() : '';
                
                content += `
      <tr>
        <td>${escapeHtml(log.id || '')}</td>
        <td>${escapeHtml(date)}</td>
        <td>${escapeHtml(log.source || '')}</td>
        <td>${escapeHtml(log.severity || '')}</td>
        <td>${escapeHtml(log.component || '')}</td>
        <td>${escapeHtml(log.message || '')}</td>
        <td>${escapeHtml(log.url || '')}</td>
      </tr>`;
              });
              
              content += `
    </tbody>
  </table>
</body>
</html>`;
              
              const blob = new Blob([content], { type: 'text/html;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.setAttribute('download', `error-logs-${new Date().toISOString().slice(0, 10)}.html`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              
              return Promise.resolve();
            } else {
              console.warn('Nenhum log encontrado para download');
              return Promise.resolve();
            }
          })
          .catch(err => {
            console.error('Falha ao buscar logs para download:', err);
            return Promise.resolve();
          });
      } catch (backupError) {
        console.warn('Erro na implementação de backup do downloadLogs:', backupError);
        return Promise.resolve();
      }
    }
  },

  getLocalLogs: () => {
    if (isMethodAvailable('getLocalLogs')) {
      try {
        return realService.getLocalLogs();
      } catch (error) {
        console.warn('Erro ao chamar getLocalLogs:', error);
        return [];
      }
    } else {
      console.warn('ErrorLogService.getLocalLogs não está disponível');
      return [];
    }
  },

  getLocalLogById: (id) => {
    if (isMethodAvailable('getLocalLogById')) {
      try {
        return realService.getLocalLogById(id);
      } catch (error) {
        console.warn('Erro ao chamar getLocalLogById:', error);
        return null;
      }
    } else {
      console.warn('ErrorLogService.getLocalLogById não está disponível');
      return null;
    }
  }
};

export default SafeErrorLogService;
