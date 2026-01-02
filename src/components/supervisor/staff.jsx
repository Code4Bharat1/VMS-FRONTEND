"use client";

import * as yup from "yup";
import { Plus } from "lucide-react";
import React, { useState, useEffect } from "react";
import {
  Users,
  TrendingUp,
  Clock,
  Activity,
  X,
  Phone,
  MapPin,
  CheckCircle,
  AlertCircle,
  Filter,
  Search,
} from "lucide-react";
import Sidebar from "./sidebar";
import axios from "axios";

const MyStaff = () => {
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [activeView, setActiveView] = useState("today");
  const [filterBay, setFilterBay] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [staffData, setStaffData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [supervisor, setSupervisor] = useState(null);

  // ADD STAFF
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    assignedBay: "",
  });
  const [errors, setErrors] = useState({});

  const staffSchema = yup.object().shape({
    name: yup
      .string()
      .matches(/^[A-Za-z ]+$/, "Only alphabets are allowed")
      .required("Name is required"),
    email: yup
      .string()
      .email("Invalid email format")
      .required("Email is required"),
    phone: yup
      .string()
      .matches(/^[0-9]{10}$/, "Phone must be exactly 10 digits")
      .required("Phone is required"),
    password: yup
      .string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
  });
  const [entries, setEntries] = useState([]);
  const today = new Date().toDateString();

  const todayEntries = entries.filter((e) => {
    if (!supervisor?.assignedBay || !e.createdAt || !e.bayId) return false;

    const entryDate = new Date(e.createdAt).toDateString();

    const entryBayId = typeof e.bayId === "string" ? e.bayId : e.bayId._id;

    const supervisorBayId =
      typeof supervisor.assignedBay === "string"
        ? supervisor.assignedBay
        : supervisor.assignedBay._id;

    return (
      entryDate === today && String(entryBayId) === String(supervisorBayId)
    );
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setSupervisor(JSON.parse(storedUser));
  }, []);

  useEffect(() => {
    fetchStaff();
    fetchEntries();
  }, []);

  useEffect(() => {
    if (supervisor?.assignedBay) {
      setForm((prev) => ({
        ...prev,
        assignedBay:
          typeof supervisor.assignedBay === "string"
            ? supervisor.assignedBay
            : supervisor.assignedBay._id,
      }));
    }
  }, [supervisor]);

  const saveStaff = async () => {
    try {
      await staffSchema.validate(form, { abortEarly: false });
      setErrors({});

      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/staff`, form, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      alert("Staff added successfully and sent for admin approval.");

      setShowAddStaff(false);
      setForm({
        name: "",
        email: "",
        phone: "",
        password: "",
        assignedBay: form.assignedBay,
      });

      fetchStaff();
    } catch (err) {
      if (err.inner) {
        const e = {};
        err.inner.forEach((x) => (e[x.path] = x.message));
        setErrors(e);
      } else {
        console.error(err);
      }
    }
  };

  const fetchStaff = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/staff`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      setStaffData(res.data.staff || []);
    } catch (err) {
      console.error(err);
      setStaffData([]);
    } finally {
      setLoading(false);
    }
  };
  const fetchEntries = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/entries`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      setEntries(res.data.entries || []);
    } catch (err) {
      console.error("Failed to fetch entries", err);
      setEntries([]);
    }
  };

  const filteredStaff = staffData.filter((staff) => {
    if (!supervisor?.assignedBay || !staff.assignedBay?._id) return false;

    // 🚫 HIDE PENDING STAFF
    if (staff.approvalStatus !== "approved") return false;

    const supervisorBayId =
      typeof supervisor.assignedBay === "string"
        ? supervisor.assignedBay
        : supervisor.assignedBay._id;

    const staffBayId = staff.assignedBay._id;

    if (String(supervisorBayId) !== String(staffBayId)) return false;

    const matchesBay =
      filterBay === "all" || staff.assignedBay?.bayName === filterBay;

    const matchesSearch =
      staff.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.phone?.includes(searchQuery);

    return matchesBay && matchesSearch;
  });

  /* ---------------- MODAL ---------------- */
  const StaffModal = ({ staff, onClose }) => {
    if (!staff) return null;

    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-2 md:p-4">
        <div className="bg-white w-full md:max-w-5xl h-full md:h-auto md:max-h-[90vh] overflow-auto md:rounded-xl shadow-xl">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-emerald-100 px-4 md:px-8 py-4 md:py-6 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                {staff.name?.[0]}
              </div>
              <div>
                <h2 className="text-lg md:text-2xl font-bold text-emerald-800">{staff.name}</h2>
                <p className="text-emerald-600 text-sm">
                  {staff.role} • {staff.assignedBay?.bayName || "—"}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="text-emerald-600 hover:bg-emerald-50 p-1 rounded-lg transition">
              <X />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 md:p-8 space-y-8">
            {/* Contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <Phone className="mb-2 text-blue-600" />
                <p className="font-semibold text-2xl p-2">{staff.phone || "N/A"}</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                <MapPin className="mb-2 text-purple-600" />
                <p className="font-semibold text-2xl p-2">
                  {staff.assignedBay?.bayName || "Not Assigned"}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                ["Status", staff.isActive ? "Active" : "Inactive"],
                ["Today", getStaffEntryCount(staff._id)],
                ["Avg", staff.avgTime || "-"],
                ["7 Days", staff.last7Days || 0],
              ].map(([label, value], i) => (
                <div key={i} className="border border-emerald-100 rounded-lg p-4 text-center bg-white">
                  <p className="text-sm text-emerald-600">{label}</p>
                  <p className="font-bold text-lg text-emerald-800">{value}</p>
                </div>
              ))}
            </div>

            {/* Performance */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                ["Efficiency", staff.performance?.efficiency],
                ["Accuracy", staff.performance?.accuracy],
                ["Punctuality", staff.performance?.punctuality],
              ].map(([label, value], i) => (
                <div key={i} className="bg-emerald-50 border border-emerald-100 rounded-lg p-4">
                  <div className="flex justify-between mb-2">
                    <span className="font-semibold text-emerald-700">{label}</span>
                    <CheckCircle className="text-emerald-600" size={18} />
                  </div>
                  <p className="text-2xl font-bold text-emerald-800">{value ?? 0}%</p>
                </div>
              ))}
            </div>

            {/* Incidents */}
            {staff.incidents > 0 && (
              <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="text-orange-600" />
                  <h3 className="font-semibold text-orange-800">Incidents</h3>
                </div>
                <p className="text-orange-700">{staff.incidents} incident(s) logged</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const getStaffEntryCount = (staffId) => {
    return entries.filter((entry) => {
      if (!entry.createdBy || !entry.createdBy._id) return false;

      return String(entry.createdBy._id) === String(staffId);
    }).length;
  };

  /* ---------------- PAGE ---------------- */
  return (
    <div className="flex h-screen bg-emerald-50/60">
      <Sidebar />

      <div className="flex-1 overflow-y-auto overscroll-contain">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-white border-b border-emerald-100 px-4 md:px-8 py-4 md:py-6">
          <div className="flex flex-col sm:flex-row gap-4 sm:justify-between">
            <div>
              <h1 className="text-xl font-bold text-emerald-800">My Staff</h1>
              <p className="text-emerald-600 text-sm">
                Monitor your assigned security staff
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* ✅ ADD STAFF BUTTON */}
              <button
                onClick={() => setShowAddStaff(true)}
                className="px-4 h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-2 transition font-medium text-sm"
              >
                <Plus size={16} />
                Add Staff
              </button>

              <div className="w-10 h-10 bg-emerald-600 text-white rounded-lg flex items-center justify-center font-bold">
                {supervisor?.name?.[0]}
              </div>
              <div>
                <p className="font-semibold text-emerald-800">{supervisor?.name}</p>
                <p className="text-xs text-emerald-600">{supervisor?.role}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 md:px-8 py-4 md:py-6">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
            <StatCard
              title="Total Staff"
              value={filteredStaff.length}
              icon={<Users className="text-emerald-600" />}
            />

            <StatCard
              title="Active Staff"
              value={filteredStaff.filter((s) => s.isActive).length}
              icon={<Activity className="text-emerald-600" />}
            />

            <StatCard
              title="Today's Entries"
              value={todayEntries.length}
              icon={<TrendingUp className="text-emerald-600" />}
            />
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex gap-2 bg-white border border-emerald-100 p-1 rounded-lg">
              {["Today", "This week", "This month"].map((v) => (
                <button
                  key={v}
                  onClick={() =>
                    setActiveView(v.toLowerCase().replace(" ", "-"))
                  }
                  className={`px-4 py-2 rounded-lg text-sm transition ${
                    activeView === v.toLowerCase().replace(" ", "-")
                      ? "bg-emerald-100 text-emerald-700 font-medium"
                      : "text-emerald-600 hover:bg-emerald-50"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:ml-auto">
              <div className="relative w-full sm:w-64">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400"
                  size={18}
                />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search name or phone"
                  className="pl-10 pr-4 py-2 bg-white border border-emerald-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <select
                value={filterBay}
                onChange={(e) => setFilterBay(e.target.value)}
                className="bg-white border border-emerald-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Bays</option>
                <option value="Bay A">Bay A</option>
                <option value="Bay B">Bay B</option>
                <option value="Bay C">Bay C</option>
              </select>
            </div>
          </div>

          {/* Table (Desktop) */}
          <div className="hidden md:block bg-white rounded-xl border border-emerald-100 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-emerald-100">
                <tr>
                  {[
                    "Name",
                    "Phone",
                    "Bay",
                    "Email",
                    "Entries",
                    "Avg",
                    "Status",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-4 text-center text-sm font-semibold text-emerald-700"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-100">
                {filteredStaff.map((s) => (
                  <tr
                    key={s._id}
                    onClick={() => setSelectedStaff(s)}
                    className="hover:bg-emerald-50 cursor-pointer transition text-center"
                  >
                    <td className="px-6 py-4 font-medium text-emerald-800">{s.name}</td>
                    <td className="px-6 py-4">{s.phone}</td>
                    <td className="px-6 py-4">{s.assignedBay?.bayName}</td>
                    <td className="px-6 py-4">{s.email}</td>
                    <td className="px-6 py-4">{getStaffEntryCount(s._id)}</td>
                    <td className="px-6 py-4">{s.avgTime}</td>
                    <td className="px-6 py-4">
                      <span
  className={`px-3 py-1 rounded-full text-xs font-medium ${
    s.isActive
      ? "bg-emerald-100 text-emerald-700"
      : "bg-red-100 text-red-600"
  }`}
>
  {s.isActive ? "Active" : "Inactive"}
</span>

                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cards (Mobile) */}
          <div className="md:hidden space-y-4">
            {filteredStaff.map((s) => (
              <div
                key={s._id}
                onClick={() => setSelectedStaff(s)}
                className="bg-white p-4 rounded-lg border border-emerald-100 shadow-sm"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-emerald-800">{s.name}</p>
                    <p className="text-sm text-emerald-600">{s.role}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">
                    {s.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="mt-2 text-sm text-gray-700">
                  <p><span className="font-medium">Bay:</span> {s.assignedBay?.bayName}</p>
                  <p><span className="font-medium">Phone:</span> {s.phone}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedStaff && (
        <StaffModal
          staff={selectedStaff}
          onClose={() => setSelectedStaff(null)}
        />
      )}
      {showAddStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-xl">
            <div className="flex justify-between px-6 py-4 border-b border-emerald-100">
              <h2 className="font-semibold text-emerald-800">Add New Staff</h2>
              <X
                onClick={() => setShowAddStaff(false)}
                className="cursor-pointer text-emerald-600 hover:bg-emerald-50 p-1 rounded-lg transition"
              />
            </div>

            <div className="px-6 py-5 space-y-4 text-sm">
              <Field
                label="Full Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                error={errors.name}
              />
              <Field
                label="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                error={errors.email}
              />
              <Field
                label="Phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                error={errors.phone}
              />
              <Field
                type="password"
                label="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                error={errors.password}
              />

              <div>
                <label className="block mb-1 font-medium text-emerald-700">
                  Assigned Bay
                </label>
                <input
                  disabled
                  value={supervisor?.assignedBay?.bayName || ""}
                  className="w-full bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-emerald-100 flex justify-end gap-3">
              <button 
                onClick={() => setShowAddStaff(false)}
                className="text-emerald-600 hover:bg-emerald-50 px-4 py-2 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={saveStaff}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition font-medium"
              >
                Add Staff
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ------------ SMALL COMPONENT ------------ */
const StatCard = ({ title, value, icon }) => (
  <div className="bg-white border border-emerald-100 p-4 md:p-6 rounded-xl shadow-sm hover:shadow transition">
    <div className="flex justify-between items-center mb-2">
      <p className="text-sm text-emerald-600">{title}</p>
      {icon}
    </div>
    <p className="text-3xl font-bold text-emerald-800">{value}</p>
  </div>
);

const Field = ({ label, error, ...props }) => (
  <div>
    <label className="block mb-1 font-medium text-emerald-700">{label}</label>
    <input
      {...props}
      className={`w-full border rounded-lg px-3 py-2
                 focus:outline-none focus:ring-2
                 ${error ? "border-red-500 ring-red-500" : "border-emerald-200 focus:ring-emerald-500"}`}
    />
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

export default MyStaff;