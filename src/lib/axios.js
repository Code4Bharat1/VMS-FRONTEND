// src/lib/axiosInstance.js
import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:6094/api/v1";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

/* ---------------------------------------------
   TOKEN HELPERS (ACCESS TOKEN ONLY)
--------------------------------------------- */
const getAccessToken = () => localStorage.getItem("accessToken");

const clearAuth = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");

  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
};

/* ---------------------------------------------
   REQUEST INTERCEPTOR
--------------------------------------------- */
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAccessToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* ---------------------------------------------
   RESPONSE INTERCEPTOR (AUTO REFRESH)
--------------------------------------------- */
let isRefreshing = false;
let queue = [];

const processQueue = (error, token = null) => {
  queue.forEach((p) => {
    error ? p.reject(error) : p.resolve(token);
  });
  queue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      clearAuth();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        queue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return axiosInstance(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const res = await axiosInstance.post("/auth/refresh");
      const { accessToken } = res.data;

      localStorage.setItem("accessToken", accessToken);
      processQueue(null, accessToken);

      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return axiosInstance(originalRequest);
    } catch (err) {
      processQueue(err, null);
      clearAuth();
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  }
);

export default axiosInstance;
