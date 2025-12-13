"use client";

import React, { useState, useEffect } from "react";
import { CarTaxiFront, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import authService from "@/services/authService";
import { useAuth } from "@/context/AuthContext";

const schema = yup.object().shape({
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),
  password: yup.string().required("Password is required"),
});

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, user, login } = useAuth();

  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === "admin") {
        router.push("/admin-register");
      } else {
        router.push("/staff/dashboard");
      }
    }
  }, [isAuthenticated, user, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values) => {
    setLoading(true);
    setServerError("");

    try {
      const { accessToken, user } = await authService.login(values);
      login(accessToken, user);

      if (user.role === "admin") {
        router.push("/admin-register");
      } else {
        router.push("/staff/dashboard");
      }
    } catch (err) {
      console.error(err);
      const msg = err.message || "Login failed. Please try again.";
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="flex flex-col items-center gap-3 mb-6">
          <div className="bg-green-100 text-green-700 p-3 rounded-xl">
            <CarTaxiFront size={32} />
          </div>
          <h1 className="text-2xl font-bold text-emerald-700">
            Welcome to VMS
          </h1>
          <p className="text-sm text-gray-500">
            Please login to your admin/staff account
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              {...register("email")}
              type="email"
              placeholder="name@example.com"
              className={`mt-1 w-full outline-0 rounded-md border px-3 py-2 focus:ring-2 ${
                errors.email
                  ? "border-red-300 focus:ring-red-200"
                  : "border-gray-200 focus:ring-emerald-200"
              }`}
            />
            {errors.email && (
              <p className="text-xs text-red-600 mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              {...register("password")}
              type="password"
              placeholder="••••••••"
              className={`mt-1 w-full outline-0 rounded-md border px-3 py-2 focus:ring-2 ${
                errors.password
                  ? "border-red-300 focus:ring-red-200"
                  : "border-gray-200 focus:ring-emerald-200"
              }`}
            />
            {errors.password && (
              <p className="text-xs text-red-600 mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {serverError && (
            <p className="text-sm text-red-600 mt-1 text-center">
              {serverError}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-emerald-600 hover:brightness-110 text-white rounded-md shadow flex items-center justify-center disabled:opacity-60"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : "Login"}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          Visitor Management System © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
