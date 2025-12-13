// src/lib/axiosInstance.js
import axios from "axios";
import authService from "@/services/authService";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

// Axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Needed for refresh token cookie
  headers: {
    "Content-Type": "application/json",
  },
});

// ---------------------------------------------
//               TOKEN HELPERS
// ---------------------------------------------
const getToken = () => localStorage.getItem("accessToken");
const clearAuth = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
};

// ---------------------------------------------
//        Add Access Token To Every Request
// ---------------------------------------------
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ---------------------------------------------
//      Response Interceptor (Auto Refresh)
// ---------------------------------------------

let isRefreshing = false;
let pendingRequests = [];

// Resend queued requests once refresh completes
const processPending = (error, token = null) => {
  pendingRequests.forEach((p) => {
    if (error) {
      p.reject(error);
    } else {
      p.resolve(token);
    }
  });
  pendingRequests = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // Not a token error → just return
    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    // Avoid infinite retry loop
    if (originalRequest._retry) {
      clearAuth();
      return Promise.reject(error);
    }

    // If already refreshing → queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingRequests.push({ resolve, reject });
      })
        .then((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axiosInstance(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    // Mark for retry
    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Call refresh token API
      const newToken = await authService.refreshToken();

      // Replay queued requests
      processPending(null, newToken);

      // Retry original request
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      processPending(refreshError, null);
      clearAuth();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default axiosInstance;
