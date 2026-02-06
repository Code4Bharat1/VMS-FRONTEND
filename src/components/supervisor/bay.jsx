"use client";
import React, { useEffect, useState } from "react";
import {
  Building2,
  Clock,
  X,
  AlertCircle,
  Activity,
  Truck,
  FileText,
} from "lucide-react";
import Sidebar from "./sidebar";

const MyBays = () => {
  const [selectedBay, setSelectedBay] = useState(null);
  const [activeView, setActiveView] = useState("today");
  const [supervisor, setSupervisor] = useState(null);
  const [baysData, setBaysData] = useState([]);
  const [staff, setStaff] = useState([]);
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setSupervisor(JSON.parse(storedUser));
  }, []);

  useEffect(() => {
    const fetchBays = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bays`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      const data = await res.json();
      setBaysData(data.bays || []);
    };
    fetchBays();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const headers = { Authorization: `Bearer ${token}` };

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/staff`, { headers })
      .then((res) => res.json())
      .then((data) => setStaff(data.staff || data.data || []));

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/entries`, { headers })
      .then((res) => res.json())
      .then((data) => setEntries(data.entries || data.data || []));
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const enrichedBays = baysData.map((bay) => {
    const bayEntries = entries.filter(
      (e) => String(e.assignedBay || e.bayId) === String(bay._id)
    );

    const todayEntries = bayEntries.filter((e) => new Date(e.inTime) >= today);

    return {
      ...bay,
      vehiclesToday: todayEntries.length,
      currentlyInside: todayEntries.filter((e) => !e.outTime).length,
      staffOnDuty: staff.filter(
        (s) => String(s.assignedBay) === String(bay._id)
      ).length,
      avgTime:
        todayEntries.length > 0
          ? `${Math.round(
              todayEntries.reduce(
                (sum, e) => sum + (e.processingTimeMs || 0),
                0
              ) /
                todayEntries.length /
                1000
            )}s`
          : "—",
      todayEntries,
    };
  });

  return (
    <div className="flex h-screen bg-emerald-50/60">
      <Sidebar activeItem="overview" />

      <div className="flex-1 overflow-auto">
        {/* HEADER */}
        <div className="sticky top-0 z-40 bg-white border-b border-emerald-100 px-4 sm:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-emerald-800">My Bays</h1>
              <p className="text-emerald-600 mt-1 text-sm">
                Monitor live bay status, traffic, and alerts.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold">
                {(supervisor?.name || "")
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-semibold text-emerald-800">
                  {supervisor?.name || "Supervisor"}
                </h2>
                <p className="text-xs text-emerald-600">
                  {supervisor?.role || "Supervisor"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="px-4 sm:px-8 py-4 sm:py-6">
          {/* STATS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
            <Stat
              title="Total Bays Assigned"
              value={baysData.length}
              icon={Building2}
              desc="Bay A, Bay B, Bay C"
            />
            <Stat
              title="Active Bays Now"
              value={baysData.filter((b) => b.status === "active").length}
              icon={Activity}
              desc="Receiving vehicles"
            />
            <Stat
              title="Avg Processing Time / Bay"
              value="18s"
              icon={Clock}
              desc="Target: 20s"
            />
          </div>

          {/* VIEW TOGGLE */}
          <div className="flex justify-center sm:justify-start mb-6">
            <div className="flex gap-2 bg-white border border-emerald-100 p-1 rounded-lg">
              {["Today", "This week", "This month"].map((view) => {
                const key = view.toLowerCase().replace(" ", "-");
                return (
                  <button
                    key={view}
                    onClick={() => setActiveView(key)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      activeView === key
                        ? "bg-emerald-100 text-emerald-700"
                        : "text-emerald-600 hover:bg-emerald-50"
                    }`}
                  >
                    {view}
                  </button>
                );
              })}
            </div>
          </div>

          {/* BAY CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {enrichedBays.map((bay) => (
              <div
                key={bay._id}
                onClick={() => setSelectedBay(bay)}
                className="bg-white rounded-xl border border-emerald-100 hover:border-emerald-400 hover:shadow-lg transition-all cursor-pointer"
              >
                <div className="p-6">
                  <div className="flex justify-between mb-4">
                    <h3 className="text-lg font-bold text-emerald-800">
                      {bay.bayName}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        bay.status === "Free"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {bay.status}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <Info label="Vehicles today" value={bay.vehiclesToday} />
                    <Info label="Avg time" value={bay.avgTime} />
                    <Info
                      label="Currently inside"
                      value={bay.currentlyInside}
                    />
                    <Info label="Staff on duty" value={bay.staffOnDuty} />
                  </div>
                </div>

                <div className="bg-emerald-50 px-6 py-4 border-t border-emerald-100 text-center text-sm text-emerald-600 font-medium">
                  Tap to view full details →
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MODAL */}
        {selectedBay && (
          <BayModal
            bay={selectedBay}
            entries={entries}
            staff={staff}
            enrichedBays={enrichedBays}
            onClose={() => setSelectedBay(null)}
          />
        )}
      </div>
    </div>
  );
};

/* ---------- SMALL COMPONENTS ---------- */

const Stat = ({ title, value, icon: Icon, desc }) => (
  <div className="bg-white rounded-xl border border-emerald-100 p-4 sm:p-6 shadow-sm hover:shadow transition">
    <div className="flex justify-between mb-2">
      <p className="text-emerald-600 text-sm font-medium">{title}</p>
      <Icon size={20} className="text-emerald-600" />
    </div>
    <h3 className="text-2xl sm:text-3xl font-bold text-emerald-800">
      {value}
    </h3>
    <p className="text-emerald-500 text-sm mt-1">{desc}</p>
  </div>
);

const Info = ({ label, value }) => (
  <div className="flex justify-between">
    <span className="text-emerald-600">{label}:</span>
    <span className="font-semibold text-emerald-800">{value}</span>
  </div>
);

const BayModal = ({ bay, entries, staff, enrichedBays, onClose }) => {
  if (!bay) return null;

  // Find the enriched bay data
  const enrichedBay = enrichedBays.find(b => b._id === bay._id) || bay;

  // Filter entries for this bay
  const bayEntries = entries.filter(
    (e) => String(e.assignedBay || e.bayId || e.bay) === String(bay._id)
  );

  // Get today's entries
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayEntries = bayEntries
    .filter((e) => {
      const entryDate = new Date(e.inTime || e.entryTime || e.createdAt);
      return entryDate >= today;
    })
    .sort((a, b) => {
      const dateA = new Date(a.inTime || a.entryTime || a.createdAt);
      const dateB = new Date(b.inTime || b.entryTime || b.createdAt);
      return dateB - dateA;
    });

  const recentEntries = todayEntries.slice(0, 20);

  console.log('Bay ID:', bay._id);
  console.log('Total entries:', entries.length);
  console.log('Bay entries:', bayEntries.length);
  console.log('Today entries:', todayEntries.length);
  console.log('Sample entry:', entries[0]);

  // Get recent vehicles (unique VRNs from today that are still inside)
  const recentVehicles = todayEntries
    .filter((e) => !e.outTime && !e.exitTime && !e.out)
    .map((e) => ({
      vrn: e.vrn || e.vehicleNumber || e.vehicleNo || e.vehicle || "N/A",
      company: e.company || e.companyName || e.supplier || "Unknown",
      time: formatTime(e.inTime || e.entryTime || e.createdAt),
      direction: e.direction || "Entry",
    }))
    .slice(0, 3);

  console.log('Recent vehicles:', recentVehicles);

  // Generate alerts based on real data
  const alerts = [];
  
  // Check for vehicles inside too long (>23 minutes)
  todayEntries.forEach((entry) => {
    if (!entry.outTime && !entry.exitTime && !entry.out) {
      const inTime = new Date(entry.inTime || entry.entryTime || entry.createdAt);
      const now = new Date();
      const minutesInside = Math.floor((now - inTime) / 60000);
      
      if (minutesInside > 23) {
        alerts.push({
          type: "reminder",
          message: `Vehicle ${entry.vrn || entry.vehicleNumber || entry.vehicleNo || "Unknown"} inside for >${minutesInside} min, verify unloading status.`,
        });
      }
    }
  });

  // Add supervisor confirmation alerts for specific companies
  const companiesNeedingConfirmation = ["Alpha Logistics", "FreshFoods", "Metro Supplies"];
  todayEntries.forEach((entry) => {
    if (
      (!entry.outTime && !entry.exitTime && !entry.out) &&
      companiesNeedingConfirmation.some((c) =>
        (entry.company || entry.companyName || entry.supplier || "").includes(c)
      )
    ) {
      alerts.push({
        type: "notice",
        message: `Confirm handover with ${entry.company || entry.companyName || entry.supplier} supervisor.`,
      });
    }
  });

  // Limit to 3 most recent alerts
  const displayAlerts = alerts.slice(0, 3);

  function formatTime(dateString) {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-6xl rounded-xl shadow-xl max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-emerald-100 px-6 py-4 flex justify-between items-center z-10">
          <div>
            <h2 className="text-2xl font-bold text-emerald-800">
              {bay.bayName}
            </h2>
            <p className="text-sm text-emerald-600">
              Live status and recent activity for this bay
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-600 hover:bg-emerald-50 p-2 rounded-lg transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT COLUMN - 2/3 width */}
            <div className="lg:col-span-2 space-y-6">
              {/* Status Card */}
              <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-emerald-700 font-medium">
                    Current Status:
                  </span>
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-medium ${
                      bay.status === "Free" || bay.status === "free"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {bay.status}
                  </span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white border border-emerald-100 rounded-lg p-4">
                  <p className="text-xs text-emerald-600 mb-1">
                    Vehicles Today
                  </p>
                  <p className="text-2xl font-bold text-emerald-800">
                    {enrichedBay.vehiclesToday || todayEntries.length || 0}
                  </p>
                </div>
                <div className="bg-white border border-emerald-100 rounded-lg p-4">
                  <p className="text-xs text-emerald-600 mb-1">Average Time</p>
                  <p className="text-2xl font-bold text-emerald-800">
                    {enrichedBay.avgTime || "—"}
                  </p>
                </div>
                <div className="bg-white border border-emerald-100 rounded-lg p-4">
                  <p className="text-xs text-emerald-600 mb-1">
                    Currently Inside
                  </p>
                  <p className="text-2xl font-bold text-emerald-800">
                    {enrichedBay.currentlyInside || todayEntries.filter(e => !e.outTime && !e.exitTime).length || 0}
                  </p>
                </div>
                <div className="bg-white border border-emerald-100 rounded-lg p-4">
                  <p className="text-xs text-emerald-600 mb-1">
                    Staff on Duty
                  </p>
                  <p className="text-2xl font-bold text-emerald-800">
                    {enrichedBay.staffOnDuty || staff.filter(s => String(s.assignedBay) === String(bay._id)).length || 0}
                  </p>
                </div>
              </div>

              {/* Recent Activity Table */}
              <div className="bg-white border border-emerald-100 rounded-lg">
                <div className="px-4 py-3 border-b border-emerald-100">
                  <h3 className="font-semibold text-emerald-800">
                    Recent Activity
                  </h3>
                  <p className="text-xs text-emerald-600">
                    Latest entries and exits for {bay.bayName}. Ordered by time.
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-emerald-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-emerald-700 font-medium">
                          Time
                        </th>
                        <th className="px-4 py-3 text-left text-emerald-700 font-medium">
                          Bay
                        </th>
                        <th className="px-4 py-3 text-left text-emerald-700 font-medium">
                          VRN
                        </th>
                        <th className="px-4 py-3 text-left text-emerald-700 font-medium">
                          Company
                        </th>
                        <th className="px-4 py-3 text-left text-emerald-700 font-medium">
                          Handled By
                        </th>
                        <th className="px-4 py-3 text-left text-emerald-700 font-medium">
                          Direction
                        </th>
                        <th className="px-4 py-3 text-left text-emerald-700 font-medium">
                          Method
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentEntries.length > 0 ? (
                        recentEntries.map((entry, idx) => (
                          <tr
                            key={entry._id}
                            className={`border-b border-emerald-50 ${
                              idx % 2 === 0 ? "bg-white" : "bg-emerald-50/30"
                            }`}
                          >
                            <td className="px-4 py-3 text-emerald-800">
                              {formatTime(entry.inTime || entry.entryTime || entry.createdAt)}
                            </td>
                            <td className="px-4 py-3 text-emerald-800">
                              {bay.bayName}
                            </td>
                            <td className="px-4 py-3 text-emerald-800 font-medium">
                              {entry.vrn || entry.vehicleNumber || entry.vehicleNo || entry.vehicle || "N/A"}
                            </td>
                            <td className="px-4 py-3 text-emerald-800">
                              {entry.company || entry.companyName || entry.supplier || "Unknown"}
                            </td>
                            <td className="px-4 py-3 text-emerald-800">
                              {entry.handledBy || entry.staffName || entry.staff?.name || "N/A"}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`px-2 py-1 rounded text-xs font-medium ${
                                  (entry.outTime || entry.exitTime || entry.out)
                                    ? "bg-purple-100 text-purple-700"
                                    : "bg-blue-100 text-blue-700"
                                }`}
                              >
                                {entry.direction || ((entry.outTime || entry.exitTime || entry.out) ? "Exit" : "Entry")}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-emerald-800">
                              {entry.method || entry.detectionMethod || entry.scanType || "Manual"}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="7"
                            className="px-4 py-8 text-center text-emerald-600"
                          >
                            No recent activity
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="px-4 py-3 border-t border-emerald-100 text-xs text-emerald-600 text-center">
                  Showing last {recentEntries.length} records
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN - 1/3 width */}
            <div className="space-y-6">
              {/* Bay Activity Timeline */}
              <div className="bg-white border border-emerald-100 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Clock size={18} className="text-emerald-600" />
                  <h3 className="font-semibold text-emerald-800">
                    Bay Activity Timeline (Today)
                  </h3>
                </div>
                <div className="space-y-3">
                  {todayEntries.slice(0, 4).map((entry) => (
                    <div
                      key={entry._id}
                      className="flex items-start gap-3 pb-3 border-b border-emerald-100 last:border-0"
                    >
                      <div className="w-2 h-2 rounded-full bg-emerald-600 mt-1.5 flex-shrink-0"></div>
                      <div className="flex-1 text-sm">
                        <p className="font-medium text-emerald-800">
                          {formatTime(entry.inTime || entry.entryTime || entry.createdAt)}{" "}
                          {(entry.outTime || entry.exitTime || entry.out) ? "Exit" : "Entry"}
                        </p>
                        <p className="text-emerald-600 text-xs">
                          {entry.vehicleType || entry.type || ((entry.outTime || entry.exitTime) ? "Truck" : "Van")}{" "}
                          | {entry.method || entry.detectionMethod || entry.scanType || "Manual"}
                        </p>
                      </div>
                    </div>
                  ))}
                  {todayEntries.length === 0 && (
                    <p className="text-emerald-600 text-sm">No activity today</p>
                  )}
                </div>
              </div>

              {/* Recent Vehicles Linked */}
              <div className="bg-white border border-emerald-100 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Truck size={18} className="text-emerald-600" />
                  <h3 className="font-semibold text-emerald-800">
                    Recent Vehicles Linked
                  </h3>
                </div>
                <div className="space-y-3">
                  {recentVehicles.length > 0 ? (
                    recentVehicles.map((vehicle, idx) => (
                      <div
                        key={idx}
                        className="pb-3 border-b border-emerald-100 last:border-0"
                      >
                        <p className="font-medium text-emerald-800 text-sm">
                          {vehicle.vrn}
                        </p>
                        <p className="text-emerald-600 text-xs">
                          {vehicle.company}
                        </p>
                        <p className="text-emerald-500 text-xs mt-1">
                          {vehicle.time} {vehicle.direction}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-emerald-600 text-sm">
                      No vehicles currently inside
                    </p>
                  )}
                </div>
              </div>

              {/* Bay Alerts */}
              <div className="bg-white border border-emerald-100 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle size={18} className="text-orange-600" />
                  <h3 className="font-semibold text-emerald-800">
                    Bay Alerts
                  </h3>
                </div>
                <div className="space-y-3">
                  {displayAlerts.length > 0 ? (
                    displayAlerts.map((alert, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg text-sm ${
                          alert.type === "reminder"
                            ? "bg-orange-50 border border-orange-200"
                            : "bg-blue-50 border border-blue-200"
                        }`}
                      >
                        <span
                          className={`font-medium text-xs px-2 py-1 rounded ${
                            alert.type === "reminder"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {alert.type === "reminder" ? "Reminder" : "Notice"}
                        </span>
                        <p className="mt-2 text-emerald-800">
                          {alert.message}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-emerald-600 text-sm">No alerts at this time</p>
                  )}
                  <p className="text-emerald-500 text-xs mt-3">
                    Alerts help you follow up on slow movements. Only
                    supervisors and staff see these, they do not change
                    system-level rules.
                  </p>
                </div>
              </div>

              {/* Manual Notes & Overrides */}
              <div className="bg-white border border-emerald-100 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <FileText size={18} className="text-emerald-600" />
                  <h3 className="font-semibold text-emerald-800">
                    Manual Notes & Overrides
                  </h3>
                </div>
                <p className="text-sm text-emerald-600 mb-3">
                  Use an override only when procedures need a supervisor
                  decision (for example, holding a vehicle overnight).
                  System-level rules remain untouched (as controlled by admin).
                </p>
                <div className="space-y-2">
                  <button className="w-full px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium transition">
                    Manual override for this bay
                  </button>
                  <button className="w-full px-4 py-2 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg text-sm font-medium transition">
                    Request override
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-emerald-100 flex justify-end gap-3">
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

export default MyBays;