// src/app/admin-register/page.jsx
"use client";

import React, { useState } from "react";
import { Loader2, LogOut, CarTaxiFront } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import ProtectedRoute from "@/components/ProtectedRoute";
import authService from "../../services/authService";

// Yup Schema
const schema = yup.object().shape({
  name: yup.string().required("Name is required"),
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  role: yup
    .string()
    .oneOf(["admin", "staff"], "Role must be admin or staff")
    .required("Role is required"),
});

function AdminRegisterContent() {
  const router = useRouter();

  const [serverError, setServerError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "staff",
    },
  });

  const onSubmit = async (values) => {
    setLoading(true);
    setServerError("");
    setSuccessMsg("");

    try {
      await authService.register(values);
      setSuccessMsg(`${values.role} registered successfully!`);
      reset(); // Clear form
    } catch (err) {
      console.error(err);
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // const handleLogout = async () => {
  //   try {
  //     await authService.logout();
  //     router.push("/login");
  //   } catch (err) {
  //     console.error(err);
  //   }
  // };

  return (
    <div className="min-h-screen bg-linear-to-b from-emerald-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        {/* Logo / Header */}
        <div className="flex flex-col items-center gap-3 mb-6">
          <div className="bg-green-100 text-green-700 p-3 rounded-xl">
            <CarTaxiFront size={32} />
          </div>
          <h1 className="text-2xl font-bold text-emerald-700">Admin Panel</h1>
          <p className="text-sm text-gray-500">Welcome, - Register new users</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              {...register("name")}
              type="text"
              placeholder="John Doe"
              className={`mt-1 w-full outline-0 rounded-md border px-3 py-2 focus:ring-2 ${
                errors.name
                  ? "border-red-300 focus:ring-red-200"
                  : "border-gray-200 focus:ring-emerald-200"
              }`}
            />
            {errors.name && (
              <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              {...register("email")}
              type="email"
              placeholder="user@example.com"
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

          {/* Password */}
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

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Role
            </label>
            <select
              {...register("role")}
              className={`mt-1 w-full outline-0 rounded-md border px-3 py-2 focus:ring-2 ${
                errors.role
                  ? "border-red-300 focus:ring-red-200"
                  : "border-gray-200 focus:ring-emerald-200"
              }`}
            >
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
            {errors.role && (
              <p className="text-xs text-red-600 mt-1">{errors.role.message}</p>
            )}
          </div>

          {/* Success message */}
          {successMsg && (
            <p className="text-sm text-green-600 mt-1 text-center">
              {successMsg}
            </p>
          )}

          {/* Error message */}
          {serverError && (
            <p className="text-sm text-red-600 mt-1 text-center">
              {serverError}
            </p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-emerald-600 hover:brightness-110 text-white rounded-md shadow flex items-center justify-center disabled:opacity-60"
          >
            {loading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              "Register User"
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Visitor Management System © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}

export default function AdminRegisterPage() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <AdminRegisterContent />
    </ProtectedRoute>
  );
}
