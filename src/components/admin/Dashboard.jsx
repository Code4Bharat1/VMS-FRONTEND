"use client";

import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import {
  Users, UserCheck, UserX, Shield, Calendar,
  TrendingUp, Clock, Activity, ArrowUp, ArrowDown,
  Truck, Car, Eye, RefreshCw, AlertTriangle,
  Building2, Store, Tag
} from "lucide-react";

/* ================= HELPERS (UNCHANGED) ================= */

const getBarGraphData = (entries, timeRange) => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const timeSlots = ["Morning", "Afternoon", "Evening"];

  const chartData = {};
  timeSlots.forEach((slot) => {
    chartData[slot] = {};
    days.forEach((day) => { chartData[slot][day] = 0; });
  });

  const now = new Date();
  let startDate, endDate;

  switch (timeRange) {
    case "7days":
      startDate = new Date(); startDate.setDate(startDate.getDate() - 6); startDate.setHours(0,0,0,0);
      endDate = new Date(); endDate.setHours(23,59,59,999); break;
    case "30days":
      startDate = new Date(); startDate.setDate(startDate.getDate() - 29); startDate.setHours(0,0,0,0);
      endDate = new Date(); endDate.setHours(23,59,59,999); break;
    case "thisMonth":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1); startDate.setHours(0,0,0,0);
      endDate = new Date(); endDate.setHours(23,59,59,999); break;
    case "lastMonth":
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1); startDate.setHours(0,0,0,0);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0); endDate.setHours(23,59,59,999); break;
    default:
      startDate = new Date(); startDate.setDate(startDate.getDate() - 6); startDate.setHours(0,0,0,0);
      endDate = new Date(); endDate.setHours(23,59,59,999);
  }

  entries.forEach((e) => {
    const date = new Date(e.createdAt);
    if (date >= startDate && date <= endDate) {
      const day = days[date.getDay()];
      const hour = date.getHours();
      let timeSlot;
      if (hour >= 6 && hour < 12) timeSlot = "Morning";
      else if (hour >= 12 && hour < 18) timeSlot = "Afternoon";
      else timeSlot = "Evening";
      chartData[timeSlot][day]++;
    }
  });

  return { timeSlots, days, data: chartData };
};

const getDistributionData = ({ staff, supervisors, entries, timeRange }) => {
  const staffCount = staff.length;
  const supervisorCount = supervisors.length;
  const now = new Date();
  let startDate, endDate;

  switch (timeRange) {
    case "7days":
      startDate = new Date(); startDate.setDate(startDate.getDate() - 6); startDate.setHours(0,0,0,0);
      endDate = new Date(); endDate.setHours(23,59,59,999); break;
    case "30days":
      startDate = new Date(); startDate.setDate(startDate.getDate() - 29); startDate.setHours(0,0,0,0);
      endDate = new Date(); endDate.setHours(23,59,59,999); break;
    case "thisMonth":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1); startDate.setHours(0,0,0,0);
      endDate = new Date(); endDate.setHours(23,59,59,999); break;
    case "lastMonth":
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1); startDate.setHours(0,0,0,0);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0); endDate.setHours(23,59,59,999); break;
    default:
      startDate = new Date(); startDate.setDate(startDate.getDate() - 6); startDate.setHours(0,0,0,0);
      endDate = new Date(); endDate.setHours(23,59,59,999);
  }

  const filteredEntries = entries.filter((e) => {
    const date = new Date(e.createdAt);
    return date >= startDate && date <= endDate;
  });

  const visitorCount = filteredEntries.length;
  const total = staffCount + supervisorCount + visitorCount;

  return {
    total,
    segments: [
      { label: "Staff Members", value: staffCount, color: "#16a34a" },
      { label: "Visitors", value: visitorCount, color: "#22c55e" },
      { label: "Supervisors", value: supervisorCount, color: "#4ade80" },
    ],
  };
};

/* ================= MAIN ================= */

export default function Dashboard() {
  const [staff, setStaff] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [entries, setEntries] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("7days");
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const intervalRef = useRef(null);

  useEffect(() => {
    fetchDashboard();
    intervalRef.current = setInterval(fetchDashboard, 15000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const headers = { Authorization: `Bearer ${token}` };

      const [staffRes, supervisorRes, entryRes, vendorRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/staff`, { headers }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/supervisors`, { headers }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/entries`, { headers }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/vendors`, { headers }),
      ]);

      setStaff(staffRes.data.staff || []);
      setSupervisors(supervisorRes.data.supervisors || []);
      setEntries(entryRes.data.entries || []);
      setVendors(vendorRes.data.vendors || []);
      setLastRefresh(new Date());
      setLoading(false);
    } catch (err) {
      console.error("Dashboard fetch failed", err);
      setLoading(false);
    }
  };

  /* ================= DERIVED METRICS (from existing data) ================= */

  const totalStaff = staff.length;
  const activeStaff = staff.filter((s) => s.isActive).length;
  const inactiveStaff = totalStaff - activeStaff;
  const activeSupervisors = supervisors.filter((s) => s.isActive).length;

  // Today's entries
  const todayStr = new Date().toDateString();
  const todayEntries = entries.filter(e => new Date(e.createdAt).toDateString() === todayStr);

  // Yesterday's entries for comparison
  const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayEntries = entries.filter(e => new Date(e.createdAt).toDateString() === yesterday.toDateString());
  const todayVsYesterday = yesterdayEntries.length > 0
    ? Math.round(((todayEntries.length - yesterdayEntries.length) / yesterdayEntries.length) * 100)
    : 0;

  // Currently inside (no outTime)
  const currentlyInside = entries.filter(e => !e.outTime).length;

  // Vehicle type breakdown from entries
  const vehicleTypes = entries.reduce((acc, e) => {
    const t = (e.vehicleType || "Unknown").toLowerCase();
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {});

  // Entry method breakdown
  const entryMethods = entries.reduce((acc, e) => {
    const m = e.entryMethod || "manual";
    acc[m] = (acc[m] || 0) + 1;
    return acc;
  }, {});

  // Avg processing time (valid entries only)
  const validEntries = entries.filter(e => e.processingTimeMs > 1000);
  const avgMs = validEntries.length
    ? validEntries.reduce((s, e) => s + e.processingTimeMs, 0) / validEntries.length
    : 0;
  const avgSec = Math.round(avgMs / 1000);
  const avgProcessingTime = validEntries.length === 0
    ? "N/A"
    : avgSec < 60 ? `${avgSec}s` : `${Math.floor(avgSec / 60)}m ${avgSec % 60}s`;

  // Recent 5 entries
  const recentEntries = [...entries]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  // Pending staff approvals
  const pendingApprovals = staff.filter(s => s.approvalStatus === "pending").length;

  // ── TENANT METRICS (from entries.tenantName matched to vendors) ──
  // Top tenants by delivery count (using tenantName in entries)
  const tenantDeliveryCounts = entries.reduce((acc, e) => {
    const t = e.tenantName;
    if (t) { acc[t] = (acc[t] || 0) + 1; }
    return acc;
  }, {});

  const topTenants = Object.entries(tenantDeliveryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Category breakdown — from vendors list
  const categoryBreakdown = vendors.reduce((acc, v) => {
    const cat = v.Category || "uncategorized";
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  // Category delivery count — match entries tenantName to vendor companyName
  const categoryDeliveries = entries.reduce((acc, e) => {
    const vendor = vendors.find(v => v.companyName === e.tenantName);
    if (vendor) {
      const cat = vendor.Category || "uncategorized";
      acc[cat] = (acc[cat] || 0) + 1;
    }
    return acc;
  }, {});

  const topCategories = Object.entries(categoryDeliveries)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const totalVendors = vendors.length;
  const activeVendors = vendors.filter(v => v.status === "active").length;

  const barGraphData = getBarGraphData(entries, timeRange);
  const distributionData = getDistributionData({ staff, supervisors, entries, timeRange });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-50">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin h-12 w-12 border-4 border-emerald-500 border-t-transparent rounded-full" />
          <p className="text-emerald-600 text-sm font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-emerald-50/60 text-[15px]">

      {/* ── HEADER ── */}
      <div className="bg-white px-4 sm:px-8 py-4 border-b border-emerald-100 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-emerald-800">Admin Dashboard</h1>
            <p className="text-sm text-emerald-500">Real-time visitor & workforce analytics</p>
          </div>
          <div className="flex items-center gap-3">
            {pendingApprovals > 0 && (
              <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-200 text-orange-700 text-sm px-3 py-1.5 rounded-full font-medium">
                <AlertTriangle size={13} />
                {pendingApprovals} pending approval{pendingApprovals > 1 ? "s" : ""}
              </div>
            )}
            <div className="flex items-center gap-1.5 text-xs text-emerald-500">
              <RefreshCw size={13} className="animate-spin" style={{ animationDuration: "3s" }} />
              <span className="hidden sm:inline">
                Updated {lastRefresh.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-8 py-6 space-y-6">

        {/* ── ROW 1: PRIMARY STATS ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Staff" value={totalStaff} icon={Users}
            sub={`${activeStaff} active · ${inactiveStaff} inactive`} accent="emerald" />
          <StatCard title="Active Staff" value={activeStaff} icon={UserCheck}
            sub={totalStaff > 0 ? `${Math.round((activeStaff / totalStaff) * 100)}% of workforce` : "—"}
            accent="emerald" trend={activeStaff > inactiveStaff ? "up" : "down"} />
          <StatCard title="Inactive Staff" value={inactiveStaff} icon={UserX}
            sub="Needs attention" accent={inactiveStaff > 0 ? "red" : "emerald"} />
          <StatCard title="Supervisors" value={`${activeSupervisors}/${supervisors.length}`}
            icon={Shield} sub={`${activeSupervisors} active supervisors`} accent="emerald" />
        </div>

        {/* ── ROW 2: SECONDARY STATS ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MiniStat title="Today's Entries" value={todayEntries.length}
            icon={<TrendingUp size={16} />}
            badge={todayVsYesterday !== 0 ? `${todayVsYesterday > 0 ? "+" : ""}${todayVsYesterday}% vs yesterday` : "Same as yesterday"}
            badgeColor={todayVsYesterday >= 0 ? "emerald" : "red"} />
          <MiniStat title="Currently Inside" value={currentlyInside}
            icon={<Eye size={16} />}
            badge="Active visits" badgeColor="blue" />
          <MiniStat title="Avg Process Time" value={avgProcessingTime}
            icon={<Clock size={16} />}
            badge={validEntries.length > 0 ? `${validEntries.length} valid entries` : "No data yet"}
            badgeColor="emerald" />
          <MiniStat title="Total Entries" value={entries.length}
            icon={<Activity size={16} />}
            badge="All time" badgeColor="emerald" />
        </div>

        {/* ── ROW 3: CHARTS ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <TrafficBarGraph data={barGraphData} timeRange={timeRange} onTimeRangeChange={setTimeRange} />
          </div>
          <DistributionDonut total={distributionData.total} segments={distributionData.segments} />
        </div>

        {/* ── ROW 4: BREAKDOWN + RECENT ENTRIES ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Vehicle & Method Breakdown */}
          <div className="space-y-4">
            {/* Vehicle Type */}
            <div className="bg-white rounded-xl border border-emerald-100 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-emerald-800 text-base mb-4 flex items-center gap-2">
                <Truck size={15} className="text-emerald-600" />
                Vehicle Type Breakdown
              </h3>
              <div className="space-y-3">
                {Object.entries(vehicleTypes).length === 0 ? (
                  <p className="text-xs text-gray-400">No entries yet</p>
                ) : (
                  Object.entries(vehicleTypes)
                    .sort((a, b) => b[1] - a[1])
                    .map(([type, count]) => {
                      const pct = entries.length > 0 ? Math.round((count / entries.length) * 100) : 0;
                      return (
                        <div key={type}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="capitalize text-emerald-700 font-medium">{type}</span>
                            <span className="text-emerald-600">{count} <span className="text-gray-400">({pct}%)</span></span>
                          </div>
                          <div className="w-full bg-emerald-50 rounded-full h-2">
                            <div
                              className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            </div>

            {/* Entry Method */}
            <div className="bg-white rounded-xl border border-emerald-100 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-emerald-800 text-base mb-4 flex items-center gap-2">
                <Car size={15} className="text-emerald-600" />
                Entry Method
              </h3>
              <div className="space-y-3">
                {Object.entries(entryMethods).length === 0 ? (
                  <p className="text-xs text-gray-400">No entries yet</p>
                ) : (
                  Object.entries(entryMethods)
                    .sort((a, b) => b[1] - a[1])
                    .map(([method, count]) => {
                      const pct = entries.length > 0 ? Math.round((count / entries.length) * 100) : 0;
                      const colors = { manual: "emerald", ocr: "teal", qr: "green" };
                      const c = colors[method] || "emerald";
                      return (
                        <div key={method}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="capitalize text-emerald-700 font-medium">{method.toUpperCase()}</span>
                            <span className="text-emerald-600">{count} <span className="text-gray-400">({pct}%)</span></span>
                          </div>
                          <div className="w-full bg-emerald-50 rounded-full h-2">
                            <div
                              className="bg-emerald-400 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            </div>
          </div>

          {/* Recent Entries */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-emerald-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-emerald-50 flex items-center justify-between">
              <h3 className="text-base font-semibold text-emerald-800">Recent Entries</h3>
              <span className="text-xs text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full">Last 5</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-emerald-50/70">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-emerald-700">Visitor</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-emerald-700">Vehicle</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-emerald-700">Type</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-emerald-700">Method</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-emerald-700">Time</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-emerald-700">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-50">
                  {recentEntries.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-xs">No entries yet</td>
                    </tr>
                  ) : (
                    recentEntries.map((e, i) => (
                      <tr key={e._id || i} className="hover:bg-emerald-50/50 transition">
                        <td className="px-4 py-3">
                          <span className="font-medium text-emerald-800 text-xs">{e.visitorName || "—"}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">
                            {e.vehicleNumber || "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-gray-600 capitalize">{e.vehicleType || "—"}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs uppercase text-emerald-600 font-medium">{e.entryMethod || "—"}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-gray-500">
                            {new Date(e.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            e.outTime
                              ? "bg-gray-100 text-gray-500"
                              : "bg-emerald-100 text-emerald-700"
                          }`}>
                            {e.outTime ? "Exited" : "Inside"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* ── ROW 5: TENANT ANALYTICS ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Total Tenants stat + active/inactive */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-emerald-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-emerald-800 flex items-center gap-2">
                  <Building2 size={15} className="text-emerald-600" />
                  Tenant Overview
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-emerald-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-emerald-800">{totalVendors}</p>
                  <p className="text-xs text-emerald-600 mt-0.5">Total Tenants</p>
                </div>
                <div className="bg-emerald-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-emerald-800">{activeVendors}</p>
                  <p className="text-xs text-emerald-600 mt-0.5">Active Tenants</p>
                </div>
              </div>
              {/* Category count breakdown */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-emerald-700 mb-2">By Category</p>
                {Object.entries(categoryBreakdown).length === 0 ? (
                  <p className="text-xs text-gray-400">No tenants yet</p>
                ) : (
                  Object.entries(categoryBreakdown)
                    .sort((a, b) => b[1] - a[1])
                    .map(([cat, count]) => {
                      const pct = totalVendors > 0 ? Math.round((count / totalVendors) * 100) : 0;
                      return (
                        <div key={cat}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="capitalize text-emerald-700 font-medium">{cat}</span>
                            <span className="text-gray-500">{count} tenants</span>
                          </div>
                          <div className="w-full bg-emerald-50 rounded-full h-1.5">
                            <div className="bg-emerald-400 h-1.5 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            </div>
          </div>

          {/* Top Tenants by Deliveries */}
          <div className="bg-white rounded-xl border border-emerald-100 shadow-sm p-5">
            <h3 className="text-base font-semibold text-emerald-800 mb-1 flex items-center gap-2">
              <Store size={15} className="text-emerald-600" />
              Most Frequent Tenants
            </h3>
            <p className="text-xs text-emerald-500 mb-4">By total deliveries received</p>
            <div className="space-y-3">
              {topTenants.length === 0 ? (
                <p className="text-xs text-gray-400">No delivery data yet</p>
              ) : (
                topTenants.map(([name, count], i) => {
                  const maxCount = topTenants[0][1];
                  const pct = maxCount > 0 ? Math.round((count / maxCount) * 100) : 0;
                  const medals = ["🥇", "🥈", "🥉"];
                  return (
                    <div key={name}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="flex-shrink-0">{medals[i] || `#${i + 1}`}</span>
                          <span className="text-emerald-800 font-medium truncate">{name}</span>
                        </div>
                        <span className="text-emerald-600 font-semibold flex-shrink-0 ml-2">{count}</span>
                      </div>
                      <div className="w-full bg-emerald-50 rounded-full h-2">
                        <div
                          className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Category Deliveries */}
          <div className="bg-white rounded-xl border border-emerald-100 shadow-sm p-5">
            <h3 className="text-base font-semibold text-emerald-800 mb-1 flex items-center gap-2">
              <Tag size={15} className="text-emerald-600" />
              Deliveries by Category
            </h3>
            <p className="text-xs text-emerald-500 mb-4">Which tenant categories get the most traffic</p>
            <div className="space-y-3">
              {topCategories.length === 0 ? (
                <p className="text-xs text-gray-400">No matched entries yet</p>
              ) : (
                topCategories.map(([cat, count], i) => {
                  const maxCount = topCategories[0][1];
                  const pct = maxCount > 0 ? Math.round((count / maxCount) * 100) : 0;
                  const totalCatEntries = Object.values(categoryDeliveries).reduce((a, b) => a + b, 0);
                  const sharePct = totalCatEntries > 0 ? Math.round((count / totalCatEntries) * 100) : 0;
                  return (
                    <div key={cat}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="capitalize text-emerald-700 font-medium">{cat}</span>
                        <span className="text-emerald-600 font-semibold">
                          {count} <span className="text-gray-400 font-normal">({sharePct}%)</span>
                        </span>
                      </div>
                      <div className="w-full bg-emerald-50 rounded-full h-2">
                        <div
                          className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

const StatCard = ({ title, value, icon: Icon, sub, accent = "emerald", trend }) => (
  <div className={`bg-white rounded-xl border shadow-sm p-5 hover:shadow-md transition-shadow ${
    accent === "red" ? "border-red-100" : "border-emerald-100"
  }`}>
    <div className="flex justify-between items-start mb-3">
      <div className={`p-2 rounded-lg ${accent === "red" ? "bg-red-50" : "bg-emerald-50"}`}>
        <Icon className={`w-4 h-4 ${accent === "red" ? "text-red-500" : "text-emerald-600"}`} />
      </div>
      <div className="flex items-center gap-1">
        {trend && (
          trend === "up"
            ? <ArrowUp size={12} className="text-emerald-500" />
            : <ArrowDown size={12} className="text-red-400" />
        )}
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">Live</span>
      </div>
    </div>
    <p className={`text-3xl sm:text-4xl font-bold mb-1 ${accent === "red" ? "text-red-700" : "text-emerald-800"}`}>
      {value}
    </p>
    <p className={`text-sm font-medium mb-0.5 ${accent === "red" ? "text-red-500" : "text-emerald-600"}`}>
      {title}
    </p>
    {sub && <p className="text-xs text-gray-400">{sub}</p>}
  </div>
);

const MiniStat = ({ title, value, icon, badge, badgeColor = "emerald" }) => {
  const badgeStyles = {
    emerald: "bg-emerald-100 text-emerald-700",
    red: "bg-red-100 text-red-600",
    blue: "bg-blue-100 text-blue-600",
  };
  return (
    <div className="bg-white rounded-xl border border-emerald-100 shadow-sm p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <div className="text-emerald-500">{icon}</div>
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${badgeStyles[badgeColor]}`}>
          {badge}
        </span>
      </div>
      <p className="text-3xl font-bold text-emerald-800">{value}</p>
      <p className="text-sm text-emerald-600 mt-0.5">{title}</p>
    </div>
  );
};

/* ---------- BAR GRAPH (enhanced, same logic) ---------- */

const TrafficBarGraph = ({ data, timeRange, onTimeRangeChange }) => {
  const { timeSlots, days, data: chartData } = data;
  const [hoveredBar, setHoveredBar] = useState(null);

  const dayTotals = days.map((day) =>
    timeSlots.reduce((sum, slot) => sum + chartData[slot][day], 0)
  );
  const maxValue = Math.max(...dayTotals, 1);

  const timeRangeOptions = [
    { value: "7days", label: "Last 7 Days" },
    { value: "30days", label: "Last 30 Days" },
    { value: "thisMonth", label: "This Month" },
    { value: "lastMonth", label: "Last Month" },
  ];

  return (
    <div className="bg-white rounded-xl border border-emerald-100 shadow-sm p-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <h3 className="font-semibold text-emerald-800 text-base">Visitor Traffic</h3>
          <p className="text-xs text-emerald-500">Entry activity by day of week</p>
        </div>
        <div className="flex items-center gap-1 bg-emerald-50 rounded-lg p-1">
          <Calendar className="w-3.5 h-3.5 text-emerald-500 ml-1.5" />
          {timeRangeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onTimeRangeChange(opt.value)}
              className={`px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-all ${
                timeRange === opt.value
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-emerald-600 hover:bg-emerald-100"
              }`}
            >
              {opt.label.replace("Last ", "").replace(" Days", "D").replace("This Month", "This").replace("Last Month", "Last")}
            </button>
          ))}
        </div>
      </div>

      <div className="h-56 flex items-end justify-around gap-2 pt-6">
        {days.map((day, i) => {
          const total = dayTotals[i];
          const isHovered = hoveredBar === day;
          const barH = total > 0 ? (total / maxValue) * 100 : 0;

          return (
            <div
              key={day}
              className="flex-1 flex flex-col items-center"
              onMouseEnter={() => setHoveredBar(day)}
              onMouseLeave={() => setHoveredBar(null)}
            >
              {total > 0 && (
                <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded mb-1.5 transition-all ${
                  isHovered ? "bg-emerald-700 text-white" : "bg-emerald-100 text-emerald-700"
                }`}>
                  {total}
                </div>
              )}

              <div
                className="w-full relative cursor-pointer rounded-t-md transition-all duration-300"
                style={{
                  height: `${Math.max(barH, total > 0 ? 8 : 0)}%`,
                  minHeight: total > 0 ? "24px" : "0",
                  backgroundColor: isHovered ? "#15803d" : "#22c55e",
                  transform: isHovered ? "scaleX(1.08)" : "scaleX(1)",
                }}
              >
                {isHovered && total > 0 && (
                  <div className="absolute z-10 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-emerald-800 text-white text-[11px] rounded-lg whitespace-nowrap shadow-xl">
                    <p className="font-bold mb-1">{day}</p>
                    {timeSlots.map(slot => chartData[slot][day] > 0 && (
                      <p key={slot}>{slot}: {chartData[slot][day]}</p>
                    ))}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-emerald-800" />
                  </div>
                )}
              </div>

              <p className="text-[10px] font-semibold text-emerald-600 mt-1.5">{day.slice(0,3)}</p>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-4 mt-3 pt-3 border-t border-emerald-50">
        {[["Morning", "bg-emerald-300"], ["Afternoon", "bg-emerald-500"], ["Evening", "bg-emerald-700"]].map(([label, color]) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${color}`} />
            <span className="text-[10px] text-emerald-600">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ---------- DONUT CHART (same logic, enhanced look) ---------- */

const DistributionDonut = ({ total, segments }) => {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="bg-white rounded-xl border border-emerald-100 shadow-sm p-5">
      <h3 className="font-semibold text-emerald-800 text-base mb-1">Distribution Overview</h3>
      <p className="text-xs text-emerald-500 mb-4">People & activity breakdown</p>

      <div className="flex flex-col items-center gap-5">
        <div className="relative">
          <svg width="120" height="120" viewBox="0 0 120 120">
            <g transform="rotate(-90 60 60)">
              {segments.map((s, i) => {
                const dash = total > 0 ? (s.value / total) * circumference : 0;
                const el = (
                  <circle key={i} cx="60" cy="60" r={radius} fill="none"
                    stroke={s.color} strokeWidth="12"
                    strokeDasharray={`${dash} ${circumference}`}
                    strokeDashoffset={-offset}
                    strokeLinecap="round"
                  />
                );
                offset += dash;
                return el;
              })}
            </g>
            <text x="50%" y="46%" textAnchor="middle" className="fill-emerald-800" fontSize="18" fontWeight="bold">{total}</text>
            <text x="50%" y="62%" textAnchor="middle" className="fill-emerald-500" fontSize="9">Total</text>
          </svg>
        </div>

        <div className="w-full space-y-2.5">
          {segments.map((s) => {
            const pct = total > 0 ? Math.round((s.value / total) * 100) : 0;
            return (
              <div key={s.label}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
                    <span className="text-xs text-emerald-700">{s.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{s.value}</span>
                    <span className="text-xs font-semibold text-emerald-800 w-8 text-right">{pct}%</span>
                  </div>
                </div>
                <div className="w-full bg-emerald-50 rounded-full h-1.5">
                  <div className="h-1.5 rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: s.color }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};