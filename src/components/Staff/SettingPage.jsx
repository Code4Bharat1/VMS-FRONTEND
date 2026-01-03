"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import * as yup from "yup";

/* ================= SECTIONS ================= */
const SECTIONS = [{ id: "profile", label: "Edit Profile" }];

export default function StaffSettings() {
  const [active, setActive] = useState("profile");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [user, setUser] = useState(null);

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
    password: "",
  });

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        password: "",
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
    password: yup.string().min(6, "Minimum 6 characters").optional(),
  });

  /* ================= SUBMIT ================= */
  const submitProfile = async () => {
    try {
      setErrors({});
      await profileSchema.validate(profile, { abortEarly: false });

      setSaving(true);
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/users/profile`,
        {
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          ...(profile.password && { password: profile.password }),
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

      setProfile({ ...profile, password: "" });
    } catch (err) {
      if (err.inner) {
        const e = {};
        err.inner.forEach((x) => (e[x.path] = x.message));
        setErrors(e);
      } else {
        alert(err.response?.data?.message || "Update failed");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-emerald-50/60">
      <div className="flex-1">
        {/* ================= HEADER ================= */}
        <header className="sticky top-0 z-40 bg-white border-b border-emerald-100 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-xl font-bold text-emerald-800">
                Staff Settings
              </h1>
              <p className="text-sm text-emerald-600 mt-1">
                Update your profile information
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold">
                {user?.name?.charAt(0) || "S"}
              </div>
              <div className="leading-tight">
                <p className="text-sm sm:text-base font-semibold text-emerald-800">
                  {user?.name || "Staff"}
                </p>
                <p className="text-xs sm:text-sm text-emerald-600 capitalize">
                  {user?.role || "Staff"}
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* ================= SETTINGS SIDEBAR ================= */}
          <aside>
            <div className="bg-white rounded-xl border border-emerald-100 p-3 shadow-sm">
              <div className="space-y-1">
                {SECTIONS.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setActive(s.id)}
                    className="w-full px-4 py-3 rounded-lg text-left text-sm font-medium bg-emerald-600 text-white shadow-sm transition-all"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* ================= CONTENT ================= */}
          <section className="lg:col-span-3">
            <div className="bg-white rounded-xl border border-emerald-100 shadow-sm p-6 sm:p-8">
              <Card
                title="Edit Profile"
                description="Update your personal details"
              >
                <Input
                  label="Name"
                  value={profile.name}
                  error={errors.name}
                  onChange={(v) => setProfile({ ...profile, name: v })}
                />
                <Input
                  label="Email"
                  value={profile.email}
                  error={errors.email}
                  onChange={(v) => setProfile({ ...profile, email: v })}
                />
                <Input
                  label="Phone"
                  value={profile.phone}
                  error={errors.phone}
                  onChange={(v) => setProfile({ ...profile, phone: v })}
                />
                <Input
                  label="New Password"
                  type="password"
                  value={profile.password}
                  error={errors.password}
                  onChange={(v) => setProfile({ ...profile, password: v })}
                />

                <ActionButton saving={saving} onClick={submitProfile} />
              </Card>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

/* ================= UI COMPONENTS ================= */

function Card({ title, description, children }) {
  return (
    <div>
      <div className="mb-6 pb-4 border-b border-emerald-100">
        <h2 className="text-xl font-bold text-emerald-800">{title}</h2>
        <p className="text-sm text-emerald-600 mt-1">{description}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{children}</div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text", error }) {
  return (
    <div>
      <label className="block text-sm font-medium text-emerald-700 mb-2">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full h-11 px-4 rounded-lg border bg-white focus:outline-none focus:ring-2 transition ${
          error
            ? "border-red-500 focus:ring-red-500"
            : "border-emerald-200 focus:ring-emerald-500"
        }`}
        placeholder={`Enter ${label.toLowerCase()}`}
      />
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}

function ActionButton({ onClick, saving }) {
  return (
    <div className="md:col-span-2 flex justify-end mt-8 pt-6 border-t border-emerald-100">
      <button
        onClick={onClick}
        disabled={saving}
        className="px-8 py-3 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow"
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
}