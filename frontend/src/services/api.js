import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL,
  withCredentials: true
});

let isRefreshing = false;
let failedQueue = [];
let lastRefreshTime = 0;
const REFRESH_THRESHOLD = 25 * 60 * 1000; // 25 minutos em milissegundos

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
  api.delete("/auth/logout").catch(() => { });
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
    if (err?.response?.data?.error === "ERR_USER_INACTIVE") {
      throw err;
    }
    handleLogout();
    throw err;
  }
};

let userInactive = false;

const setUserInactiveFlag = (value) => {
  userInactive = value;
};

api.interceptors.request.use(
  async config => {
    if (userInactive && !config.url.includes("/auth/logout")) {
      return Promise.reject(new Error("User is inactive"));
    }

    if (config.url.includes("/auth/refresh_token") || config.url.includes("/auth/logout")) {
      return config;
    }

    const token = localStorage.getItem("token");
    if (token) {
      const now = Date.now();
      if (now - lastRefreshTime > REFRESH_THRESHOLD) {
        try {
          const { token: newToken } = await refreshToken();
          config.headers.Authorization = `Bearer ${newToken}`;
        } catch (err) {
          if (err?.response?.data?.error === "ERR_USER_INACTIVE") {
            setUserInactiveFlag(true);
          }
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

    if (error?.response?.data?.error === "ERR_SESSION_EXPIRED" || error?.response?.data?.error === "ERR_USER_INACTIVE") {
      if (error?.response?.data?.error === "ERR_USER_INACTIVE") {
        return Promise.reject(error);
      }

      handleLogout();
      return Promise.reject(error);
    }

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

export const markUserAsInactive = () => {
  setUserInactiveFlag(true);
};

export default api;