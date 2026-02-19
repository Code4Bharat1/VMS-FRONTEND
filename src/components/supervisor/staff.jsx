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
  const supervisorBayIds = React.useMemo(() => {
    if (!supervisor?.managedBays) return [];
    return supervisor.managedBays.map((b) =>
      typeof b === "string" ? b : b._id,
    );
  }, [supervisor]);

  // NEW: Track view mode (approved vs pending)
  const [viewMode, setViewMode] = useState("approved"); // "approved" or "pending"

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
    if (!supervisorBayIds.length || !e.createdAt || !e.bayId) return false;

    const entryDate = new Date(e.createdAt).toDateString();
    const entryBayId = typeof e.bayId === "string" ? e.bayId : e.bayId._id;

    return entryDate === today && supervisorBayIds.includes(String(entryBayId));
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setSupervisor(JSON.parse(storedUser));
  }, []);

  useEffect(() => {
    fetchStaff();
    fetchEntries();
  }, []);

  const saveStaff = async () => {
    try {
      await staffSchema.validate(form, { abortEarly: false });
      setErrors({});

      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/staff`, form, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      alert("Guard added successfully and sent for admin approval.");

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
        },
      );
      setEntries(res.data.entries || []);
    } catch (err) {
      console.error("Failed to fetch entries", err);
      setEntries([]);
    }
  };

  // NEW: Toggle active/inactive status
  const toggleStaffStatus = async (staffId, currentStatus) => {
    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/staff/${staffId}/toggle-status`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        },
      );

      // Update local state
      setStaffData((prev) =>
        prev.map((s) =>
          s._id === staffId ? { ...s, isActive: !currentStatus } : s,
        ),
      );

      alert(
        `guard status updated to ${!currentStatus ? "Active" : "Inactive"}`,
      );
    } catch (err) {
      console.error("Failed to toggle status", err);
      alert("Failed to update status");
    }
  };

  // NEW: Filter for approved staff
  const approvedStaff = staffData.filter((staff) => {
    if (!staff.assignedBay?._id) return false;
    if (staff.approvalStatus !== "approved") return false;

    const staffBayId = staff.assignedBay._id;

    if (!supervisorBayIds.includes(String(staffBayId))) return false;

    const matchesBay =
      filterBay === "all" || staff.assignedBay?.bayName === filterBay;

    const q = searchQuery.toLowerCase();
    const matchesSearch =
      staff.name?.toLowerCase().includes(q) ||
      staff.email?.toLowerCase().includes(q) ||
      staff.phone?.includes(searchQuery);

    return matchesBay && matchesSearch;
  });

  // NEW: Filter for pending staff
  const pendingStaff = staffData.filter((staff) => {
    if (!staff.assignedBay?._id) return false;
    if (staff.approvalStatus !== "pending") return false;

    const staffBayId = staff.assignedBay._id;
    if (!supervisorBayIds.includes(String(staffBayId))) return false;

    const matchesBay =
      filterBay === "all" || staff.assignedBay?.bayName === filterBay;

    const q = searchQuery.toLowerCase();
    const matchesSearch =
      staff.name?.toLowerCase().includes(q) ||
      staff.email?.toLowerCase().includes(q) ||
      staff.phone?.includes(searchQuery);

    return matchesBay && matchesSearch;
  });

  // NEW: Filter for rejected staff
  const rejectedStaff = staffData.filter((staff) => {
    if (!staff.assignedBay?._id) return false;
    if (staff.approvalStatus !== "rejected") return false;

    const staffBayId = staff.assignedBay._id;
    if (!supervisorBayIds.includes(String(staffBayId))) return false;

    const matchesBay =
      filterBay === "all" || staff.assignedBay?.bayName === filterBay;

    const q = searchQuery.toLowerCase();
    const matchesSearch =
      staff.name?.toLowerCase().includes(q) ||
      staff.email?.toLowerCase().includes(q) ||
      staff.phone?.includes(searchQuery);

    return matchesBay && matchesSearch;
  });

  // Use the appropriate list based on view mode
  const filteredStaff =
    viewMode === "approved"
      ? approvedStaff
      : viewMode === "pending"
        ? pendingStaff
        : rejectedStaff;

  /* ---------------- MODAL ---------------- */
  const StaffModal = ({ staff, onClose }) => {
    if (!staff) return null;

    const todayEntries = getTodayEntries(staff);

    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-2xl rounded-xl shadow-xl relative max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-emerald-100 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-emerald-800">
                {staff.name}
              </h2>
              <p className="text-sm text-emerald-600">
                guard Details & Activity
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-emerald-400 hover:text-emerald-600 transition"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-5 space-y-5 overflow-y-auto">
            {/* Current Status Bar */}
            <div className="bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-3 flex justify-between items-center">
              <span className="text-emerald-700 font-medium">
                Current Status:
              </span>
              <span
                className={`px-4 py-1 rounded-full text-sm font-medium ${
                  staff.isActive
                    ? "bg-orange-100 text-orange-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {staff.isActive ? "active" : "inactive"}
              </span>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white border border-emerald-100 rounded-lg p-4">
                <p className="text-sm text-emerald-600 mb-1">Entries Today</p>
                <p className="text-3xl font-bold text-emerald-800">
                  {todayEntries.length}
                </p>
              </div>

              <div className="bg-white border border-emerald-100 rounded-lg p-4">
                <p className="text-sm text-emerald-600 mb-1">Average Time</p>
                <p className="text-3xl font-bold text-emerald-800">
  {getStaffAvgTime(staff._id)}
</p>
              </div>

              <div className="bg-white border border-emerald-100 rounded-lg p-4">
                <p className="text-sm text-emerald-600 mb-1">
                  Currently Inside
                </p>
                <p className="text-3xl font-bold text-emerald-800">0</p>
              </div>

              <div className="bg-white border border-emerald-100 rounded-lg p-4">
                <p className="text-sm text-emerald-600 mb-1">Guard on Duty</p>
                <p className="text-3xl font-bold text-emerald-800">1</p>
              </div>
            </div>

            {/* Staff Information */}
            <div className="bg-white border border-emerald-100 rounded-lg p-5">
              <h3 className="text-emerald-700 font-semibold mb-4">
                Guard Information
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-emerald-50">
                  <span className="text-emerald-600">Guard Name:</span>
                  <span className="text-emerald-800 font-medium text-right">
                    {staff.name}
                  </span>
                </div>

                <div className="flex justify-between py-2 border-b border-emerald-50">
                  <span className="text-emerald-600">Phone:</span>
                  <span className="text-emerald-800 font-medium text-right">
                    {staff.phone}
                  </span>
                </div>

                <div className="flex justify-between py-2 border-b border-emerald-50">
                  <span className="text-emerald-600">Email:</span>
                  <span className="text-emerald-800 font-medium text-right">
                    {staff.email}
                  </span>
                </div>

                <div className="flex justify-between py-2 border-b border-emerald-50">
                  <span className="text-emerald-600">Assigned Bay:</span>
                  <span className="text-emerald-800 font-medium text-right">
                    {staff.assignedBay?.bayName}
                  </span>
                </div>

                <div className="flex justify-between py-2 border-b border-emerald-50">
                  <span className="text-emerald-600">Role:</span>
                  <span className="text-emerald-800 font-medium text-right">
                    {staff.role || "Security Staff"}
                  </span>
                </div>

                <div className="flex justify-between py-2">
                  <span className="text-emerald-600">Reports To:</span>
                  <span className="text-emerald-800 font-medium text-right">
                    {supervisor?.name} (You)
                  </span>
                </div>
              </div>
            </div>

            {/* Entry History */}
            <div className="bg-white border border-emerald-100 rounded-lg p-5">
              <h3 className="text-emerald-700 font-semibold mb-3">
                Entry History (Today)
              </h3>

              <div className="space-y-2 text-sm text-gray-600">
                {todayEntries.map((e) => (
                  <div
                    key={e._id}
                    className="flex justify-between py-2 border-b border-emerald-50"
                  >
                    <span className="text-emerald-600">
                      {new Date(e.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span className="text-emerald-800">
                      {e.vehicleType || "Vehicle"}
                    </span>
                    <span className="text-emerald-800">{e.bayId?.bayName}</span>
                    <span className="text-emerald-600 font-medium">
                      {e.entryType || "OCR"}
                    </span>
                  </div>
                ))}

                {todayEntries.length === 0 && (
                  <p className="text-gray-400 py-2">No entries today</p>
                )}
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-white border border-emerald-100 rounded-lg p-5">
              <h3 className="text-emerald-700 font-semibold mb-3">
                Performance Metrics
              </h3>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-emerald-600 mb-1">Today's entries</p>
                  <p className="font-semibold text-emerald-800 text-lg">
                    {todayEntries.length}
                  </p>
                  <p className="text-gray-400 text-xs">+5 vs target</p>
                </div>
                <div>
                  <p className="text-emerald-600 mb-1">Avg processing time</p>
                  <p className="font-semibold text-emerald-800 text-lg">
  {getStaffAvgTime(staff._id)}
</p>
                  <p className="text-gray-400 text-xs">Within target (20s)</p>
                </div>
                <div>
                  <p className="text-emerald-600 mb-1">Last 7 days entries</p>
                  <p className="font-semibold text-emerald-800 text-lg">
                    {getLast7DaysEntries(staff._id).length}
                  </p>
                  <p className="text-gray-400 text-xs">Stable vs last week</p>
                </div>
                <div>
                 
                  <p className="text-gray-400 text-xs">No open items</p>
                </div>
              </div>
            </div>

            {/* Supervisor Note */}
            <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4 text-sm text-emerald-700">
              <p className="font-semibold text-emerald-800 mb-2">
                Supervisor–Guard Relationship
              </p>
              <p>
                This guard member is assigned to one of your managed bays. and
                reports exclusively to you. Performance reviews and schedules
                are managed at supervisor level.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-emerald-100 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  const getStaffAvgTime = (staffId) => {
  const staffEntries = getStaffEntries(staffId).filter(
    (e) => e.processingTimeMs > 1000
  );

  if (staffEntries.length === 0) return "N/A";

  const avgMs =
    staffEntries.reduce((sum, e) => sum + e.processingTimeMs, 0) /
    staffEntries.length;

  const avgSec = Math.round(avgMs / 1000);
  return avgSec < 60
    ? `${avgSec}s`
    : `${Math.floor(avgSec / 60)}m ${avgSec % 60}s`;
};

  const getStaffEntryCount = (staff) => {
    return entries.filter((entry) => {
      if (!entry.createdBy || !entry.bayId) return false;

      const createdById =
        typeof entry.createdBy === "object"
          ? entry.createdBy._id
          : entry.createdBy;

      const entryBayId =
        typeof entry.bayId === "object" ? entry.bayId._id : entry.bayId;

      return (
        String(createdById) === String(staff._id) &&
        String(entryBayId) === String(staff.assignedBay?._id)
      );
    }).length;
  };

  const getStaffEntries = (staffId) => {
    return entries.filter((entry) => {
      if (!entry.createdBy) return false;

      if (typeof entry.createdBy === "object") {
        return String(entry.createdBy._id) === String(staffId);
      }

      return String(entry.createdBy) === String(staffId);
    });
  };

  const getTodayEntries = (staff) => {
    const today = new Date().toDateString();

    return entries.filter((entry) => {
      if (!entry.createdBy || !entry.bayId || !entry.createdAt) return false;

      const createdById =
        typeof entry.createdBy === "object"
          ? entry.createdBy._id
          : entry.createdBy;

      const entryBayId =
        typeof entry.bayId === "object" ? entry.bayId._id : entry.bayId;

      return (
        String(createdById) === String(staff._id) &&
        String(entryBayId) === String(staff.assignedBay?._id) &&
        new Date(entry.createdAt).toDateString() === today
      );
    });
  };

  const getLast7DaysEntries = (staffId) => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return getStaffEntries(staffId).filter((e) => new Date(e.createdAt) >= d);
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
              <h1 className="text-xl font-bold text-emerald-800">My guard</h1>
              <p className="text-emerald-600 text-sm">
                Monitor your assigned security guards
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAddStaff(true)}
                className="px-4 h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-2 transition font-medium text-sm"
              >
                <Plus size={16} />
                Add Guard
              </button>

              <div className="w-10 h-10 bg-emerald-600 text-white rounded-lg flex items-center justify-center font-bold">
                {supervisor?.name?.[0]}
              </div>
              <div>
                <p className="font-semibold text-emerald-800">
                  {supervisor?.name}
                </p>
                <p className="text-xs text-emerald-600">{supervisor?.role}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 md:px-8 py-4 md:py-6">
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            <StatCard
              title="Total Guards"
              value={approvedStaff.length}
              icon={<Users className="text-emerald-600" />}
            />

            <StatCard
              title="Active Guards"
              value={approvedStaff.filter((s) => s.isActive).length}
              icon={<Activity className="text-emerald-600" />}
            />

            <StatCard
              title="Today's Entries"
              value={todayEntries.length}
              icon={<TrendingUp className="text-emerald-600" />}
            />

            {/* NEW: Pending Requests Stat Card - Clickable */}
            <div
              onClick={() =>
                setViewMode(viewMode === "pending" ? "approved" : "pending")
              }
              className="cursor-pointer"
            >
              <StatCard
                title="Pending Requests"
                value={pendingStaff.length}
                icon={<Clock className="text-orange-600" />}
              />
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => setViewMode("approved")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                viewMode === "approved"
                  ? "bg-emerald-600 text-white"
                  : "bg-white text-emerald-600 border border-emerald-200"
              }`}
            >
              All Guards ({approvedStaff.length})
            </button>

            <button
              onClick={() => setViewMode("pending")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                viewMode === "pending"
                  ? "bg-orange-600 text-white"
                  : "bg-white text-orange-600 border border-orange-200"
              }`}
            >
              Pending Requests ({pendingStaff.length})
            </button>

            <button
              onClick={() => setViewMode("rejected")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                viewMode === "rejected"
                  ? "bg-red-600 text-white"
                  : "bg-white text-red-600 border border-red-200"
              }`}
            >
              Rejected Guards ({rejectedStaff.length})
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
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
        {(viewMode === "approved"
          ? [
              "Name",
              "Phone",
              "Bay",
              "Email",
              "Entries",
              "Status",
              "Action",
            ]
          : viewMode === "pending"
          ? [
              "Name",
              "Phone",
              "Bay",
              "Email",
              "Requested On",
              "Status",
            ]
          : [
              "Name",
              "Phone",
              "Bay",
              "Email",
              "Rejected On",
              "Reason",
              "Status",
            ]
        ).map((h) => (
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
          onClick={() => viewMode === "approved" && setSelectedStaff(s)}
          className={`${
            viewMode === "approved"
              ? "hover:bg-emerald-50 cursor-pointer"
              : ""
          } transition text-center`}
        >
          {/* COMMON COLUMNS */}
          <td className="px-6 py-4 font-medium text-emerald-800">
            {s.name}
          </td>
          <td className="px-6 py-4">{s.phone}</td>
          <td className="px-6 py-4">{s.assignedBay?.bayName}</td>
          <td className="px-6 py-4">{s.email}</td>

          {/* APPROVED STAFF */}
          {viewMode === "approved" && (
            <>
              <td className="px-6 py-4">{getStaffEntryCount(s)}</td>
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
              <td className="px-6 py-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleStaffStatus(s._id, s.isActive);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                    s.isActive
                      ? "bg-red-100 text-red-700 hover:bg-red-200"
                      : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                  }`}
                >
                  {s.isActive ? "Deactivate" : "Activate"}
                </button>
              </td>
            </>
          )}

          {/* PENDING STAFF */}
          {viewMode === "pending" && (
            <>
              <td className="px-6 py-4">
                {new Date(s.createdAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                  Pending Approval
                </span>
              </td>
            </>
          )}

          {/* REJECTED STAFF */}
          {viewMode === "rejected" && (
            <>
              <td className="px-6 py-4">
                {new Date(s.updatedAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">
                {s.rejectionReason || "—"}
              </td>
              <td className="px-6 py-4">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                  Rejected
                </span>
              </td>
            </>
          )}
        </tr>
      ))}
    </tbody>
  </table>

  {filteredStaff.length === 0 && (
    <div className="text-center py-8 text-gray-500">
      No{" "}
      {viewMode === "pending"
        ? "pending requests"
        : viewMode === "rejected"
        ? "rejected guards"
        : "guards"}{" "}
      found
    </div>
  )}
</div>
  {/* Cards (Mobile) */}
<div className="md:hidden space-y-4">
  {filteredStaff.map((s) => (
    <div
      key={s._id}
      onClick={() => viewMode === "approved" && setSelectedStaff(s)}
      className="bg-white p-4 rounded-lg border border-emerald-100 shadow-sm"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="font-semibold text-emerald-800">{s.name}</p>
          <p className="text-sm text-emerald-600">
            {s.assignedBay?.bayName}
          </p>
        </div>

        {/* STATUS BADGE */}
        {viewMode === "approved" && (
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              s.isActive
                ? "bg-emerald-100 text-emerald-700"
                : "bg-red-100 text-red-600"
            }`}
          >
            {s.isActive ? "Active" : "Inactive"}
          </span>
        )}

        {viewMode === "pending" && (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
            Pending
          </span>
        )}

        {viewMode === "rejected" && (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
            Rejected
          </span>
        )}
      </div>

      {/* BODY */}
      <div className="text-sm text-gray-700 space-y-1">
        <p>
          <span className="font-medium">Phone:</span> {s.phone}
        </p>
        <p>
          <span className="font-medium">Email:</span> {s.email}
        </p>

        {viewMode === "pending" && (
          <p>
            <span className="font-medium">Requested On:</span>{" "}
            {new Date(s.createdAt).toLocaleDateString()}
          </p>
        )}

        {viewMode === "rejected" && (
          <>
            <p>
              <span className="font-medium">Rejected On:</span>{" "}
              {new Date(s.updatedAt).toLocaleDateString()}
            </p>
            <p className="text-red-700">
              <span className="font-medium">Reason:</span>{" "}
              {s.rejectionReason || "—"}
            </p>
          </>
        )}
      </div>

      {/* ACTION (APPROVED ONLY) */}
      {viewMode === "approved" && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleStaffStatus(s._id, s.isActive);
          }}
          className={`mt-3 w-full px-3 py-2 rounded-lg text-xs font-medium transition ${
            s.isActive
              ? "bg-red-100 text-red-700"
              : "bg-emerald-100 text-emerald-700"
          }`}
        >
          {s.isActive ? "Deactivate" : "Activate"}
        </button>
      )}
    </div>
  ))}

  {filteredStaff.length === 0 && (
    <div className="text-center py-8 text-gray-500">
      No{" "}
      {viewMode === "pending"
        ? "pending requests"
        : viewMode === "rejected"
        ? "rejected guards"
        : "guards"}{" "}
      found
    </div>
  )}
</div>

        </div>
      </div>

      {/* STAFF DETAILS MODAL */}
      {selectedStaff && (
        <StaffModal
          staff={selectedStaff}
          onClose={() => setSelectedStaff(null)}
        />
      )}

      {/* ADD STAFF MODAL */}
      {showAddStaff && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-xl overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-emerald-100">
              <h2 className="font-semibold text-emerald-800">Add New Guard</h2>
              <button
                onClick={() => setShowAddStaff(false)}
                className="text-emerald-600 hover:bg-emerald-50 p-2 rounded-lg transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4 text-sm max-h-[70vh] overflow-y-auto">
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
                <select
                  value={form.assignedBay}
                  onChange={(e) =>
                    setForm({ ...form, assignedBay: e.target.value })
                  }
                  className="w-full bg-white border border-emerald-200 rounded-lg px-3 py-2"
                >
                  <option value="">Select Bay</option>
                  {supervisor?.managedBays?.map((bay) => (
                    <option key={bay._id} value={bay._id}>
                      {bay.bayName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-emerald-100 flex justify-end gap-3 bg-emerald-50/40">
              <button
                onClick={() => setShowAddStaff(false)}
                className="text-emerald-600 hover:bg-emerald-100 px-4 py-2 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={saveStaff}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition font-medium"
              >
                Add Guard
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
                 ${
                   error
                     ? "border-red-500 ring-red-500"
                     : "border-emerald-200 focus:ring-emerald-500"
                 }`}
    />
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

export default MyStaff;
