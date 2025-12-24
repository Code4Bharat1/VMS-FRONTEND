"use client";
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

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setSupervisor(JSON.parse(storedUser));
  }, []);

  useEffect(() => {
    fetchStaff();
  }, []);

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

  const filteredStaff = staffData.filter((staff) => {
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
        <div className="bg-white w-full md:max-w-5xl h-full md:h-auto md:max-h-[90vh] overflow-auto md:rounded-2xl">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b px-4 md:px-8 py-4 md:py-6 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                {staff.name?.[0]}
              </div>
              <div>
                <h2 className="text-lg md:text-2xl font-bold">{staff.name}</h2>
                <p className="text-gray-500 text-sm">
                  {staff.role} • {staff.assignedBay?.bayName || "—"}
                </p>
              </div>
            </div>
            <button onClick={onClose}>
              <X />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 md:p-8 space-y-8">
            {/* Contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-xl p-4">
                <Phone className="mb-2 text-blue-600" />
                <p className="font-semibold">{staff.mobile || "N/A"}</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-4">
                <MapPin className="mb-2 text-purple-600" />
                <p className="font-semibold">
                  {staff.assignedBay?.bayName || "Not Assigned"}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                ["Status", staff.isActive ? "Active" : "Inactive"],
                ["Today", staff.todayEntries || 0],
                ["Avg", staff.avgTime || "-"],
                ["7 Days", staff.last7Days || 0],
              ].map(([label, value], i) => (
                <div key={i} className="border rounded-xl p-4 text-center">
                  <p className="text-sm text-gray-500">{label}</p>
                  <p className="font-bold text-lg">{value}</p>
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
                <div key={i} className="bg-gray-50 rounded-xl p-4">
                  <div className="flex justify-between mb-2">
                    <span className="font-semibold">{label}</span>
                    <CheckCircle className="text-emerald-600" size={18} />
                  </div>
                  <p className="text-2xl font-bold">{value ?? 0}%</p>
                </div>
              ))}
            </div>

            {/* Incidents */}
            {staff.incidents > 0 && (
              <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="text-orange-600" />
                  <h3 className="font-semibold">Incidents</h3>
                </div>
                <p>{staff.incidents} incident(s) logged</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  /* ---------------- PAGE ---------------- */
  return (
    <div className="flex min-h-[100dvh] bg-gray-50">
      <Sidebar />

      <div className="flex-1 overflow-y-auto overscroll-contain">
        {/* Header */}
        <div className="bg-white shadow-md px-4 md:px-8 py-4 md:py-6">
          <div className="flex flex-col sm:flex-row gap-4 sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold">My Staff</h1>
              <p className="text-gray-500 text-sm">
                Monitor your assigned security staff
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold">
                {supervisor?.name?.[0]}
              </div>
              <div>
                <p className="font-semibold">{supervisor?.name}</p>
                <p className="text-xs text-gray-500">{supervisor?.role}</p>
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
              value={staffData.length}
              icon={<Users />}
            />
            <StatCard
              title="Active Staff"
              value={staffData.filter((s) => s.isActive).length}
              icon={<Activity />}
            />
            <StatCard
              title="Today's Entries"
              value="384"
              icon={<TrendingUp />}
            />
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
              {["Today", "This week", "This month"].map((v) => (
                <button
                  key={v}
                  onClick={() =>
                    setActiveView(v.toLowerCase().replace(" ", "-"))
                  }
                  className={`px-4 py-2 rounded-md text-sm ${
                    activeView === v.toLowerCase().replace(" ", "-")
                      ? "bg-white text-emerald-700 shadow"
                      : "text-gray-600"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:ml-auto">
              <div className="relative w-full sm:w-64">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search name or phone"
                  className="pl-10 pr-4 py-2 border rounded-lg w-full focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <select
                value={filterBay}
                onChange={(e) => setFilterBay(e.target.value)}
                className="border rounded-lg px-3 py-2"
              >
                <option value="all">All Bays</option>
                <option value="Bay A">Bay A</option>
                <option value="Bay B">Bay B</option>
                <option value="Bay C">Bay C</option>
              </select>
            </div>
          </div>

          {/* Table (Desktop) */}
          <div className="hidden md:block bg-white rounded-xl shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 shadow-sm">
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
                      className="px-6 py-3 text-left text-sm text-gray-600"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredStaff.map((s) => (
                  <tr
                    key={s._id}
                    onClick={() => setSelectedStaff(s)}
                    className="hover:bg-emerald-50 cursor-pointer"
                  >
                    <td className="px-6 py-4 font-semibold">{s.name}</td>
                    <td className="px-6 py-4">{s.phone}</td>
                    <td className="px-6 py-4">{s.assignedBay?.bayName}</td>
                    <td className="px-6 py-4">{s.email}</td>
                    <td className="px-6 py-4">{s.todaysEntry}</td>
                    <td className="px-6 py-4">{s.avgTime}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs">
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
                className="bg-white p-4 rounded-xl border shadow-sm"
              >
                <p className="font-semibold">{s.name}</p>
                <p className="text-sm text-gray-500">{s.role}</p>
                <div className="mt-2 text-sm">
                  Bay: {s.assignedBay?.bayName}
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
    </div>
  );
};

/* ------------ SMALL COMPONENT ------------ */
const StatCard = ({ title, value, icon }) => (
  <div className="bg-white p-4 md:p-6 shadow-sm shadow-green rounded-xl hover:shadow">
    <div className="flex justify-between items-center mb-2">
      <p className="text-sm text-gray-500">{title}</p>
      {icon}
    </div>
    <p className="text-3xl font-bold">{value}</p>
  </div>
);

export default MyStaff;
