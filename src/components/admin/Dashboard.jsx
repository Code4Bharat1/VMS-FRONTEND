"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  TrendingUp,
  Clock,
  Building2,
  AlertCircle,
  ChevronRight,
} from "lucide-react";

export default function Dashboard() {
  const [activeView, setActiveView] = useState("daily");
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  /* ================= DATA LOGIC (UNCHANGED) ================= */
  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      const [entriesRes, baysRes, staffRes] = await Promise.all([
        axios.get("http://localhost:5000/api/v1/entries", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5000/api/v1/bays", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5000/api/v1/staff", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const entries = entriesRes.data.entries || [];
      const bays = baysRes.data.bays || [];
      const staff = staffRes.data.staff || staffRes.data || [];

      const bayMap = {};
      bays.forEach((b) => (bayMap[b._id] = b.bayName));

      const bayUsageMap = {};
      entries.forEach((entry) => {
        if (!entry.bayId) return;
        const bayId =
          typeof entry.bayId === "object" ? entry.bayId._id : entry.bayId;
        bayUsageMap[bayId] = (bayUsageMap[bayId] || 0) + 1;
      });

      const busiestBays = Object.entries(bayUsageMap)
        .map(([bayId, count]) => ({
          bayName: bayMap[bayId] || "Unknown",
          count,
        }))
        .sort((a, b) => b.count - a.count);

      const staffByBayMap = {};
      staff.forEach((s) => {
        if (!s.assignedBay) return;

        const bayId =
          typeof s.assignedBay === "object"
            ? s.assignedBay._id
            : s.assignedBay;

        if (!staffByBayMap[bayId]) {
          staffByBayMap[bayId] = {
            bayName: bayMap[bayId] || "Unknown",
            staff: [],
          };
        }

        staffByBayMap[bayId].staff.push({
          _id: s._id,
          name: s.name,
        });
      });

      setDashboard({
        busiestBays,
        staffByBay: Object.values(staffByBayMap),
      });
    } catch (err) {
      console.error("Dashboard fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex-1 overflow-x-hidden">

        {/* ================= HEADER (MATCHED) ================= */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-[18px] sm:text-[22px] font-semibold text-gray-800">
                Dashboard
              </h1>
              <p className="text-[13px] sm:text-[14px] text-gray-500 mt-1">
                Today’s deliveries, bay utilization and staff performance
              </p>
            </div>

            {/* VIEW TOGGLE */}
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
        </div>

        {/* ================= CONTENT ================= */}
        <div className="px-4 sm:px-6 lg:px-8 py-6">

          {/* ================= STATS (MATCHED) ================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Stat
              title="Most Used Bay Today"
              value={
                loading
                  ? "—"
                  : dashboard?.busiestBays?.[0]?.bayName || "—"
              }
              icon={TrendingUp}
            />
            <Stat
              title="Entries in Top Bay"
              value={
                loading
                  ? "—"
                  : dashboard?.busiestBays?.[0]?.count ?? "—"
              }
              icon={Clock}
            />
            <Stat
              title="Active Bays"
              value={
                loading
                  ? "—"
                  : dashboard?.busiestBays?.length ?? "—"
              }
              icon={Building2}
            />
          </div>

          {/* ================= TABLE + DETAILS (MATCHED GRID) ================= */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

            {/* BUSIEST BAYS */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-[16px] font-semibold mb-4 text-gray-800">
                Busiest Loading Bays
              </h3>

              {dashboard?.busiestBays?.length ? (
                dashboard.busiestBays.map((bay) => (
                  <div
                    key={bay.bayName}
                    className="flex justify-between py-3 border-b last:border-none text-[14px]"
                  >
                    <span>{bay.bayName}</span>
                    <span className="font-medium">{bay.count}</span>
                  </div>
                ))
              ) : (
                <EmptyState text="No bay activity data yet" />
              )}
            </div>

            {/* STAFF BY BAY */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-[16px] font-semibold mb-4 text-gray-800">
                Staff Assigned by Bay
              </h3>

              {dashboard?.staffByBay?.length ? (
                dashboard.staffByBay.map((bay) => (
                  <div key={bay.bayName} className="mb-4">
                    <p className="font-medium text-gray-800 mb-1">
                      {bay.bayName}
                    </p>
                    <div className="pl-3 text-[13px] text-gray-600 space-y-1">
                      {bay.staff.map((s) => (
                        <p key={s._id}>• {s.name}</p>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState text="No staff assigned yet" />
              )}
            </div>
          </div>

          {/* ================= ALERTS ================= */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-[16px] font-semibold mb-3">
                Staff Activity Flow
              </h3>
              <div className="h-[220px] flex items-center justify-center border border-dashed rounded-lg text-gray-400 text-[14px]">
                Staff activity chart will be rendered here
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-[16px] font-semibold mb-4">
                Alerts & Exceptions
              </h3>
              <AlertItem title="High queue length detected" />
              <AlertItem title="Unmatched pull-out record" />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

/* ================= UI COMPONENTS (MATCHED) ================= */

const Stat = ({ title, value, icon: Icon }) => (
  <div className="bg-white rounded-2xl shadow-sm p-6">
    <div className="flex justify-between mb-2">
      <p className="text-[14px] text-gray-500">{title}</p>
      <Icon size={18} className="text-emerald-600" />
    </div>
    <p className="text-[26px] font-semibold text-gray-900">
      {value}
    </p>
  </div>
);

const EmptyState = ({ text }) => (
  <div className="h-[140px] flex items-center justify-center text-gray-400 text-sm border border-dashed rounded-lg">
    {text}
  </div>
);

const AlertItem = ({ title }) => (
  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg mb-3">
    <AlertCircle size={18} className="text-emerald-600 mt-1" />
    <div className="flex-1">
      <p className="font-medium text-gray-800">{title}</p>
      <p className="text-[13px] text-gray-500 mt-1">
        Generated from system activity logs
      </p>
    </div>
    <ChevronRight size={18} className="text-gray-400" />
  </div>
);
