"use client";

import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  Plus,
  Activity,
  AlertCircle,
  Clock,
  Car,
  Building2,
  X,
  Users,
} from "lucide-react";

export default function BayManagement() {
  const [bays, setBays] = useState([]);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  /* Add Bay Modal State */
  const [showAddBay, setShowAddBay] = useState(false);
  const [bayName, setBayName] = useState("");
  const [bayType, setBayType] = useState("");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  /* Delete State */
  const [deletingId, setDeletingId] = useState(null);

  /* Mobile Detail Popup */
  const [showMobilePopup, setShowMobilePopup] = useState(false);
  const [selectedBay, setSelectedBay] = useState(null);

  /* Activity Timeline Date Filter */
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      const [bayRes, entryRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/bays`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/entries`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setBays(bayRes.data.bays || []);
      setEntries(entryRes.data.entries || []);
    } catch (err) {
      console.error("Failed to load bay data", err);
    } finally {
      setLoading(false);
    }
  };

  const validateBay = () => {
    const newErrors = {};

    const nameRegex = /^[A-Za-z0-9]+$/;
    const typeRegex = /^[A-Za-z ]+$/; // characters + space

    // BAY NAME
    if (!bayName.trim()) {
      newErrors.bayName = "Bay name is required";
    } else if (!nameRegex.test(bayName.trim())) {
      newErrors.bayName = "Bay name must contain only letters and numbers";
    } else if (bayName.length > 10) {
      newErrors.bayName = "Bay name must be max 10 characters";
    }

    // BAY TYPE
    if (!bayType.trim()) {
      newErrors.bayType = "Bay type is required";
    } else if (!typeRegex.test(bayType.trim())) {
      newErrors.bayType = "Bay type must contain only letters";
    } else if (bayType.trim().length < 3) {
      newErrors.bayType = "Bay type must be at least 3 characters";
    } else if (bayType.trim().length > 30) {
      newErrors.bayType = "Bay type must be max 30 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ADD BAY */
  const addBay = async () => {
    if (!validateBay()) return;

    try {
      setSaving(true);
      const token = localStorage.getItem("accessToken");

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/bays`,
        { bayName: bayName.trim(), bayType: bayType.trim() },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setShowAddBay(false);
      setBayName("");
      setBayType("");
      setErrors({});
      fetchData();
    } catch (err) {
      console.error("Failed to add bay", err);
    } finally {
      setSaving(false);
    }
  };

  /* DELETE BAY */
  const deleteBay = async (id) => {
    if (!window.confirm("Are you sure you want to delete this bay?")) return;

    try {
      setDeletingId(id);
      const token = localStorage.getItem("accessToken");

      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/bays/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchData();
    } catch (err) {
      console.error("Failed to delete bay", err);
    } finally {
      setDeletingId(null);
    }
  };

  /* ANALYTICS HELPERS */
  const BAY_CAPACITY = 100;

  const getBayStats = (bayId) => {
    const active = entries.filter(
      (e) =>
        e.outTime === null &&
        e.bayId &&
        String(typeof e.bayId === "object" ? e.bayId._id : e.bayId) ===
          String(bayId),
    );

    const occupied = active.length;
    const free = Math.max(BAY_CAPACITY - occupied, 0);
    const utilisation = Math.round((occupied / BAY_CAPACITY) * 100);

    return { occupied, free, utilisation };
  };

  const activeVehicles = entries.filter((e) => e.bayId && e.outTime === null);

  const alerts = activeVehicles
    .map((e) => {
      const mins = (Date.now() - new Date(e.inTime)) / 60000;
      if (mins > 60) {
        return {
          id: e._id,
          message: `Vehicle ${e.vehicleNumber} overstayed`,
          dueIn: `${Math.floor(mins)} mins`,
          bay: typeof e.bayId === "object" ? e.bayId.bayName : "",
        };
      }
      return null;
    })
    .filter(Boolean);

  const getSupervisorFromBay = (entry) => {
    if (!entry || !entry.bayId) return "—";

    const bayId =
      typeof entry.bayId === "object" ? entry.bayId._id : entry.bayId;

    const bay = bays.find((b) => String(b._id) === String(bayId));
    if (!bay) return "—";

    return (
      bay.supervisorName ||
      bay.supervisor ||
      bay.supervisor?.name ||
      bay.supervisorId?.name ||
      entry.createdBy?.name ||
      "—"
    );
  };

  /* ACTIVITY TIMELINE - Based on actual entry times */
  const getHourlyActivity = useMemo(() => {
    const targetDate = new Date(selectedDate);
    targetDate.setHours(0, 0, 0, 0);

    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    // Filter entries for selected date
    const dateEntries = entries.filter((e) => {
      const entryDate = new Date(e.inTime || e.createdAt);
      return entryDate >= targetDate && entryDate < nextDay;
    });

    // Create hourly buckets (0-23)
    const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      count: 0,
      label: `${hour.toString().padStart(2, "0")}:00`,
    }));

    // Count entries per hour
    dateEntries.forEach((e) => {
      const entryDate = new Date(e.inTime || e.createdAt);
      const hour = entryDate.getHours();
      if (hour >= 0 && hour < 24) {
        hourlyData[hour].count++;
      }
    });

    return hourlyData;
  }, [entries, selectedDate]);

  // Get max count for scaling
  const maxHourlyCount = Math.max(...getHourlyActivity.map((h) => h.count), 1);

  // Get current hour for highlighting
  const currentHour = new Date().getHours();

  // Filter to show only hours with activity or current working hours (8-18)
  const relevantHours = getHourlyActivity.filter(
    (h) => h.count > 0 || (h.hour >= 6 && h.hour <= 20),
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-emerald-50/60 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
          <p className="text-sm text-emerald-600 mt-3">Loading bay data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-emerald-50/60">
      {/* HEADER */}
      <div className="sticky top-0 z-40 bg-white border-b border-emerald-100 px-4 sm:px-8 py-4 sm:py-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-emerald-800">
              Bay Management
            </h1>
            <p className="text-sm text-emerald-600 mt-1">
              Monitor live bay occupancy, activity timeline and vehicle linkages
            </p>
          </div>

          <button
            onClick={() => {
              setShowAddBay(true);
              setErrors({});
              setBayName("");
              setBayType("");
            }}
            className="flex items-center justify-center gap-2 px-4 h-11 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition"
          >
            <Plus size={18} />
            <span>Add Bay</span>
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="px-4 sm:px-8 py-6 space-y-6">
        {/* BAY SUMMARY CARDS */}
        <div>
          <h2 className="text-lg font-semibold text-emerald-800 mb-4">
            Bay Occupancy Overview
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {bays.map((bay) => {
              const { occupied, free, utilisation } = getBayStats(bay._id);

              return (
                <div
                  key={bay._id}
                  onClick={() => {
                    setSelectedBay(bay);
                    setShowMobilePopup(true);
                  }}
                  className="bg-white rounded-xl border border-emerald-100 p-4 sm:p-5 shadow-sm hover:shadow-md transition cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="text-emerald-600" size={20} />
                      <h3 className="font-semibold text-emerald-800">
                        Bay {bay.bayName}
                      </h3>
                    </div>
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-medium">
                      Live
                    </span>
                  </div>

                  <p className="text-xs text-emerald-600 mb-3">
                    {bay.bayType} bay
                  </p>

                  <div className="flex gap-2 text-xs mb-4">
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-md font-medium">
                      Free: {free}
                    </span>
                    <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-md font-medium">
                      Occupied: {occupied}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="h-2 bg-emerald-100 rounded-full overflow-hidden">
                      <div
                        className={`h-2 transition-all ${
                          utilisation > 80
                            ? "bg-red-500"
                            : utilisation > 50
                              ? "bg-yellow-500"
                              : "bg-emerald-600"
                        }`}
                        style={{ width: `${utilisation}%` }}
                      />
                    </div>
                    <p className="text-xs text-emerald-600 font-medium">
                      {utilisation}% utilisation
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ACTIVITY TIMELINE + VEHICLE LINKAGE */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Activity Timeline */}
          <div className="bg-white rounded-xl border border-emerald-100 p-4 sm:p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="text-emerald-600" size={20} />
              <h3 className="font-semibold text-emerald-800">
                Bay Activity Timeline
              </h3>
            </div>
            <p className="text-xs text-emerald-600 mb-4">
              Hourly entry count for selected date
            </p>

            {/* Date Picker */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-emerald-700 mb-1.5">
                Select Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                className="w-full h-10 rounded-lg px-3 border border-emerald-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {relevantHours.length === 0 ? (
                <p className="text-sm text-emerald-500 text-center py-8">
                  No entries recorded on{" "}
                  {new Date(selectedDate).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              ) : (
                relevantHours.map((hourData) => {
                  const percentage = (hourData.count / maxHourlyCount) * 100;
                  const isCurrentHour = hourData.hour === currentHour;
                  const isToday =
                    selectedDate === new Date().toISOString().split("T")[0];

                  return (
                    <div key={hourData.hour} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <p
                          className={`text-xs font-medium ${
                            isCurrentHour && isToday
                              ? "text-emerald-700"
                              : "text-emerald-600"
                          }`}
                        >
                          {hourData.label}
                          {isCurrentHour && isToday && (
                            <span className="ml-2 text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded-full">
                              Now
                            </span>
                          )}
                        </p>
                        <span className="text-xs text-emerald-700 font-semibold">
                          {hourData.count}{" "}
                          {hourData.count === 1 ? "entry" : "entries"}
                        </span>
                      </div>
                      <div className="h-3 bg-emerald-50 rounded-full overflow-hidden">
                        <div
                          className={`h-3 transition-all ${
                            isCurrentHour && isToday
                              ? "bg-emerald-600"
                              : "bg-emerald-400"
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex justify-between text-xs text-emerald-600 mt-4 pt-4 border-t border-emerald-100">
              <span className="font-medium">
                {selectedDate === new Date().toISOString().split("T")[0]
                  ? `Current time: ${new Date().toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}`
                  : new Date(selectedDate).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
              </span>
              <span className="font-medium">
                Total:{" "}
                {
                  entries.filter((e) => {
                    const entryDate = new Date(e.inTime || e.createdAt);
                    const targetDate = new Date(selectedDate);
                    targetDate.setHours(0, 0, 0, 0);
                    const nextDay = new Date(targetDate);
                    nextDay.setDate(nextDay.getDate() + 1);
                    return entryDate >= targetDate && entryDate < nextDay;
                  }).length
                }
              </span>
            </div>
          </div>

          {/* Vehicle Linkage */}
          <div className="bg-white rounded-xl border border-emerald-100 p-4 sm:p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Car className="text-emerald-600" size={20} />
              <h3 className="font-semibold text-emerald-800">
                Vehicle Linkage Details
              </h3>
            </div>
            <p className="text-xs text-emerald-600 mb-4">
              Current vehicles linked to bays
            </p>

            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {activeVehicles.length === 0 ? (
                <p className="text-sm text-emerald-500 text-center py-8">
                  No active vehicles
                </p>
              ) : (
                activeVehicles.map((e) => (
                  <div
                    key={e._id}
                    className="bg-emerald-50 border border-emerald-100 p-3 sm:p-4 rounded-lg hover:shadow-sm transition"
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-emerald-800 text-sm">
                            {e.vehicleNumber}
                          </p>
                          <span className="text-xs bg-emerald-600 text-white px-2 py-0.5 rounded-full font-medium">
                            Bay{" "}
                            {typeof e.bayId === "object"
                              ? e.bayId.bayName
                              : "—"}
                          </span>
                        </div>
                        <p className="text-xs text-emerald-600">
                          <Clock size={12} className="inline mr-1" />
                          Arrived:{" "}
                          {new Date(e.inTime).toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        <p className="text-xs text-emerald-600 mt-1">
                          <Users size={12} className="inline mr-1" />
                          Entry created by:{" "}
                          <span className="font-medium">
                            {getSupervisorFromBay(e)}
                          </span>
                        </p>
                      </div>

                      <span className="text-xs bg-green-600 text-white px-3 py-1 rounded-full font-medium self-start">
                        Linked
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ALERTS */}
        <div className="bg-white rounded-xl border border-emerald-100 p-4 sm:p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="text-orange-500" size={20} />
            <h3 className="font-semibold text-emerald-800">
              Alerts & Exceptions
            </h3>
          </div>

          <div className="space-y-3">
            {alerts.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <AlertCircle className="text-emerald-600" size={24} />
                </div>
                <p className="text-sm text-emerald-600 font-medium">
                  No alerts at this time
                </p>
                <p className="text-xs text-emerald-500 mt-1">
                  All vehicles are within normal stay duration
                </p>
              </div>
            ) : (
              alerts.map((a) => (
                <div
                  key={a.id}
                  className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 bg-orange-50 border border-orange-100 p-3 sm:p-4 rounded-lg"
                >
                  <div className="flex items-start gap-3 flex-1">
                    <span className="text-xs bg-orange-500 text-white px-2 py-1 rounded font-medium whitespace-nowrap">
                      Bay {a.bay}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-orange-900">
                        {a.message}
                      </p>
                      <p className="text-xs text-orange-600 mt-1">
                        Duration: {a.dueIn}
                      </p>
                    </div>
                  </div>
                  <AlertCircle className="text-orange-500" size={20} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ADD BAY MODAL */}
      {showAddBay && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-emerald-800">
                Add New Bay
              </h2>
              <button
                onClick={() => setShowAddBay(false)}
                className="p-2 hover:bg-emerald-50 rounded-lg transition"
              >
                <X size={20} className="text-emerald-600" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-emerald-700 mb-1.5">
                  Bay Name
                </label>
                <input
                  value={bayName}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^[A-Za-z0-9]*$/.test(value)) {
                      setBayName(value);
                      setErrors({ ...errors, bayName: "" });
                    }
                  }}
                  className={`w-full h-11 rounded-lg px-3 border text-sm focus:outline-none focus:ring-2
      ${errors.bayName ? "border-red-500 focus:ring-red-500" : "border-emerald-200 focus:ring-emerald-500"}`}
                  placeholder="e.g., A, B, C1"
                />
                {errors.bayName && (
                  <p className="text-xs text-red-600 mt-1">{errors.bayName}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-emerald-700 mb-1.5">
                  Bay Type
                </label>
                <input
                  value={bayType}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^[A-Za-z ]*$/.test(value)) {
                      setBayType(value);
                      setErrors({ ...errors, bayType: "" });
                    }
                  }}
                  className={`w-full h-11 rounded-lg px-3 border text-sm focus:outline-none focus:ring-2
      ${errors.bayType ? "border-red-500 focus:ring-red-500" : "border-emerald-200 focus:ring-emerald-500"}`}
                  placeholder="e.g., Loading, Unloading, Service"
                />
                {errors.bayType && (
                  <p className="text-xs text-red-600 mt-1">{errors.bayType}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddBay(false)}
                className="px-4 py-2 border border-emerald-200 text-emerald-600 rounded-lg font-medium hover:bg-emerald-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={addBay}
                disabled={saving}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium
             hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : "Add Bay"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE BAY DETAIL POPUP */}
      {showMobilePopup && selectedBay && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-2xl max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-emerald-100 px-4 py-4 flex items-center justify-between">
              <h3 className="font-semibold text-emerald-800">
                Bay {selectedBay.bayName} Details
              </h3>
              <button
                onClick={() => setShowMobilePopup(false)}
                className="p-2 hover:bg-emerald-50 rounded-lg transition"
              >
                <X size={20} className="text-emerald-600" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div className="bg-emerald-50 rounded-lg p-3">
                <p className="text-xs text-emerald-600 mb-1">Bay Type</p>
                <p className="font-semibold text-emerald-800">
                  {selectedBay.bayType}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white border border-emerald-100 rounded-lg p-3">
                  <p className="text-xs text-emerald-600 mb-1">Free Slots</p>
                  <p className="text-2xl font-bold text-green-600">
                    {getBayStats(selectedBay._id).free}
                  </p>
                </div>

                <div className="bg-white border border-emerald-100 rounded-lg p-3">
                  <p className="text-xs text-emerald-600 mb-1">Occupied</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {getBayStats(selectedBay._id).occupied}
                  </p>
                </div>
              </div>

              <div className="bg-white border border-emerald-100 rounded-lg p-3">
                <p className="text-xs text-emerald-600 mb-2">Utilisation</p>
                <div className="h-3 bg-emerald-100 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-3 bg-emerald-600"
                    style={{
                      width: `${getBayStats(selectedBay._id).utilisation}%`,
                    }}
                  />
                </div>
                <p className="text-sm font-semibold text-emerald-800">
                  {getBayStats(selectedBay._id).utilisation}%
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
