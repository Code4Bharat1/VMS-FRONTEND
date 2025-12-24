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

        {/* ================= HEADER ================= */}
        <div className="bg-white border-b px-6 py-4">
          <div className="flex flex-col lg:flex-row justify-between gap-4">
            <div>
              <h1 className="text-[22px] font-semibold text-gray-800">
                Dashboard
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Today’s deliveries, bay utilization and staff performance
              </p>
            </div>

            <div className="flex gap-2 bg-gray-100 p-1 rounded-lg w-fit">
              {["Daily", "Weekly", "Monthly"].map((view) => (
                <button
                  key={view}
                  onClick={() => setActiveView(view.toLowerCase())}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition ${
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
        <div className="px-6 py-6">

          {/* ================= STATS ================= */}
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

          {/* ================= MAIN GRID ================= */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

            {/* BUSIEST BAYS */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6 transition hover:shadow-md">
              <h3 className="text-[16px] font-semibold mb-5 text-gray-800">
                Busiest Loading Bays
              </h3>

              {dashboard?.busiestBays?.length ? (
                dashboard.busiestBays.map((bay, index) => (
                  <div key={bay.bayName} className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-gray-100 text-xs flex items-center justify-center font-medium">
                          {index + 1}
                        </span>
                        <span className="font-medium">
                          {bay.bayName}
                        </span>
                      </div>
                      <span className="text-gray-500">{bay.count}</span>
                    </div>

                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 transition-all"
                        style={{
                          width: `${
                            (bay.count /
                              dashboard.busiestBays[0].count) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState text="No bay activity data yet" />
              )}
            </div>

            {/* STAFF BY BAY */}
            <div className="bg-white rounded-2xl shadow-sm p-6 transition hover:shadow-md">
              <h3 className="text-[16px] font-semibold mb-4 text-gray-800">
                Staff Assigned by Bay
              </h3>

              {dashboard?.staffByBay?.length ? (
                dashboard.staffByBay.map((bay) => (
                  <div key={bay.bayName} className="mb-5">
                    <p className="font-medium mb-1">{bay.bayName}</p>
                    <p className="text-xs text-gray-400 mb-2">
                      {bay.staff.length} staff assigned
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {bay.staff.map((s) => (
                        <span
                          key={s._id}
                          className="px-3 py-1 text-sm bg-emerald-50 text-emerald-700 rounded-full"
                        >
                          {s.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState text="No staff assigned yet" />
              )}
            </div>
          </div>

          {/* ================= ACTIVITY + ALERTS ================= */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6 transition hover:shadow-md">
              <h3 className="text-[16px] font-semibold mb-3">
                Staff Activity Flow
              </h3>

              <div className="h-[220px] flex flex-col items-center justify-center border border-dashed rounded-lg text-gray-400">
                <Clock size={28} className="mb-2" />
                <p className="font-medium">
                  Activity tracking enabled
                </p>
                <p className="text-xs mt-1">
                  Data will appear as activity increases
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6 transition hover:shadow-md">
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

/* ================= UI COMPONENTS ================= */

const Stat = ({ title, value, icon: Icon }) => (
  <div className="bg-white rounded-2xl shadow-sm p-6 transition-all hover:-translate-y-0.5 hover:shadow-md">
    <div className="flex items-center justify-between mb-4">
      <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
        <Icon size={18} className="text-emerald-600" />
      </div>
      <span className="text-xs text-gray-400 uppercase tracking-wide">
        Live
      </span>
    </div>

    <p className="text-sm text-gray-500 mb-1">{title}</p>
    <p className="text-[28px] font-semibold text-gray-900">
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
  <div className="group flex items-start gap-4 p-4 bg-gray-50 rounded-lg mb-3 transition hover:bg-emerald-50">
    <AlertCircle
      size={18}
      className="text-emerald-600 mt-1 group-hover:scale-110 transition"
    />
    <div className="flex-1">
      <p className="font-medium text-gray-800">{title}</p>
      <p className="text-sm text-gray-500 mt-1">
        Generated from system activity logs
      </p>
    </div>
    <ChevronRight
      size={18}
      className="text-gray-400 group-hover:text-emerald-600 transition"
    />
  </div>
);
