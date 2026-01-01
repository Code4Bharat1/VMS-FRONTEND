// src/services/authService.js
import axiosInstance from "@/lib/axios";

class AuthService {
  /* ---------------- LOGIN ---------------- */
  async login(credentials) {
    const res = await axiosInstance.post("/auth/login", credentials);

    const { accessToken, user } = res.data;

    if (res.data) {
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("accessToken", accessToken);
    }

    return { accessToken, user };
  }

  /* ---------------- LOGOUT ---------------- */
  async logout() {
    try {
      await axiosInstance.post("/auth/logout");
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");

      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  }
}

export default new AuthService();
