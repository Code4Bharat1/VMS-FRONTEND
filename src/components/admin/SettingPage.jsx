"use client";

import { useEffect, useState } from "react";
import axios from "axios";

const SECTIONS = [
  { id: "profile", label: "Edit Profile" },
  { id: "staff", label: "Add Staff" },
  { id: "supervisor", label: "Add Supervisor" },
  { id: "vendor", label: "Add Vendor" },
  { id: "bay", label: "Add Bay"},
];

export default function AdminSettings() {
  const [active, setActive] = useState("profile");
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("accessToken")
      : null;

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) setUser(JSON.parse(u));
  }, []);

  /* ---------------- API HELPERS ---------------- */
  const post = (url, data) =>
    axios.post(url, data, {
      headers: { Authorization: `Bearer ${token}` },
    });

  /* ---------------- FORMS ---------------- */
  const [profile, setProfile] = useState({ name: "", email: "" });
  const [staff, setStaff] = useState({ name: "", email: "", phone: "", password: "" });
  const [supervisor, setSupervisor] = useState({ name: "", email: "", password: "" });
  const [vendor, setVendor] = useState({ companyName: "", contactPerson: "", mobile: "" });
  const [bay, setBay] = useState({ bayName: "", bayType: "" });

  useEffect(() => {
    if (user) setProfile({ name: user.name, email: user.email });
  }, [user]);

  /* ---------------- SUBMIT HANDLERS ---------------- */
  const submit = async (fn) => {
    try {
      setSaving(true);
      await fn();
      alert("Saved successfully");
    } catch (err) {
      alert(err.response?.data?.message || "Failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ================= HEADER ================= */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Settings Page</h1>
              <p className="text-sm text-gray-600 mt-1">Manage your account and system configurations</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <span className="text-emerald-700 font-semibold text-sm">
                  {user?.name?.charAt(0) || "A"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* ================= SIDEBAR ================= */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-200 p-3 shadow-sm">
              <div className="space-y-1">
                {SECTIONS.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setActive(s.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      active === s.id
                        ? "bg-emerald-600 text-white shadow-md"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span className="text-lg">{s.icon}</span>
                    <span>{s.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* ================= CONTENT ================= */}
          <section className="lg:col-span-3">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
              {active === "profile" && (
                <Card title="Edit Profile" description="Update your personal information">
                  <Input label="Name" value={profile.name}
                    onChange={(v) => setProfile({ ...profile, name: v })} />
                  <Input label="Email" value={profile.email}
                    onChange={(v) => setProfile({ ...profile, email: v })} />
                  <ActionButton saving={saving}
                    onClick={() =>
                      submit(() =>
                        post(`${process.env.NEXT_PUBLIC_API_URL}/users/profile`, profile)
                      )
                    }
                  />
                </Card>
              )}

              {active === "staff" && (
                <Card title="Add Staff" description="Add a new staff member to your team">
                  <Form form={staff} setForm={setStaff}
                    fields={["name", "email", "phone", "password"]} />
                  <ActionButton saving={saving}
                    onClick={() =>
                      submit(() =>
                        post(`${process.env.NEXT_PUBLIC_API_URL}/staff`, staff)
                      )
                    }
                  />
                </Card>
              )}

              {active === "supervisor" && (
                <Card title="Add Supervisor" description="Register a new supervisor account">
                  <Form form={supervisor} setForm={setSupervisor}
                    fields={["name", "email", "password"]} />
                  <ActionButton saving={saving}
                    onClick={() =>
                      submit(() =>
                        post(`${process.env.NEXT_PUBLIC_API_URL}/supervisors`, supervisor)
                      )
                    }
                  />
                </Card>
              )}

              {active === "vendor" && (
                <Card title="Add Vendor" description="Register a new vendor in the system">
                  <Form form={vendor} setForm={setVendor}
                    fields={["companyName", "contactPerson", "mobile"]} />
                  <ActionButton saving={saving}
                    onClick={() =>
                      submit(() =>
                        post(`${process.env.NEXT_PUBLIC_API_URL}/vendors`, vendor)
                      )
                    }
                  />
                </Card>
              )}

              {active === "bay" && (
                <Card title="Add Bay" description="Create a new bay location">
                  <Form form={bay} setForm={setBay}
                    fields={["bayName", "bayType"]} />
                  <ActionButton saving={saving}
                    onClick={() =>
                      submit(() =>
                        post(`${process.env.NEXT_PUBLIC_API_URL}/bays`, bay)
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
      <div className="mb-6 pb-4 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{children}</div>
    </div>
  );
}

function Input({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-11 rounded-xl px-4 border border-gray-300 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
        placeholder={`Enter ${label.toLowerCase()}`}
      />
    </div>
  );
}

function Form({ form, setForm, fields }) {
  return fields.map((f) => (
    <Input
      key={f}
      label={f.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase())}
      value={form[f]}
      onChange={(v) => setForm({ ...form, [f]: v })}
    />
  ));
}

function ActionButton({ onClick, saving }) {
  return (
    <div className="md:col-span-2 flex justify-end mt-8 pt-6 border-t border-gray-200">
      <button
        onClick={onClick}
        disabled={saving}
        className="px-8 py-3 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
}