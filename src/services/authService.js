// src/services/authService.js
import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // IMPORTANT for refresh token cookie
  headers: {
    "Content-Type": "application/json",
  },
});

// ---------------------------------------------
// TOKEN HELPERS (LOCALSTORAGE)
// ---------------------------------------------
const saveToken = (token) => localStorage.setItem("accessToken", token);
const getToken = () => localStorage.getItem("accessToken");
const clearToken = () => localStorage.removeItem("accessToken");

// ---------------------------------------------
// AUTH SERVICE CLASS
// ---------------------------------------------
class AuthService {
  // -----------------------
  // LOGIN
  // -----------------------
  async login(credentials) {
    try {
      const response = await api.post("/auth/login", credentials);

      const { accessToken, user } = response.data;

      // Save access token AFTER receiving it
      saveToken(accessToken);
      localStorage.setItem("user", JSON.stringify(user));

      return { accessToken, user };
    } catch (error) {
      const msg =
        error.response?.data?.message || error.message || "Login failed";
      throw new Error(msg);
    }
  }

  // -----------------------
  // REGISTER (Admin only)
  // -----------------------
  async register(userData) {
    try {
      const token = getToken(); // NOW token exists

      if (!token) {
        throw new Error("Unauthorized - Please login again");
      }

      const response = await api.post("/auth/register", userData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      const msg =
        error.response?.data?.message || error.message || "Registration failed";
      throw new Error(msg);
    }
  }

  // -----------------------
  // LOGOUT
  // -----------------------
  async logout() {
    try {
      await api.post("/auth/logout");

      clearToken();
      localStorage.removeItem("user");

      return { message: "Logged out" };
    } catch (error) {
      clearToken();
      localStorage.removeItem("user");

      const msg =
        error.response?.data?.message || error.message || "Logout failed";

      throw new Error(msg);
    }
  }

  // -----------------------
  // REFRESH TOKEN
  // -----------------------
  async refreshToken() {
    try {
      const response = await api.get("/auth/refresh");

      const { accessToken, user } = response.data;

      // Save new token
      saveToken(accessToken);

      // Update user if exists
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      }

      return accessToken;
    } catch (error) {
      clearToken();
      localStorage.removeItem("user");

      const msg =
        error.response?.data?.message ||
        error.message ||
        "Token refresh failed";

      throw new Error(msg);
    }
  }
}

export default new AuthService();
