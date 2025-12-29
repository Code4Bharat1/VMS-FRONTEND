"use client";

import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import {
  Users,
  UserCheck,
  UserX,
  Shield,
} from "lucide-react";

/* ================= HELPERS ================= */

const getWeeklyEntryData = (entries) => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const weekMap = {
    Sun: 0,
    Mon: 0,
    Tue: 0,
    Wed: 0,
    Thu: 0,
    Fri: 0,
    Sat: 0,
  };

  const last7Days = new Date();
  last7Days.setDate(last7Days.getDate() - 6);

  entries.forEach((e) => {
    const date = new Date(e.createdAt);
    if (date >= last7Days) {
      const day = days[date.getDay()];
      weekMap[day]++;
    }
  });

  return days.map((d) => ({
    day: d,
    value: weekMap[d],
    active: ["Mon", "Tue", "Wed", "Thu", "Fri"].includes(d),
  }));
};

const getDistributionData = ({ staff, supervisors, entries }) => {
  const staffCount = staff.length;
  const supervisorCount = supervisors.length;
  const visitorCount = entries.length;

  const total = staffCount + supervisorCount + visitorCount;

  return {
    total,
    segments: [
      { label: "Staff Members", value: staffCount, color: "#22c55e" },
      { label: "Visitors", value: visitorCount, color: "#86efac" },
      { label: "Supervisors", value: supervisorCount, color: "#a7f3d0" },
    ],
  };
};

/* ================= MAIN ================= */

export default function Dashboard() {
  const [staff, setStaff] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

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

      const [staffRes, supervisorRes, entryRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/staff`, { headers }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/supervisors`, { headers }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/entries`, { headers }),
      ]);

      setStaff(staffRes.data.staff || []);
      setSupervisors(supervisorRes.data.supervisors || []);
      setEntries(entryRes.data.entries || []);

      setLoading(false);
    } catch (err) {
      console.error("Dashboard fetch failed", err);
      setLoading(false);
    }
  };

  /* ================= METRICS ================= */

  const totalStaff = staff.length;
  const activeStaff = staff.filter((s) => s.isActive).length;
  const inactiveStaff = totalStaff - activeStaff;

  const activeSupervisors = supervisors.filter((s) => s.isActive).length;

  const weeklyData = getWeeklyEntryData(entries);
  const distributionData = getDistributionData({
    staff,
    supervisors,
    entries,
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-teal-100">
        <div className="animate-spin h-12 w-12 border-4 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-teal-50">
      {/* HEADER */}
      <div className="bg-white shadow-sm px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-800">
          Admin Dashboard
        </h1>
        <p className="text-sm text-gray-500">
          Real-time visitor & staff analytics
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6">
        <Stat title="Total Staff" value={totalStaff} icon={Users} />
        <Stat title="Active Staff" value={activeStaff} icon={UserCheck} />
        <Stat title="Inactive Staff" value={inactiveStaff} icon={UserX} />
        <Stat
          title="Supervisors"
          value={`${activeSupervisors}/${supervisors.length}`}
          icon={Shield}
        />
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-6">
        <div className="lg:col-span-2">
          <WeeklyBarChart data={weeklyData} />
        </div>

        <DistributionDonut
          total={distributionData.total}
          segments={distributionData.segments}
        />
      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

const Stat = ({ title, value, icon: Icon }) => (
  <div className="bg-white rounded-2xl shadow-sm p-6">
    <div className="flex justify-between mb-2">
      <Icon className="text-emerald-600" />
      <span className="text-xs text-emerald-600">Live</span>
    </div>
    <p className="text-gray-500 text-sm">{title}</p>
    <p className="text-3xl font-bold text-gray-800">{value}</p>
  </div>
);

/* ---------- BAR CHART ---------- */

const WeeklyBarChart = ({ data }) => {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <div className="flex justify-between mb-4">
        <div>
          <h3 className="font-semibold">Visitor Traffic Trends</h3>
          <p className="text-xs text-gray-500">
            Visitors checked in over last 7 days
          </p>
        </div>
        <span className="text-xs px-2 py-1 rounded">Weekly</span>
      </div>

      <div className="flex items-end gap-4 h-44">
        {data.map((d) => (
          <div key={d.day} className="flex flex-col items-center w-full">
            <div className="h-full flex items-end">
              <div
                className={`w-8 rounded-md ${
                  d.active ? "bg-emerald-500" : "bg-gray-200"
                }`}
                style={{ height: `${(d.value / max) * 100}%` }}
              />
            </div>
            <span className="mt-2 text-xs text-gray-500">{d.day}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ---------- DONUT CHART ---------- */

const DistributionDonut = ({ total, segments }) => {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="bg-white rounded-2xl shadow shadow-sm p-6">
      <h3 className="font-semibold mb-4">Total Distribution</h3>

      <div className="flex items-center gap-6">
        <svg width="120" height="120" viewBox="0 0 120 120">
          <g transform="rotate(-90 60 60)">
            {segments.map((s, i) => {
              const dash = (s.value / total) * circumference;
              const el = (
                <circle
                  key={i}
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="none"
                  stroke={s.color}
                  strokeWidth="10"
                  strokeDasharray={`${dash} ${circumference}`}
                  strokeDashoffset={-offset}
                />
              );
              offset += dash;
              return el;
            })}
          </g>

          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dy="-2"
            className="text-xl font-bold fill-gray-800"
          >
            {total}
          </text>
          <text
            x="50%"
            y="50%"
            dy="14"
            textAnchor="middle"
            className="text-xs fill-gray-500"
          >
            Total Entries
          </text>
        </svg>

        <div className="space-y-2 w-full">
          {segments.map((s) => (
            <div key={s.label} className="flex items-center text-sm">
              <span
                className="w-3 h-3 rounded-full mr-2"
                style={{ background: s.color }}
              />
              <span className="text-gray-600">{s.label}</span>
              <span className="ml-auto font-medium">
                {Math.round((s.value / total) * 100)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
