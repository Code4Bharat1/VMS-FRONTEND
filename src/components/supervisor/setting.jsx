"use client";
import Sidebar from "./sidebar";

import { useEffect, useState } from "react";
import axios from "axios";
import * as yup from "yup";

/* ================= SECTIONS ================= */
const SECTIONS = [
  { id: "profile", label: "Edit Profile" },
  { id: "staff", label: "Add Staff" },
];

export default function SupervisorSettings() {
  const [active, setActive] = useState("profile");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [user, setUser] = useState(null);
  const [bays, setBays] = useState([]);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  /* ================= LOAD USER ================= */
  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) setUser(JSON.parse(u));
  }, []);

  /* ================= LOAD BAYS (assigned) ================= */
  useEffect(() => {
    const fetchBays = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/bays`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setBays(res.data.bays || res.data || []);
      } catch (err) {
        console.error("Failed to load bays", err);
      }
    };
    fetchBays();
  }, []);

  /* ================= FORMS ================= */
  const [profile, setProfile] = useState({ name: "", email: "" });
  const [staff, setStaff] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    assignedBay: "",
  });

  useEffect(() => {
    if (user) setProfile({ name: user.name, email: user.email });
  }, [user]);

  /* ================= VALIDATION ================= */
  const profileSchema = yup.object({
    name: yup
      .string()
      .matches(/^[A-Za-z ]+$/, "Only alphabets allowed")
      .required("Name is required"),
    email: yup.string().email("Invalid email").required("Email is required"),
  });

  const staffSchema = yup.object({
    name: yup
      .string()
      .matches(/^[A-Za-z ]+$/, "Only alphabets allowed")
      .required("Name is required"),
    email: yup.string().email("Invalid email").required("Email is required"),
    phone: yup
      .string()
      .matches(/^[0-9]{10}$/, "Phone must be 10 digits")
      .required("Phone is required"),
    password: yup
      .string()
      .min(6, "Minimum 6 characters")
      .required("Password is required"),
    assignedBay: yup.string().required("Assigned bay is required"),
  });

  /* ================= SUBMIT ================= */
  const submit = async (schema, data, endpoint, reset) => {
    try {
      setErrors({});
      await schema.validate(data, { abortEarly: false });

      setSaving(true);
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`,
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(
        active === "staff"
          ? "Staff added. Waiting for admin approval."
          : "Profile updated"
      );

      reset && reset();
    } catch (err) {
      if (err.inner) {
        const e = {};
        err.inner.forEach((x) => (e[x.path] = x.message));
        setErrors(e);
      } else {
        alert(err.response?.data?.message || "Failed");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-emerald-50/60">
      <Sidebar activePage="settings" />
      <div className="flex-1">
        {/* ================= HEADER ================= */}
        <header className="sticky top-0 z-40 bg-white border-b border-emerald-100 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-xl font-bold text-emerald-800">
                Supervisor Settings
              </h1>
              <p className="text-sm text-emerald-600 mt-1">
                Manage your profile and request staff
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold">
              {user?.name?.charAt(0) || "S"}
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* ================= SIDEBAR ================= */}
          <aside>
            <div className="bg-white rounded-xl border border-emerald-100 p-3 shadow-sm">
              <div className="space-y-1">
                {SECTIONS.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setActive(s.id);
                      setErrors({});
                    }}
                    className={`w-full px-4 py-3 rounded-lg text-left text-sm font-medium transition-all ${
                      active === s.id
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "text-emerald-700 hover:bg-emerald-50"
                    }`}
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
              {active === "profile" && (
                <Card title="Edit Profile" description="Update your details">
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
                  <ActionButton
                    saving={saving}
                    onClick={() =>
                      submit(profileSchema, profile, "/users/profile")
                    }
                  />
                </Card>
              )}

              {active === "staff" && (
                <Card
                  title="Add Staff"
                  description="Staff will require admin approval"
                >
                  <Input
                    label="Name"
                    value={staff.name}
                    error={errors.name}
                    onChange={(v) => setStaff({ ...staff, name: v })}
                  />
                  <Input
                    label="Email"
                    value={staff.email}
                    error={errors.email}
                    onChange={(v) => setStaff({ ...staff, email: v })}
                  />
                  <Input
                    label="Phone"
                    value={staff.phone}
                    error={errors.phone}
                    onChange={(v) => setStaff({ ...staff, phone: v })}
                  />
                  <Input
                    label="Password"
                    type="password"
                    value={staff.password}
                    error={errors.password}
                    onChange={(v) => setStaff({ ...staff, password: v })}
                  />

                  <div>
                    <label className="block text-sm font-medium text-emerald-700 mb-2">
                      Assigned Bay
                    </label>
                    <select
                      value={staff.assignedBay}
                      onChange={(e) =>
                        setStaff({ ...staff, assignedBay: e.target.value })
                      }
                      className={`w-full h-11 px-4 rounded-lg border bg-white focus:outline-none focus:ring-2 transition ${
                        errors.assignedBay
                          ? "border-red-500 focus:ring-red-500"
                          : "border-emerald-200 focus:ring-emerald-500"
                      }`}
                    >
                      <option value="">Select Bay</option>
                      {bays.map((b) => (
                        <option key={b._id} value={b._id}>
                          {b.bayName}
                        </option>
                      ))}
                    </select>
                    {errors.assignedBay && (
                      <p className="text-xs text-red-600 mt-1">
                        {errors.assignedBay}
                      </p>
                    )}
                  </div>

                  <ActionButton
                    saving={saving}
                    onClick={() =>
                      submit(staffSchema, staff, "/staff", () =>
                        setStaff({
                          name: "",
                          email: "",
                          phone: "",
                          password: "",
                          assignedBay: "",
                        })
                      )
                    }
                  />
                </Card>
              )}
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