"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  Clock,
  Building2,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
// import Sidebar from "@/components/admin/Sidebar";

export default function Dashboard() {
  const [activeView, setActiveView] = useState("daily");

  return (
    <div className="flex h-screen bg-gray-50">
      {/* <Sidebar /> */}

      <div className="flex-1 overflow-auto">

        {/* 🔹 TOP NAVBAR (ADDED) */}
        <div className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">
              Today’s deliveries, bay utilization, tenant performance, and
              exceptions at a glance.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-semibold text-gray-700">
              AT
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-800">Alex Tan</p>
              <p className="text-xs text-gray-500">Operations Manager</p>
            </div>
          </div>
        </div>

        {/* 🔹 MAIN CONTENT */}
        <div className="px-8 py-6">
          {/* METRICS */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <MetricCard
              title="Total Deliveries Today"
              subtitle="Includes all tenants and categories"
              icon={TrendingUp}
            />
            <MetricCard
              title="Total Pull-Out Today"
              subtitle="Compared with 7-day average"
              icon={Clock}
            />
            <MetricCard
              title="Data Entry Champion"
              subtitle="Updated every 15 minutes"
              icon={Building2}
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
                  onClick={() => setActiveView(view.toLowerCase())}
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

          {/* BAYS + COMPANIES */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <Card
              title="Busiest Loading Bays Today"
              subtitle="Ranked A–C · Last 24 hours"
            >
              <EmptyState text="Bay activity data will appear here" />
            </Card>

            <Card
              title="Most Frequent Delivery Companies"
              subtitle="Top 5 · Scheduled + Walk-ins"
            >
              <EmptyState text="Company visit data will appear here" />
            </Card>
          </div>

          {/* TENANTS */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <Card title="Top Tenants (All Deliveries)">
              <EmptyState text="Tenant delivery statistics will appear here" />
            </Card>

            <Card title="Top Tenants (Food & Beverage)">
              <EmptyState text="F&B tenant data will appear here" />
            </Card>
          </div>

          {/* STAFF FLOW + ALERTS */}
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

              <AlertItem title="High queue length at loading bay" />
              <AlertItem title="Unmatched pull-out record" />
              <AlertItem title="High pull-out ratio for F&B" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- COMPONENTS ---------------- */

function MetricCard({ title, subtitle, icon: Icon }) {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <p className="text-gray-500 text-sm font-medium">{title}</p>
        <Icon className="text-emerald-600" size={20} />
      </div>

      <h3 className="text-3xl font-bold text-gray-300">—</h3>

      <p className="text-gray-400 text-sm mt-1">{subtitle}</p>
    </div>
  );
}

function Card({ title, subtitle, children }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-bold text-gray-800">{title}</h3>
        {subtitle && (
          <span className="text-sm text-gray-400">{subtitle}</span>
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
      <AlertCircle className="text-emerald-600 mt-1" size={18} />
      <div className="flex-1">
        <p className="text-gray-800 font-medium">{title}</p>
        <p className="text-gray-500 text-sm mt-1">
          Real-time alert data will be populated from system logs
        </p>
      </div>
      <ChevronRight className="text-gray-400" size={18} />
    </div>
  );
}
