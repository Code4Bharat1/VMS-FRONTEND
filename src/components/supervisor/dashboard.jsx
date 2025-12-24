"use client";
import React, { useState, useEffect } from "react";
import {
  Users,
  Building2,
  ChevronRight,
  Clock,
  TrendingUp,
} from "lucide-react";
import Sidebar from "./sidebar";

const SupervisorDashboard = () => {
  const [activeView, setActiveView] = useState("daily");
  const [supervisor, setSupervisor] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setSupervisor(JSON.parse(storedUser));
    }
  }, []);

  const staffData = [
    { name: "Ali Hassan", mobile: "+974 5540 1234", entries: 86, avgTime: "16s", status: "Active" },
    { name: "Sara Ibrahim", mobile: "+974 5540 5678", entries: 72, avgTime: "19s", status: "Active" },
    { name: "John Peter", mobile: "+974 5540 9012", entries: 64, avgTime: "21s", status: "On break" },
    { name: "Imran Khan", mobile: "+974 5540 3456", entries: 58, avgTime: "17s", status: "Active" },
    { name: "Ravi Kumar", mobile: "+974 5540 7890", entries: 42, avgTime: "20s", status: "Active" },
  ];

  const recentUpdates = [
    { time: "Today 09:20", action: "Reviewed morning entries for Bay A" },
    { time: "Today 08:45", action: "Reassigned Sara to Bay C" },
    { time: "Yesterday 18:10", action: "Closed incident review" },
    { time: "2 days ago 14:30", action: "Approved overtime for Ali" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activeItem="overview" />

      <div className="flex-1 overflow-auto">
        {/* HEADER */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
                Supervisor Panel
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Monitor your assigned security staff, bays, and activities.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-semibold">
                {(supervisor?.name || "")
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </div>
              <div>
                <h2 className="text-sm sm:text-lg font-semibold text-gray-800">
                  {supervisor?.name || "Supervisor"}
                </h2>
                <p className="text-gray-500 text-xs sm:text-sm">
                  {supervisor?.role || "Supervisor"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="px-4 sm:px-8 py-6">
          {/* STATS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            {[
              { title: "Total Staff Assigned", value: "12", icon: Users, desc: "Across your bays A, B, C" },
              { title: "Today's Entries", value: "384", icon: TrendingUp, desc: "↑ 12% from yesterday", green: true },
              { title: "Avg Processing Time", value: "18s", icon: Clock, desc: "Target: 20s" },
              { title: "Active Bays Now", value: "3", icon: Building2, desc: "Your assigned bays" },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-lg transition"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-500 text-sm font-medium">
                    {item.title}
                  </p>
                  <item.icon className="text-emerald-600" size={20} />
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-800">
                  {item.value}
                </h3>
                <p
                  className={`text-sm mt-1 ${
                    item.green ? "text-emerald-600 font-medium" : "text-gray-400"
                  }`}
                >
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          {/* VIEW TOGGLE */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                Staff Performance
              </h2>
              <p className="text-gray-500 text-sm">
                Performance overview of staff under your supervision.
              </p>
            </div>

            <div className="flex gap-2 bg-gray-100 p-1 rounded-lg w-fit">
              {["Daily", "Weekly", "Monthly"].map((view) => (
                <button
                  key={view}
                  onClick={() => setActiveView(view.toLowerCase())}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    activeView === view.toLowerCase()
                      ? "bg-white text-emerald-700 shadow-sm"
                      : "text-gray-600"
                  }`}
                >
                  {view}
                </button>
              ))}
            </div>
          </div>

          {/* STAFF TABLE */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-8">
            <div className="overflow-x-auto">
              <table className="min-w-[700px] w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {[
                      "Staff Name",
                      "Mobile",
                      "Entries",
                      "Avg Time",
                      "Status",
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left px-6 py-4 text-sm font-semibold text-gray-600"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {staffData.map((staff, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                          {staff.name.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <span className="font-medium text-gray-800">
                          {staff.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {staff.mobile}
                      </td>
                      <td className="px-6 py-4 font-semibold">
                        {staff.entries}
                      </td>
                      <td className="px-6 py-4 font-semibold">
                        {staff.avgTime}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            staff.status === "Active"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {staff.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* RECENT UPDATES */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">
              My Recent Updates
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              Latest actions performed by you.
            </p>

            <div className="space-y-4">
              {recentUpdates.map((u, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="w-2 h-2 bg-emerald-600 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-gray-800 font-medium">{u.action}</p>
                    <p className="text-gray-500 text-sm mt-1">{u.time}</p>
                  </div>
                  <ChevronRight className="text-gray-400" size={18} />
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
