"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import * as yup from "yup";
import Sidebar from "./sidebar";

/* ================= SECTIONS ================= */
const SECTIONS = [{ id: "profile", label: "Edit Profile", icon: "👤" }];

export default function SupervisorSettings() {
  const [activePage, setActivePage] = useState("settings");
  const [active, setActive] = useState("profile");
  const [errors, setErrors] = useState({});
  const [user, setUser] = useState(null);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  /* ================= LOAD USER ================= */
  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) setUser(JSON.parse(u));
  }, []);

  /* ================= FORM ================= */
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  /* ================= VALIDATION ================= */
  const profileSchema = yup.object({
    name: yup
      .string()
      .matches(/^[A-Za-z ]+$/, "Only alphabets allowed")
      .required("Name is required"),
    email: yup.string().email("Invalid email").required("Email is required"),
    phone: yup
      .string()
      .matches(/^[0-9]{10}$/, "Phone must be 10 digits")
      .required("Phone is required"),
  });

  const passwordSchema = yup.object().shape({
    currentPassword: yup.string().required("Current password is required"),
    newPassword: yup
      .string()
      .min(6, "Password must be at least 6 characters")
      .required("New password is required"),
  });

  /* ================= SUBMIT PROFILE ================= */
  const submitProfile = async () => {
    try {
      setErrors({});
      await profileSchema.validate(profile, { abortEarly: false });

      setProfileSaving(true);
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/users/profile`,
        {
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Profile updated successfully");

      // update local storage
      const updatedUser = {
        ...JSON.parse(localStorage.getItem("user")),
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (err) {
      if (err.inner) {
        const e = {};
        err.inner.forEach((x) => (e[x.path] = x.message));
        setErrors(e);
      } else {
        alert(err.response?.data?.message || "Update failed");
      }
    } finally {
      setProfileSaving(false);
    }
  };

  /* ================= UPDATE PASSWORD ================= */
  const updatePassword = async () => {
    try {
      setErrors({});
      await passwordSchema.validate(passwordForm, { abortEarly: false });

      setPasswordSaving(true);

      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/users/update-password`,
        passwordForm,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Password updated. Please login again.");
      localStorage.clear();
      window.location.href = "/login";
    } catch (err) {
      if (err.inner) {
        const e = {};
        err.inner.forEach((x) => (e[x.path] = x.message));
        setErrors(e);
      } else {
        alert(err.response?.data?.message || "Password update failed");
      }
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-50">
      <Sidebar activePage={activePage} onPageChange={setActivePage} />

      <div className="flex-1 flex flex-col w-full min-w-0 overflow-auto">
        {/* ================= HEADER ================= */}
        <header className="bg-white/80 backdrop-blur-md border-b border-emerald-100 shadow-sm">
          <div className="px-4 sm:px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-emerald-900">
                  Supervisor Settings
                </h1>
                <p className="text-xs sm:text-sm text-emerald-600 mt-1">
                  Manage your profile and account settings
                </p>
              </div>
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-emerald-900">
                    {user?.name || "Supervisor"}
                  </p>
                  <p className="text-xs text-emerald-600 capitalize">
                    {user?.role || "Supervisor"}
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-base sm:text-lg">
                    {user?.name?.charAt(0) || "S"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* ================= MAIN CONTENT ================= */}
        <div className="flex-1 overflow-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
              {/* ================= SIDEBAR ================= */}
              <aside className="lg:col-span-1">
                <div className="bg-white rounded-xl sm:rounded-2xl border border-emerald-100 p-3 sm:p-4 shadow-lg lg:sticky lg:top-6">
                  <div className="space-y-1 sm:space-y-2">
                    {SECTIONS.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => {
                          setActive(s.id);
                          setErrors({});
                        }}
                        className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 ${
                          active === s.id
                            ? "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-md scale-105"
                            : "text-emerald-700 hover:bg-emerald-50 hover:scale-102"
                        }`}
                      >
                        <span className="text-base sm:text-lg">{s.icon}</span>
                        <span>{s.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </aside>

              {/* ================= CONTENT ================= */}
              <section className="lg:col-span-4">
                <div className="bg-white rounded-xl sm:rounded-2xl border border-emerald-100 shadow-lg p-4 sm:p-6 md:p-8">
                  {active === "profile" && (
                    <div>
                      <div className="mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-emerald-100">
                        <h2 className="text-xl sm:text-2xl font-bold text-emerald-900">
                          Edit Profile
                        </h2>
                        <p className="text-xs sm:text-sm text-emerald-600 mt-2">
                          Update your personal information and security settings
                        </p>
                      </div>

                      {/* Profile Information Card */}
                      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 border border-emerald-100">
                        <h3 className="text-base sm:text-lg font-semibold text-emerald-900 mb-3 sm:mb-4">
                          Personal Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                          <Input
                            label="Full Name"
                            value={profile.name}
                            error={errors.name}
                            onChange={(v) => setProfile({ ...profile, name: v })}
                          />
                          <Input
                            label="Email Address"
                            value={profile.email}
                            error={errors.email}
                            onChange={(v) => setProfile({ ...profile, email: v })}
                          />
                          <Input
                            label="Phone Number"
                            value={profile.phone}
                            error={errors.phone}
                            onChange={(v) => setProfile({ ...profile, phone: v })}
                          />
                        </div>
                        <div className="flex justify-end mt-4 sm:mt-6">
                          <button
                            onClick={submitProfile}
                            disabled={profileSaving}
                            className="w-full sm:w-auto px-5 sm:px-6 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-sm sm:text-base font-medium hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
                          >
                            {profileSaving ? (
                              <span className="flex items-center justify-center gap-2">
                                <svg
                                  className="animate-spin h-4 w-4"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    fill="none"
                                  />
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  />
                                </svg>
                                Updating...
                              </span>
                            ) : (
                              "Update Profile"
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Security Settings Card */}
                      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 sm:p-6 border border-amber-200">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                          <div>
                            <h3 className="text-base sm:text-lg font-semibold text-emerald-900 mb-1">
                              Security Settings
                            </h3>
                            <p className="text-xs sm:text-sm text-emerald-600">
                              Keep your account secure by updating your password regularly
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              setShowPasswordModal(true);
                              setErrors({});
                              setPasswordForm({
                                currentPassword: "",
                                newPassword: "",
                              });
                            }}
                            className="w-full sm:w-auto px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-white border-2 border-emerald-600 text-emerald-700 text-sm sm:text-base font-medium hover:bg-emerald-50 transition-all duration-200 shadow-sm hover:shadow-md whitespace-nowrap"
                          >
                            🔒 Change Password
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      {/* ================= PASSWORD MODAL ================= */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-4 sm:px-6 py-4 sm:py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-white/20 flex items-center justify-center">
                    <span className="text-xl sm:text-2xl">🔒</span>
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-white">
                      Change Password
                    </h3>
                    <p className="text-emerald-100 text-xs sm:text-sm mt-0.5">
                      Update your account password
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setErrors({});
                    setPasswordForm({
                      currentPassword: "",
                      newPassword: "",
                    });
                  }}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-5">
              <Input
                label="Current Password"
                type="password"
                value={passwordForm.currentPassword}
                error={errors.currentPassword}
                onChange={(v) =>
                  setPasswordForm({ ...passwordForm, currentPassword: v })
                }
              />

              <Input
                label="New Password"
                type="password"
                value={passwordForm.newPassword}
                error={errors.newPassword}
                onChange={(v) =>
                  setPasswordForm({ ...passwordForm, newPassword: v })
                }
              />

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 sm:p-4">
                <div className="flex gap-2 sm:gap-3">
                  <span className="text-amber-600 text-lg sm:text-xl">⚠️</span>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-amber-900">
                      Security Notice
                    </p>
                    <p className="text-[10px] sm:text-xs text-amber-700 mt-1">
                      You will be logged out after changing your password and
                      need to login again with the new credentials.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-4 sm:px-6 py-4 sm:py-5 bg-gray-50 border-t border-gray-200 flex gap-2 sm:gap-3 justify-end">
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setErrors({});
                  setPasswordForm({
                    currentPassword: "",
                    newPassword: "",
                  });
                }}
                className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl border-2 border-gray-300 text-gray-700 text-sm sm:text-base font-medium hover:bg-gray-100 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={updatePassword}
                disabled={passwordSaving}
                className="px-5 sm:px-6 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-sm sm:text-base font-medium hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                {passwordSaving ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Updating...
                  </span>
                ) : (
                  "Update Password"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= UI COMPONENTS ================= */

function Input({ label, value, onChange, type = "text", error }) {
  return (
    <div>
      <label className="block text-xs sm:text-sm font-semibold text-emerald-800 mb-1.5 sm:mb-2">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full h-10 sm:h-12 rounded-xl px-3 sm:px-4 border-2 bg-white text-sm sm:text-base focus:outline-none focus:ring-2 transition-all ${
          error
            ? "border-red-400 focus:ring-red-300"
            : "border-emerald-200 focus:ring-emerald-300 focus:border-emerald-400"
        }`}
        placeholder={`Enter ${label.toLowerCase()}`}
      />
      {error && <p className="text-red-600 text-xs mt-1.5 sm:mt-2 font-medium">{error}</p>}
    </div>
  );
}