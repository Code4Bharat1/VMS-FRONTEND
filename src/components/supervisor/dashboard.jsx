"use client";
import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  Building2,
  Search,
  Settings,
  LogOut,
  ChevronRight,
  Clock,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import Sidebar from "./sidebar";

const SupervisorDashboard = () => {
  const [activeView, setActiveView] = useState("daily");
  const [supervisor, setSupervisor] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setSupervisor(JSON.parse(storedUser));
  }, []);

  const staffData = [
    { name: "Ali Hassan", mobile: "+974 5540 1234", entries: 86, avgTime: "16s", status: "Active" },
    { name: "Sara Ibrahim", mobile: "+974 5540 5678", entries: 72, avgTime: "19s", status: "Active" },
    { name: "John Peter", mobile: "+974 5540 9012", entries: 64, avgTime: "21s", status: "On break" },
    { name: "Imran Khan", mobile: "+974 5540 3456", entries: 58, avgTime: "17s", status: "Active" },
    { name: "Ravi Kumar", mobile: "+974 5540 7890", entries: 42, avgTime: "20s", status: "Active" },
  ];

  const recentUpdates = [
    { time: "Today • 09:20", action: "Reviewed morning entries for Bay A" },
    { time: "Today • 08:45", action: "Reassigned Sara to Bay C" },
    { time: "Yesterday • 18:10", action: "Closed incident review" },
    { time: "2 days ago • 14:30", action: "Approved overtime for Ali" },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeItem="overview" />

      {/* MAIN CONTENT */}
      <div className="flex-1 overflow-x-hidden overflow-y-auto">
        {/* HEADER */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Supervisor Panel</h1>
              <p className="text-gray-500 mt-1">
                Monitor your assigned security staff, bays, and supervision activities.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-semibold">
                {(supervisor?.name || "")
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  {supervisor?.name || "Supervisor"}
                </h2>
                <p className="text-gray-500 text-sm">
                  {supervisor?.role || "Supervisor"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="px-4 sm:px-8 py-6">
          {/* STATS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex justify-between mb-2">
                <p className="text-gray-500 text-sm">Total Staff Assigned</p>
                <Users className="text-emerald-600" size={20} />
              </div>
              <h3 className="text-3xl font-bold">12</h3>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex justify-between mb-2">
                <p className="text-gray-500 text-sm">Today's Entries</p>
                <TrendingUp className="text-blue-600" size={20} />
              </div>
              <h3 className="text-3xl font-bold">384</h3>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex justify-between mb-2">
                <p className="text-gray-500 text-sm">Avg Processing Time</p>
                <Clock className="text-purple-600" size={20} />
              </div>
              <h3 className="text-3xl font-bold">18s</h3>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex justify-between mb-2">
                <p className="text-gray-500 text-sm">Active Bays</p>
                <Building2 className="text-orange-600" size={20} />
              </div>
              <h3 className="text-3xl font-bold">3</h3>
            </div>
          </div>

          {/* VIEW TOGGLE */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold">Staff Performance</h2>
              <p className="text-gray-500 text-sm">
                Performance overview of staff under you.
              </p>
            </div>

            <div className="flex bg-gray-100 p-1 rounded-lg">
              {["Daily", "Weekly", "Monthly"].map((view) => (
                <button
                  key={view}
                  onClick={() => setActiveView(view.toLowerCase())}
                  className={`px-4 py-2 text-sm rounded-md ${
                    activeView === view.toLowerCase()
                      ? "bg-white text-emerald-700 shadow"
                      : "text-gray-600"
                  }`}
                >
                  {view}
                </button>
              ))}
            </div>
          </div>

          {/* TABLE */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto mb-8">
            <table className="w-full min-w-[900px]">
              <thead className="bg-green-200 border-b border-gray-300">
                <tr>
                  <th className="px-6 py-4 text-left text-sm">Staff Name</th>
                  <th className="px-6 py-4 text-left text-sm">Mobile</th>
                  <th className="px-6 py-4 text-left text-sm">Entries</th>
                  <th className="px-6 py-4 text-left text-sm">Avg Time</th>
                  <th className="px-6 py-4 text-left text-sm">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y  ">
                {staffData.map((s, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4 border-b border-gray-300">{s.name}</td>
                    <td className="px-6 py-4 border-b border-gray-300">{s.mobile}</td>
                    <td className="px-6 py-4 border-b border-gray-300">{s.entries}</td>
                    <td className="px-6 py-4 border-b border-gray-300">{s.avgTime}</td>
                    <td className="px-6 py-4 border-b border-gray-300">
                      <span
                        className={`px-3 py-1 rounded-full text-xs ${
                          s.status === "Active"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* RECENT UPDATES */}
          <div className="bg-white rounded-xl ">
            <h2 className="text-xl font-bold mb-4">My Recent Updates</h2>
            <div className="space-y-4">
              {recentUpdates.map((u, i) => (
                <div key={i} className="flex items-start gap-4 bg-gray-50 p-4 rounded-lg">
                  <div className="w-2 h-2 bg-emerald-600 rounded-full mt-2" />
                  <div className="flex-1">
                    <p className="font-medium">{u.action}</p>
                    <p className="text-sm text-gray-500">{u.time}</p>
                  </div>
                  <ChevronRight size={18} className="text-gray-400" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupervisorDashboard;
