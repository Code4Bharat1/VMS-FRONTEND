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
  Loader2,
  RefreshCw,
} from "lucide-react";
import Sidebar from "./sidebar";

const SupervisorDashboard = () => {
  const [activeView, setActiveView] = useState("daily");
  const [supervisor, setSupervisor] = useState(null);
  const [staffData, setStaffData] = useState([]);
  const [recentUpdates, setRecentUpdates] = useState([]);
  const [stats, setStats] = useState({
    totalStaff: 0,
    todayEntries: 0,
    avgProcessingTime: "0s",
    activeBays: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // API base URL
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:6094/api/v1";

  // Fetch supervisor data from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setSupervisor(user);
    }
  }, []);

  // Fetch all dashboard data
  useEffect(() => {
    if (supervisor?.id || supervisor?._id || supervisor?.name) {
      fetchDashboardData();
    }
  }, [supervisor, activeView]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Try different token key names
      const token = localStorage.getItem("token") || 
                    localStorage.getItem("accessToken") || 
                    localStorage.getItem("authToken");
      
      if (!token) {
        setLoading(false);
        setError("No authentication token found. Please log in again.");
        return;
      }

      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      const fetchWithTimeout = (url, options, timeout = 10000) => {
        return Promise.race([
          fetch(url, options),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Request timeout')), timeout)
          )
        ]);
      };

      // Fetch all data in parallel - FIXED: using /supervisors instead of /supervisor
      const [statsRes, staffRes, updatesRes] = await Promise.all([
        fetchWithTimeout(`${API_BASE_URL}/supervisors/stats?period=${activeView}`, { headers }),
        fetchWithTimeout(`${API_BASE_URL}/supervisors/staff?period=${activeView}`, { headers }),
        fetchWithTimeout(`${API_BASE_URL}/supervisors/recent-updates`, { headers }),
      ]);

      if (!statsRes.ok) {
        const errorText = await statsRes.text();
        throw new Error(`Stats API failed: ${statsRes.status}`);
      }
      if (!staffRes.ok) {
        const errorText = await staffRes.text();
        throw new Error(`Staff API failed: ${staffRes.status}`);
      }
      if (!updatesRes.ok) {
        const errorText = await updatesRes.text();
        throw new Error(`Updates API failed: ${updatesRes.status}`);
      }

      const statsData = await statsRes.json();
      const staffDataRes = await staffRes.json();
      const updatesData = await updatesRes.json();

      setStats({
        totalStaff: statsData.totalStaff || 0,
        todayEntries: statsData.todayEntries || 0,
        avgProcessingTime: statsData.avgProcessingTime || "0s",
        activeBays: statsData.activeBays || 0,
      });

      setStaffData(staffDataRes.staff || []);
      setRecentUpdates(updatesData.updates || []);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchDashboardData();
  };

  if (loading && !staffData.length) {
    return (
      <div className="flex h-screen bg-emerald-50/60 items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-emerald-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-emerald-50/60">
      <Sidebar activeItem="overview" />

      {/* MAIN CONTENT */}
      <div className="flex-1 overflow-x-hidden overflow-y-auto">
        {/* HEADER */}
        <div className="sticky top-0 z-40 bg-white border-b border-emerald-100 px-4 sm:px-8 py-4 sm:py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-emerald-800">Supervisor Panel</h1>
              <p className="text-emerald-600 mt-1 text-sm">
                Monitor your assigned security guards, bays, and supervision activities.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="p-2 hover:bg-emerald-100 rounded-lg transition disabled:opacity-50"
                title="Refresh data"
              >
                <RefreshCw className={`w-5 h-5 text-emerald-600 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold">
                {(supervisor?.name || "")
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-semibold text-emerald-800">
                  {supervisor?.name || "Supervisor"}
                </h2>
                <p className="text-emerald-600 text-xs sm:text-sm">
                  {supervisor?.role || "Supervisor"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="mx-4 sm:mx-8 mt-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="text-red-600" size={20} />
            <div className="flex-1">
              <p className="text-red-800 font-medium">Error loading data</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
            >
              Retry
            </button>
          </div>
        )}

        {/* CONTENT */}
        <div className="px-4 sm:px-8 py-4 sm:py-6">
          {/* STATS */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <div className="bg-white rounded-xl p-4 sm:p-6 border border-emerald-100 shadow-sm hover:shadow transition">
              <div className="flex justify-between mb-2">
                <p className="text-emerald-600 text-sm">Total guards Assigned</p>
                <Users className="text-emerald-600" size={20} />
              </div>
              <h3 className="text-3xl font-bold text-emerald-800">{stats.totalStaff}</h3>
            </div>

            <div className="bg-white rounded-xl p-4 sm:p-6 border border-emerald-100 shadow-sm hover:shadow transition">
              <div className="flex justify-between mb-2">
                <p className="text-emerald-600 text-sm">Today's Entries</p>
                <TrendingUp className="text-emerald-600" size={20} />
              </div>
              <h3 className="text-3xl font-bold text-emerald-800">{stats.todayEntries}</h3>
            </div>

            <div className="bg-white rounded-xl p-4 sm:p-6 border border-emerald-100 shadow-sm hover:shadow transition">
              <div className="flex justify-between mb-2">
                <p className="text-emerald-600 text-sm">Avg Processing Time</p>
                <Clock className="text-emerald-600" size={20} />
              </div>
              <h3 className="text-3xl font-bold text-emerald-800">{stats.avgProcessingTime}</h3>
            </div>

            <div className="bg-white rounded-xl p-4 sm:p-6 border border-emerald-100 shadow-sm hover:shadow transition">
              <div className="flex justify-between mb-2">
                <p className="text-emerald-600 text-sm">Active Bays</p>
                <Building2 className="text-emerald-600" size={20} />
              </div>
              <h3 className="text-3xl font-bold text-emerald-800">{stats.activeBays}</h3>
            </div>
          </div>

          {/* VIEW TOGGLE */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-emerald-800">Guard Performance</h2>
              <p className="text-emerald-600 text-sm">
                Performance overview of staff under you.
              </p>
            </div>

          </div>

          {/* TABLE */}
          <div className="bg-white rounded-xl border border-emerald-100 shadow-sm overflow-hidden mb-8">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
              </div>
            ) : staffData.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px]">
                    <thead className="bg-emerald-100">
                      <tr>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-emerald-700">
                          guard Name
                        </th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-emerald-700">
                          Mobile
                        </th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-emerald-700">
                          Email
                        </th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-emerald-700">
                          Entries
                        </th>
                        
                        <th className="px-6 py-4 text-center text-sm font-semibold text-emerald-700">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-emerald-100">
                      {staffData.map((s, i) => (
                        <tr key={s.id || i} className="hover:bg-emerald-50 transition">
                          <td className="px-6 py-4 text-center font-medium text-emerald-800">
                            {s.name}
                          </td>
                          <td className="px-6 py-4 text-center">{s.mobile}</td>
                          <td className="px-6 py-4 text-center">{s.email}</td>
                          <td className="px-6 py-4 text-center">{s.entries}</td>
                          <td className="px-6 py-4 text-center">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                s.status === "Active"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : s.status === "On break"
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-gray-100 text-gray-700"
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

                <div className="px-4 py-3 text-sm text-emerald-600 bg-emerald-50">
                  Showing {staffData.length} guard members
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <Users className="w-12 h-12 text-emerald-300 mb-4" />
                <p className="text-emerald-600">No Guard data available</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default SupervisorDashboard;