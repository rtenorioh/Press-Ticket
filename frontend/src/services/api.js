import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL || "http://localhost:8080",
  withCredentials: true
});

let isRefreshing = false;
let failedQueue = [];
let lastRefreshTime = 0;
const REFRESH_THRESHOLD = 4 * 60 * 1000; // 4 minutos em milissegundos

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const handleLogout = () => {
  api.delete("/auth/logout").catch(() => {}); // Tenta fazer logout no backend
  localStorage.removeItem("token");
  window.location.href = "/login";
};

const refreshToken = async () => {
  try {
    const { data: { token, user } } = await api.post("/auth/refresh_token");
    localStorage.setItem("token", JSON.stringify(token));
    api.defaults.headers.Authorization = `Bearer ${token}`;
    lastRefreshTime = Date.now();
    return { token, user };
  } catch (err) {
    handleLogout();
    throw err;
  }
};

api.interceptors.request.use(
  async config => {
    if (config.url.includes("/auth/refresh_token") || config.url.includes("/auth/logout")) {
      return config;
    }

    const token = localStorage.getItem("token");
    if (token) {
      // Verifica se precisa renovar o token antes de fazer a requisição
      const now = Date.now();
      if (now - lastRefreshTime > REFRESH_THRESHOLD) {
        try {
          const { token: newToken } = await refreshToken();
          config.headers.Authorization = `Bearer ${newToken}`;
        } catch (err) {
          console.error("Error refreshing token:", err);
          return Promise.reject(err);
        }
      } else {
        config.headers.Authorization = `Bearer ${JSON.parse(token)}`;
      }
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // Se o erro for de sessão expirada, faz logout
    if (error?.response?.data?.error === "ERR_SESSION_EXPIRED") {
      handleLogout();
      return Promise.reject(error);
    }

    // Se o erro for de token inválido ou expirado
    if (error?.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        try {
          const token = await new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          });
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        } catch (err) {
          return Promise.reject(err);
        }
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { token } = await refreshToken();
        processQueue(null, token);
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
