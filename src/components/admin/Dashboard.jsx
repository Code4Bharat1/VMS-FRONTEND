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

  /* ---------------- FRONTEND-ONLY DASHBOARD BUILD ---------------- */
  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem("token");

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

      /* ---------------- BUSIEST BAYS ---------------- */
      const bayUsageMap = {};

      entries.forEach((entry) => {
        if (!entry.bayId) return;
        bayUsageMap[entry.bayId] = (bayUsageMap[entry.bayId] || 0) + 1;
      });

      const busiestBays = Object.entries(bayUsageMap)
        .map(([bayId, count]) => {
          const bay = bays.find((b) => b._id === bayId);
          return {
            bayName: bay?.bayName || "Unknown",
            count,
          };
        })
        .sort((a, b) => b.count - a.count);

      /* ---------------- STAFF BY BAY ---------------- */
      const staffByBayMap = {};

      staff.forEach((s) => {
        if (!s.assignedBay) return;

        if (!staffByBayMap[s.assignedBay]) {
          staffByBayMap[s.assignedBay] = [];
        }

        staffByBayMap[s.assignedBay].push({
          _id: s._id,
          name: s.name,
        });
      });

      const staffByBay = Object.entries(staffByBayMap).map(
        ([bayName, staff]) => ({
          _id: bayName,
          staff,
        })
      );

      /* ---------------- FINAL DASHBOARD STATE ---------------- */
      setDashboard({
        busiestBays,
        staffByBay,
      });
    } catch (err) {
      console.error("Dashboard fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 overflow-auto">
        {/* TOP BAR */}
        <div className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">
              Today’s deliveries, bay utilization, tenant performance,
              and exceptions at a glance.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-semibold text-gray-700">
              AT
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-800">
                Alex Tan
              </p>
              <p className="text-xs text-gray-500">
                Operations Manager
              </p>
            </div>
          </div>
        </div>

        {/* MAIN */}
        <div className="px-8 py-6">
          {/* METRICS */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <MetricCard
              title="Most Used Bay Today"
              subtitle="Based on total entries"
              icon={TrendingUp}
              value={
                loading
                  ? "—"
                  : dashboard?.busiestBays?.[0]?.bayName || "—"
              }
            />

            <MetricCard
              title="Entries in Top Bay"
              subtitle="Total usage count"
              icon={Clock}
              value={
                loading
                  ? "—"
                  : dashboard?.busiestBays?.[0]?.count ?? "—"
              }
            />

            <MetricCard
              title="Active Bays"
              subtitle="Currently operational"
              icon={Building2}
              value={
                loading
                  ? "—"
                  : dashboard?.busiestBays?.length ?? "—"
              }
            />
          </div>

          {/* VIEW TOGGLE */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Operational Overview
              </h2>
              <p className="text-gray-500 text-sm">
                Live system-wide performance snapshot.
              </p>
            </div>

            <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
              {["Daily", "Weekly", "Monthly"].map((view) => (
                <button
                  key={view}
                  onClick={() =>
                    setActiveView(view.toLowerCase())
                  }
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    activeView === view.toLowerCase()
                      ? "bg-white text-emerald-700 shadow-sm"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  {view}
                </button>
              ))}
            </div>
          </div>

          {/* BAYS + STAFF */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <Card
              title="Busiest Loading Bays Today"
              subtitle="Ranked · Based on usage"
            >
              {dashboard?.busiestBays?.length ? (
                dashboard.busiestBays.map((bay) => (
                  <div
                    key={bay.bayName}
                    className="flex justify-between py-2 border-b last:border-none text-sm"
                  >
                    <span>{bay.bayName}</span>
                    <span className="font-semibold">
                      {bay.count}
                    </span>
                  </div>
                ))
              ) : (
                <EmptyState text="No bay activity data yet" />
              )}
            </Card>

            <Card title="Staff Assigned by Bay">
              {dashboard?.staffByBay?.length ? (
                dashboard.staffByBay.map((bay) => (
                  <div key={bay._id} className="mb-4">
                    <p className="font-semibold text-gray-800 mb-1">
                      {bay._id}
                    </p>
                    <div className="pl-3 text-sm text-gray-600 space-y-1">
                      {bay.staff.map((s) => (
                        <p key={s._id}>• {s.name}</p>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState text="No staff assigned yet" />
              )}
            </Card>
          </div>

          {/* ALERTS */}
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-3">
                Staff Activity Flow
              </h3>

              <div className="h-[220px] flex items-center justify-center border border-dashed rounded-lg text-gray-400">
                Staff activity chart will be rendered here
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
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

/* ---------------- COMPONENTS (UNCHANGED) ---------------- */

function MetricCard({ title, subtitle, icon: Icon, value }) {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <p className="text-gray-500 text-sm font-medium">
          {title}
        </p>
        <Icon className="text-emerald-600" size={20} />
      </div>

      <h3 className="text-3xl font-bold text-gray-800">
        {value}
      </h3>

      <p className="text-gray-400 text-sm mt-1">
        {subtitle}
      </p>
    </div>
  );
}

function Card({ title, subtitle, children }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-bold text-gray-800">
          {title}
        </h3>
        {subtitle && (
          <span className="text-sm text-gray-400">
            {subtitle}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="h-[140px] flex items-center justify-center text-gray-400 text-sm border border-dashed rounded-lg">
      {text}
    </div>
  );
}

function AlertItem({ title }) {
  return (
    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg mb-3 hover:bg-gray-100 transition-colors">
      <AlertCircle
        className="text-emerald-600 mt-1"
        size={18}
      />
      <div className="flex-1">
        <p className="text-gray-800 font-medium">
          {title}
        </p>
        <p className="text-gray-500 text-sm mt-1">
          Generated from system activity logs
        </p>
      </div>
      <ChevronRight
        className="text-gray-400"
        size={18}
      />
    </div>
  );
}
