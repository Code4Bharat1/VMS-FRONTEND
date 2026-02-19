"use client";
import React, { useEffect, useState } from "react";
import {
  Building2,
  Clock,
  X,
  AlertCircle,
  Activity,
  Truck,
  Lock,
} from "lucide-react";
import Sidebar from "./sidebar";

const getEntryTime = (e) => {
  return e.inTime || e.entryTime || e.createdAt;
};

const MyBays = () => {
  const [selectedBay, setSelectedBay] = useState(null);
  const [activeView, setActiveView] = useState("today");
  const [supervisor, setSupervisor] = useState(null);
  const [baysData, setBaysData] = useState([]);
  const [staff, setStaff] = useState([]);
  const [entries, setEntries] = useState([]);
  const [activePage, setActivePage] = useState("overview");

  /* Error Modal State */
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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

  /* CHECK IF BAY IS ASSIGNED TO LOGGED IN SUPERVISOR */
  const isBayAssignedToUser = (bayId) => {
    if (!supervisor) {
      console.log("No supervisor");
      return false;
    }

    console.log("Checking bay:", bayId);
    console.log("Supervisor data:", supervisor);

    // Check managedBays array (for supervisors managing multiple bays)
    if (supervisor.managedBays && Array.isArray(supervisor.managedBays)) {
      const result = supervisor.managedBays.some((bay) => {
        const managedBayId = typeof bay === "object" ? bay._id : bay;
        return String(bayId) === String(managedBayId);
      });
      console.log("ManagedBays check result:", result);
      if (result) return true;
    }

    // Check assignedBay (single bay assignment)
    if (!supervisor.assignedBay) {
      console.log("No assignedBay");
      return false;
    }

    // Handle array of bay objects
    if (Array.isArray(supervisor.assignedBay)) {
      const result = supervisor.assignedBay.some((bay) => {
        const assignedBayId = typeof bay === "object" ? bay._id : bay;
        return String(bayId) === String(assignedBayId);
      });
      console.log("Array check result:", result);
      return result;
    }

    // Handle single bay object
    if (
      typeof supervisor.assignedBay === "object" &&
      supervisor.assignedBay._id
    ) {
      const result = String(bayId) === String(supervisor.assignedBay._id);
      console.log("Single object check result:", result);
      return result;
    }

    // Handle string (could be single bay or comma-separated list)
    const assignedBayString = String(supervisor.assignedBay);
    console.log("Assigned bay string:", assignedBayString);

    // Check if it's a comma-separated list of bay names
    if (assignedBayString.includes(",")) {
      const assignedBayNames = assignedBayString
        .split(",")
        .map((b) => b.trim());
      console.log("Assigned bay names:", assignedBayNames);

      const currentBay = baysData.find((b) => String(b._id) === String(bayId));
      console.log("Current bay:", currentBay);

      if (!currentBay) {
        console.log("Bay not found in baysData");
        return false;
      }

      const result = assignedBayNames.includes(currentBay.bayName);
      console.log(
        `Does ${currentBay.bayName} exist in assigned names?`,
        result,
      );
      return result;
    }

    // Direct comparison for single bay ID or name
    const currentBay = baysData.find((b) => String(b._id) === String(bayId));
    const result =
      String(bayId) === assignedBayString ||
      (currentBay && currentBay.bayName === assignedBayString);
    console.log("Direct comparison result:", result);
    return result;
  };

  /* HANDLE BAY CLICK */
  const handleBayClick = (bay) => {
    if (isBayAssignedToUser(bay._id)) {
      setSelectedBay(bay);
    } else {
      setErrorMessage(
        `You don't have access to Bay ${bay.bayName}. This bay is not assigned to you.`,
      );
      setShowErrorModal(true);
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const enrichedBays = baysData.map((bay) => {
    const bayEntries = entries.filter((e) => {
      const entryBayId =
        typeof e.bayId === "object" ? e.bayId._id : e.bayId || e.assignedBay;

      return String(entryBayId) === String(bay._id);
    });

    const todayEntries = bayEntries.filter(
      (e) => new Date(getEntryTime(e)) >= today,
    );

    return {
      ...bay,
      vehiclesToday: todayEntries.length,
      currentlyInside: todayEntries.filter((e) => !e.outTime).length,
      // FIXED - excludes rejected and pending staff
      staffOnDuty: staff.filter((s) => {
        const staffBayId =
          typeof s.assignedBay === "object" ? s.assignedBay._id : s.assignedBay;

        return (
          String(staffBayId) === String(bay._id) &&
          s.approvalStatus !== "rejected" &&
          s.approvalStatus !== "pending"
        );
      }).length,
      avgTime:
        todayEntries.length > 0
          ? `${Math.round(
              todayEntries.reduce(
                (sum, e) => sum + (e.processingTimeMs || 0),
                0,
              ) /
                todayEntries.length /
                1000,
            )}s`
          : "—",
      todayEntries,
    };
  });

  return (
    <div className="flex h-screen bg-emerald-50/60">
      <Sidebar activePage={activePage} onPageChange={setActivePage} />

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
              desc="Available Bays"
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
          {/* BAY CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {enrichedBays.map((bay) => {
              const isAssigned = isBayAssignedToUser(bay._id);

              return (
                <div
                  key={bay._id}
                  onClick={() => handleBayClick(bay)}
                  className={`bg-white rounded-xl border border-emerald-100 hover:border-emerald-400 hover:shadow-lg transition-all cursor-pointer relative ${
                    !isAssigned ? "opacity-75" : ""
                  }`}
                >
                  {/* Lock Icon for Unassigned Bays */}
                  {!isAssigned && (
                    <div className="absolute top-4 right-4">
                      <Lock className="text-gray-400" size={18} />
                    </div>
                  )}

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

                  <div
                    className={`px-6 py-4 border-t border-emerald-100 text-center text-sm font-medium ${
                      !isAssigned
                        ? "bg-gray-50 text-gray-500 flex items-center justify-center gap-2"
                        : "bg-emerald-50 text-emerald-600"
                    }`}
                  >
                    {!isAssigned ? (
                      <>
                        <Lock size={14} />
                        Not assigned to you
                      </>
                    ) : (
                      "Tap to view full details →"
                    )}
                  </div>
                </div>
              );
            })}
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

        {/* ERROR MODAL */}
        {showErrorModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
              {/* Error Header */}
              <div className="bg-gradient-to-r from-red-500 to-orange-500 px-4 sm:px-6 py-4 sm:py-5">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Lock className="text-white" size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-white">
                      Access Denied
                    </h3>
                    <p className="text-white/90 text-xs sm:text-sm mt-0.5">
                      Bay not assigned to you
                    </p>
                  </div>
                </div>
              </div>

              {/* Error Body */}
              <div className="p-4 sm:p-6">
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
                  <div className="flex gap-2 sm:gap-3">
                    <AlertCircle
                      className="text-red-500 flex-shrink-0 mt-0.5"
                      size={18}
                    />
                    <div>
                      <p className="text-xs sm:text-sm text-red-900 font-medium">
                        {errorMessage}
                      </p>
                      <p className="text-[10px] sm:text-xs text-red-700 mt-1.5 sm:mt-2">
                        Please contact your administrator if you believe this is
                        an error.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowErrorModal(false)}
                  className="w-full px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl text-sm sm:text-base font-medium hover:shadow-lg transition-all"
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
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
    <h3 className="text-2xl sm:text-3xl font-bold text-emerald-800">{value}</h3>
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
  const enrichedBay = enrichedBays.find((b) => b._id === bay._id) || bay;

  // Filter entries for this bay
  const bayEntries = entries.filter((e) => {
    const entryBayId =
      typeof e.bayId === "object"
        ? e.bayId._id
        : e.bayId || e.assignedBay || e.bay;

    return String(entryBayId) === String(bay._id);
  });

  // Get today's entries
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayEntries = bayEntries
    .filter((e) => {
      const entryDate = new Date(getEntryTime(e));
      return entryDate >= today;
    })
    .sort((a, b) => {
      const dateA = new Date(a.inTime || a.entryTime || a.createdAt);
      const dateB = new Date(b.inTime || b.entryTime || b.createdAt);
      return dateB - dateA;
    });

  const recentEntries = todayEntries.slice(0, 20);

  // Get recent vehicles (unique VRNs from today that are still inside)
  const recentVehicles = todayEntries
    .filter((e) => !e.outTime && !e.exitTime && !e.out)
    .map((e) => ({
      vrn: e.vehicleNumber || "—",
      company: e.visitorCompany || "—",
      time: formatTime(e.inTime || e.entryTime || e.createdAt),
      direction: "Entry",
    }))
    .slice(0, 3);

  // Generate alerts based on real data
  const alerts = [];

  // Check for vehicles inside too long (>23 minutes)
  todayEntries.forEach((entry) => {
    if (!entry.outTime && !entry.exitTime && !entry.out) {
      const inTime = new Date(
        entry.inTime || entry.entryTime || entry.createdAt,
      );
      const now = new Date();
      const minutesInside = Math.floor((now - inTime) / 60000);

      if (minutesInside > 23) {
        alerts.push({
          type: "reminder",
          message: `Vehicle ${entry.vehicleNumber || "Unknown"} inside for >${minutesInside} min, verify unloading status.`,
        });
      }
    }
  });

  // Add supervisor confirmation alerts for specific companies
  const companiesNeedingConfirmation = [
    "Alpha Logistics",
    "FreshFoods",
    "Metro Supplies",
  ];
  todayEntries.forEach((entry) => {
    if (
      !entry.outTime &&
      !entry.exitTime &&
      !entry.out &&
      companiesNeedingConfirmation.some((c) =>
        (entry.visitorCompany || "").includes(c),
      )
    ) {
      alerts.push({
        type: "notice",
        message: `Confirm handover with ${entry.visitorCompany} supervisor.`,
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
        <div className="sticky top-0 bg-white border-b border-emerald-100 px-4 sm:px-6 py-4 flex justify-between items-center z-10">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-emerald-800">
              {bay.bayName}
            </h2>
            <p className="text-xs sm:text-sm text-emerald-600">
              Live status and recent activity for this bay
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-600 hover:bg-emerald-50 p-2 rounded-lg transition"
          >
            <X size={20} className="sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* LEFT COLUMN - 2/3 width */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              {/* Status Card */}
              <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 sm:p-4">
                <div className="flex justify-between items-center">
                  <span className="text-emerald-700 text-sm sm:text-base font-medium">
                    Current Status:
                  </span>
                  <span
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium ${
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
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-white border border-emerald-100 rounded-lg p-3 sm:p-4">
                  <p className="text-[10px] sm:text-xs text-emerald-600 mb-1">
                    Vehicles Today
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-emerald-800">
                    {enrichedBay.vehiclesToday || todayEntries.length || 0}
                  </p>
                </div>
                <div className="bg-white border border-emerald-100 rounded-lg p-3 sm:p-4">
                  <p className="text-[10px] sm:text-xs text-emerald-600 mb-1">
                    Average Time
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-emerald-800">
                    {enrichedBay.avgTime || "—"}
                  </p>
                </div>
                <div className="bg-white border border-emerald-100 rounded-lg p-3 sm:p-4">
                  <p className="text-[10px] sm:text-xs text-emerald-600 mb-1">
                    Currently Inside
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-emerald-800">
                    {enrichedBay.currentlyInside ||
                      todayEntries.filter((e) => !e.outTime && !e.exitTime)
                        .length ||
                      0}
                  </p>
                </div>
                <div className="bg-white border border-emerald-100 rounded-lg p-3 sm:p-4">
                  <p className="text-[10px] sm:text-xs text-emerald-600 mb-1">
                    Staff on Duty
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-emerald-800">
                    {enrichedBay.staffOnDuty ||
                      staff.filter(
                        (s) =>
                          String(s.assignedBay) === String(bay._id) &&
                          s.approvalStatus !== "rejected" &&
                          s.approvalStatus !== "pending",
                      ).length ||
                      0}
                  </p>
                </div>
              </div>

              {/* Recent Activity Table */}
              <div className="bg-white border border-emerald-100 rounded-lg">
                <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-emerald-100">
                  <h3 className="text-sm sm:text-base font-semibold text-emerald-800">
                    Recent Activity
                  </h3>
                  <p className="text-[10px] sm:text-xs text-emerald-600">
                    Latest entries and exits for {bay.bayName}. Ordered by time.
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs sm:text-sm">
                    <thead className="bg-emerald-50">
                      <tr>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-emerald-700 font-medium whitespace-nowrap">
                          Time
                        </th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-emerald-700 font-medium whitespace-nowrap">
                          Bay
                        </th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-emerald-700 font-medium whitespace-nowrap">
                          VRN
                        </th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-emerald-700 font-medium whitespace-nowrap">
                          Visitor Name
                        </th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-emerald-700 font-medium whitespace-nowrap">
                          Company
                        </th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-emerald-700 font-medium whitespace-nowrap">
                          Handled By
                        </th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-emerald-700 font-medium whitespace-nowrap">
                          Direction
                        </th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-emerald-700 font-medium whitespace-nowrap">
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
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-emerald-800 whitespace-nowrap">
                              {formatTime(
                                entry.inTime ||
                                  entry.entryTime ||
                                  entry.createdAt,
                              )}
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-emerald-800 whitespace-nowrap">
                              {bay.bayName}
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-emerald-800 font-medium whitespace-nowrap">
                              {entry.vehicleNumber || "—"}
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-emerald-800 whitespace-nowrap">
                              {entry.visitorName || "—"}
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-emerald-800 whitespace-nowrap">
                              {entry.visitorCompany || "—"}
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-emerald-800 whitespace-nowrap">
                              {entry.createdBy?.name || "—"}
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                              <span
                                className={`px-2 py-1 rounded text-xs font-medium ${
                                  entry.outTime || entry.exitTime || entry.out
                                    ? "bg-purple-100 text-purple-700"
                                    : "bg-blue-100 text-blue-700"
                                }`}
                              >
                                {entry.outTime || entry.exitTime || entry.out
                                  ? "Exit"
                                  : "Entry"}
                              </span>
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-emerald-800 whitespace-nowrap">
                              <span className="capitalize px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs">
                                {entry.entryMethod || "Manual"}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="8"
                            className="px-4 py-8 text-center text-emerald-600"
                          >
                            No recent activity
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="px-3 sm:px-4 py-2 sm:py-3 border-t border-emerald-100 text-[10px] sm:text-xs text-emerald-600 text-center">
                  Showing last {recentEntries.length} records
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN - 1/3 width */}
            <div className="space-y-4 sm:space-y-6">
              {/* Bay Activity Timeline */}
              <div className="bg-white border border-emerald-100 rounded-lg p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                  <Clock
                    size={16}
                    className="text-emerald-600 sm:w-[18px] sm:h-[18px]"
                  />
                  <h3 className="text-sm sm:text-base font-semibold text-emerald-800">
                    Bay Activity Timeline (Today)
                  </h3>
                </div>
                <div className="space-y-2 sm:space-y-3">
                  {todayEntries.slice(0, 4).map((entry) => (
                    <div
                      key={entry._id}
                      className="flex items-start gap-2 sm:gap-3 pb-2 sm:pb-3 border-b border-emerald-100 last:border-0"
                    >
                      <div className="w-2 h-2 rounded-full bg-emerald-600 mt-1.5 flex-shrink-0"></div>
                      <div className="flex-1 text-xs sm:text-sm">
                        <p className="font-medium text-emerald-800">
                          {formatTime(
                            entry.inTime || entry.entryTime || entry.createdAt,
                          )}{" "}
                          {entry.outTime || entry.exitTime || entry.out
                            ? "Exit"
                            : "Entry"}
                        </p>
                        <p className="text-emerald-600 text-[10px] sm:text-xs">
                          {entry.vehicleType ||
                            entry.type ||
                            (entry.outTime || entry.exitTime
                              ? "Truck"
                              : "Van")}{" "}
                          |{" "}
                          {entry.method ||
                            entry.detectionMethod ||
                            entry.scanType ||
                            "Manual"}
                        </p>
                      </div>
                    </div>
                  ))}
                  {todayEntries.length === 0 && (
                    <p className="text-emerald-600 text-xs sm:text-sm">
                      No activity today
                    </p>
                  )}
                </div>
              </div>

              {/* Recent Vehicles Linked */}
              <div className="bg-white border border-emerald-100 rounded-lg p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                  <Truck
                    size={16}
                    className="text-emerald-600 sm:w-[18px] sm:h-[18px]"
                  />
                  <h3 className="text-sm sm:text-base font-semibold text-emerald-800">
                    Recent Vehicles Linked
                  </h3>
                </div>
                <div className="space-y-2 sm:space-y-3">
                  {recentVehicles.length > 0 ? (
                    recentVehicles.map((vehicle, idx) => (
                      <div
                        key={idx}
                        className="pb-2 sm:pb-3 border-b border-emerald-100 last:border-0"
                      >
                        <p className="font-medium text-emerald-800 text-xs sm:text-sm">
                          {vehicle.vrn}
                        </p>
                        <p className="text-emerald-600 text-[10px] sm:text-xs">
                          {vehicle.company}
                        </p>
                        <p className="text-emerald-500 text-[10px] sm:text-xs mt-1">
                          {vehicle.time} {vehicle.direction}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-emerald-600 text-xs sm:text-sm">
                      No vehicles currently inside
                    </p>
                  )}
                </div>
              </div>

              {/* Bay Alerts */}
              <div className="bg-white border border-emerald-100 rounded-lg p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                  <AlertCircle
                    size={16}
                    className="text-orange-600 sm:w-[18px] sm:h-[18px]"
                  />
                  <h3 className="text-sm sm:text-base font-semibold text-emerald-800">
                    Bay Alerts
                  </h3>
                </div>
                <div className="space-y-2 sm:space-y-3">
                  {displayAlerts.length > 0 ? (
                    displayAlerts.map((alert, idx) => (
                      <div
                        key={idx}
                        className={`p-2 sm:p-3 rounded-lg text-xs sm:text-sm ${
                          alert.type === "reminder"
                            ? "bg-orange-50 border border-orange-200"
                            : "bg-blue-50 border border-blue-200"
                        }`}
                      >
                        <span
                          className={`font-medium text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded ${
                            alert.type === "reminder"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {alert.type === "reminder" ? "Reminder" : "Notice"}
                        </span>
                        <p className="mt-1.5 sm:mt-2 text-emerald-800">
                          {alert.message}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-emerald-600 text-xs sm:text-sm">
                      No alerts at this time
                    </p>
                  )}
                  <p className="text-emerald-500 text-[10px] sm:text-xs mt-2 sm:mt-3">
                    Alerts help you follow up on slow movements. Only
                    supervisors and staff see these, they do not change
                    system-level rules.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-emerald-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 sm:px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition font-medium text-sm sm:text-base"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyBays;
