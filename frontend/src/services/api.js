
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token to every API request.
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("pharmacare_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Handle expired or invalid JWT tokens.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || "";

    // Do not log out when login itself returns 401
    // because that can simply mean incorrect credentials.
    const isLoginRequest = requestUrl.includes("/auth/login");

    if (status === 401 && !isLoginRequest) {
      window.dispatchEvent(
        new Event("pharmacare:unauthorized")
      );
    }

    // A 403 means access denied, not an expired token.
    return Promise.reject(error);
  }
);

export default api;
