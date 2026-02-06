"use client";
import Sidebar from "./sidebar";
import { useEffect, useState } from "react";
import axios from "axios";
import * as yup from "yup";
import { ChevronDown } from "lucide-react";

export default function SupervisorSettings() {
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

  useEffect(() => {
    if (user?.assignedBay) {
      setBays([user.assignedBay]);
      setStaff((prev) => ({
        ...prev,
        assignedBay:
          typeof user.assignedBay === "object"
            ? user.assignedBay._id
            : user.assignedBay,
      }));
    }
  }, [user]);

  /* ================= FORMS ================= */
  const [profile, setProfile] = useState({ 
    name: "", 
    email: "",
    phone: "" 
  });
  
  const [staff, setStaff] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    assignedBay: "",
  });

  // Notification preferences
  const [notifications, setNotifications] = useState({
    bayAlerts: true,
    staffPerformance: true,
    preferredChannel: "in-app"
  });

  // Workspace preferences
  const [workspace, setWorkspace] = useState({
    defaultView: "supervisor",
    timeWindow: "today",
    language: "English (Qatar)"
  });

  useEffect(() => {
    if (user) {
      setProfile({ 
        name: user.name, 
        email: user.email,
        phone: user.phone || ""
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
    phone: yup.string().matches(/^[0-9+\s()-]*$/, "Invalid phone format")
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
  const submitProfile = async () => {
  try {
    setErrors({});
    await profileSchema.validate(profile, { abortEarly: false });

    setSaving(true);

    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/supervisors/profile`,
      profile,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // ✅ MUST come from backend
    localStorage.setItem("user", JSON.stringify(res.data.user));
    setUser(res.data.user);

    alert("Profile updated successfully");
  } catch (err) {
    if (err.inner) {
      const e = {};
      err.inner.forEach((x) => (e[x.path] = x.message));
      setErrors(e);
    } else {
      console.error(err);
      alert(err.response?.data?.message || "Profile update failed");
    }
  } finally {
    setSaving(false);
  }
};


  const submitStaff = async () => {
    try {
      setErrors({});
      await staffSchema.validate(staff, { abortEarly: false });

      setSaving(true);
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/staff`, staff, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Staff added. Waiting for admin approval.");
      
      setStaff({
        name: "",
        email: "",
        phone: "",
        password: "",
        assignedBay: user?.assignedBay?._id || "",
      });
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

  const saveNotifications = async () => {
    try {
      setSaving(true);
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/users/notifications`, notifications, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Notification preferences updated");
    } catch (err) {
      alert("Failed to update notifications");
    } finally {
      setSaving(false);
    }
  };

  const saveWorkspace = async () => {
    try {
      setSaving(true);
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/users/workspace`, workspace, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Workspace preferences saved");
    } catch (err) {
      alert("Failed to save preferences");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1">
        {/* ================= HEADER ================= */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="max-w-7xl mx-auto flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">My Settings</h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage your supervisor profile, notifications, and preferences for staff and bays you oversee.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="font-medium text-gray-900">{user?.name || "Supervisor"}</p>
                <p className="text-xs text-gray-500">{user?.role || "Supervisor"}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-semibold">
                {user?.name?.charAt(0) || "S"}
              </div>
            </div>
          </div>
        </header>

        {/* ================= CONTENT ================= */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT COLUMN - Profile & Security */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile & Contact */}
              <Section
                title="Profile & contact"
                subtitle="Basic information about access points and staff panels."
                badge="Supervisor"
              >
                <Input
                  label="Full name"
                  value={profile.name}
                  onChange={(v) => setProfile({ ...profile, name: v })}
                  error={errors.name}
                />
                
                <Input
                  label="Mobile number"
                  value={profile.phone}
                  onChange={(v) => setProfile({ ...profile, phone: v })}
                  error={errors.phone}
                />
                
                <Input
                  label="Email"
                  value={profile.email}
                  onChange={(v) => setProfile({ ...profile, email: v })}
                  error={errors.email}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assigned bays
                  </label>
                  <div className="relative">
                    <input
                      value={bays.map(b => typeof b === 'object' ? b.bayName : b).join(", ") || "No bays assigned"}
                      disabled
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-gray-50 text-gray-700 cursor-not-allowed"
                    />
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Real-time view and manage activity for bays assigned to you.
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition">
                    Cancel
                  </button>
                  <button
                    onClick={submitProfile}
                    disabled={saving}
                    className="px-6 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60 transition"
                  >
                    {saving ? "Saving..." : "Save profile"}
                  </button>
                </div>
              </Section>

              {/* Access & Security */}
              <Section
                title="Access & security"
                subtitle="Manage login details and see where your account is active."
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="password"
                      value="••••••••"
                      disabled
                      className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 bg-gray-50"
                    />
                    <button className="px-4 py-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                      Change
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Two-step verification
                  </label>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-700 font-medium">SMS code</p>
                      <p className="text-xs text-gray-500">Recommended for supervisor accounts.</p>
                    </div>
                    
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <p className="text-sm font-medium text-gray-700 mb-3">Active sessions</p>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm text-gray-900">Desktop browser - This device</p>
                            <p className="text-xs text-gray-500">Last active: just now</p>
                          </div>
                          <span className="text-xs text-emerald-600 font-medium">Current</span>
                        </div>
                        <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                          <div>
                            <p className="text-sm text-gray-900">Mobile browser</p>
                            <p className="text-xs text-gray-500">Last active: 3 hours ago</p>
                          </div>
                          <button className="text-xs text-gray-600 hover:text-gray-900">Sign out</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Section>
            </div>

            {/* RIGHT COLUMN - Notifications & Workspace */}
            <div className="space-y-6">
              {/* Notification Preferences */}
              <Section
                title="Notification preferences"
                subtitle="Choose what you get notified about staff and bay activity."
              >
                <Toggle
                  label="Bay alerts"
                  description="Get alerts when queues build up at your bays."
                  checked={notifications.bayAlerts}
                  onChange={(v) => setNotifications({ ...notifications, bayAlerts: v })}
                />

                <Toggle
                  label="Staff performance notifications"
                  description="Daily summary of entries captured by your staff."
                  checked={notifications.staffPerformance}
                  onChange={(v) => setNotifications({ ...notifications, staffPerformance: v })}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred channel
                  </label>
                  <p className="text-xs text-gray-500 mb-3">Where we send important updates.</p>
                  <div className="flex gap-2">
                    <ChannelButton
                      label="In-app only"
                      active={notifications.preferredChannel === "in-app"}
                      onClick={() => setNotifications({ ...notifications, preferredChannel: "in-app" })}
                    />
                    <ChannelButton
                      label="Email"
                      active={notifications.preferredChannel === "email"}
                      onClick={() => setNotifications({ ...notifications, preferredChannel: "email" })}
                    />
                    <ChannelButton
                      label="SMS"
                      active={notifications.preferredChannel === "sms"}
                      onClick={() => setNotifications({ ...notifications, preferredChannel: "sms" })}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={saveNotifications}
                    disabled={saving}
                    className="px-6 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60 transition"
                  >
                    {saving ? "Updating..." : "Update alerts"}
                  </button>
                </div>
              </Section>

              {/* Workspace Preferences */}
              <Section
                title="Workspace preferences"
                subtitle="Control what you see for your staff and bays."
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default view
                  </label>
                  <div className="flex gap-2">
                    <ViewButton
                      label="Supervisor overview"
                      active={workspace.defaultView === "supervisor"}
                      onClick={() => setWorkspace({ ...workspace, defaultView: "supervisor" })}
                    />
                    <ViewButton
                      label="My staff"
                      active={workspace.defaultView === "staff"}
                      onClick={() => setWorkspace({ ...workspace, defaultView: "staff" })}
                    />
                    <ViewButton
                      label="My bays"
                      active={workspace.defaultView === "bays"}
                      onClick={() => setWorkspace({ ...workspace, defaultView: "bays" })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time window for metrics
                  </label>
                  <p className="text-xs text-gray-500 mb-3">
                    Affects charts and tables in your supervisor dashboards.
                  </p>
                  <select
                    value={workspace.timeWindow}
                    onChange={(e) => setWorkspace({ ...workspace, timeWindow: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="today">Today</option>
                    <option value="week">This week</option>
                    <option value="month">This month</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Language & region
                  </label>
                  <select
                    value={workspace.language}
                    onChange={(e) => setWorkspace({ ...workspace, language: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="English (Qatar)">English (Qatar)</option>
                    <option value="Arabic">Arabic</option>
                    <option value="English (US)">English (US)</option>
                  </select>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={saveWorkspace}
                    disabled={saving}
                    className="px-6 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60 transition"
                  >
                    {saving ? "Saving..." : "Save preferences"}
                  </button>
                </div>
              </Section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= UI COMPONENTS ================= */

function Section({ title, subtitle, badge, children }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
          </div>
          {badge && (
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">
              {badge}
            </span>
          )}
        </div>
      </div>
      <div className="px-6 py-5 space-y-5">
        {children}
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text", error }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-4 py-2.5 rounded-lg border ${
          error ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-emerald-500"
        } focus:outline-none focus:ring-2 transition`}
      />
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}

function Toggle({ label, description, checked, onChange }) {
  return (
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
          checked ? "bg-emerald-600" : "bg-gray-300"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

function ChannelButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition ${
        active
          ? "bg-emerald-600 text-white"
          : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
      }`}
    >
      {label}
    </button>
  );
}

function ViewButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition ${
        active
          ? "bg-emerald-600 text-white"
          : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
      }`}
    >
      {label}
    </button>
  );
}