import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:3456",
  withCredentials: true,
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Global response handler: on 401, clear token and notify the app, then redirect to login
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      try {
        localStorage.removeItem("token");
        window.dispatchEvent(new Event("authChanged"));
        // avoid redirect loop if already on /login
        if (!window.location.pathname.startsWith("/login")) {
          window.location.href = "/login";
        }
      } catch (e) {
        // ignore
      }
    }
    return Promise.reject(error);
  }
);

export default instance;
