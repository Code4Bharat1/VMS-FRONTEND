"use client";

import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Users, UserCheck, UserX, Shield, Calendar } from "lucide-react";

/* ================= HELPERS ================= */

const getBarGraphData = (entries, timeRange) => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const timeSlots = ["Morning", "Afternoon", "Evening"];

  const chartData = {};
  timeSlots.forEach((slot) => {
    chartData[slot] = {};
    days.forEach((day) => {
      chartData[slot][day] = 0;
    });
  });

  const now = new Date();
  let startDate, endDate;

  switch (timeRange) {
    case "7days":
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
      break;
    case "30days":
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 29);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
      break;
    case "thisMonth":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
      break;
    case "lastMonth":
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0);
      endDate.setHours(23, 59, 59, 999);
      break;
    default:
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
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
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
      break;
    case "30days":
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 29);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
      break;
    case "thisMonth":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
      break;
    case "lastMonth":
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0);
      endDate.setHours(23, 59, 59, 999);
      break;
    default:
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
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
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("7days");

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
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/supervisors`, {
          headers,
        }),
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

  const barGraphData = getBarGraphData(entries, timeRange);
  const distributionData = getDistributionData({
    staff,
    supervisors,
    entries,
    timeRange,
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-50">
        <div className="animate-spin h-12 w-12 border-4 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-emerald-50/60">
      {/* HEADER */}
      <div className="bg-white px-4 sm:px-6 py-4 sm:py-5 border-b border-emerald-100">
        <h1 className="text-xl sm:text-2xl font-semibold text-emerald-800">
          Admin Dashboard
        </h1>
        <p className="text-xs sm:text-sm text-emerald-600">
          Real-time visitor & workforce analytics
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 p-4 sm:p-6">
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 px-4 sm:px-6 pb-4 sm:pb-6">
        <div className="lg:col-span-2">
          <TrafficBarGraph
            data={barGraphData}
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
          />
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
  <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-emerald-100">
    <div className="flex justify-between mb-2 sm:mb-3">
      <Icon className="text-emerald-600 w-5 h-5 sm:w-6 sm:h-6" />
      <span className="text-[10px] sm:text-xs px-2 py-0.5 sm:py-1 rounded-full bg-emerald-100 text-emerald-700">
        Live
      </span>
    </div>
    <p className="text-emerald-600 text-xs sm:text-sm">{title}</p>
    <p className="text-2xl sm:text-3xl font-bold text-emerald-800">{value}</p>
  </div>
);

/* ---------- BAR GRAPH ---------- */

const TrafficBarGraph = ({ data, timeRange, onTimeRangeChange }) => {
  const { timeSlots, days, data: chartData } = data;

  const dayTotals = days.map((day) => {
    return timeSlots.reduce((sum, slot) => sum + chartData[slot][day], 0);
  });

  const maxValue = Math.max(...dayTotals, 1);

  const [hoveredBar, setHoveredBar] = useState(null);

  const timeRangeOptions = [
    { value: "7days", label: "7D", fullLabel: "Last 7 Days" },
    { value: "30days", label: "30D", fullLabel: "Last 30 Days" },
    { value: "thisMonth", label: "This", fullLabel: "This Month" },
    { value: "lastMonth", label: "Last", fullLabel: "Last Month" },
  ];

  const slotColors = {
    Morning: "#4ade80",
    Afternoon: "#22c55e",
    Evening: "#16a34a",
  };

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-emerald-100 shadow-sm">
      <div className="flex flex-col gap-3 mb-4 sm:mb-5">
        <div>
          <h3 className="font-semibold text-emerald-800 text-sm sm:text-base">
            Visitor Traffic Bar Graph
          </h3>
          <p className="text-[10px] sm:text-xs text-emerald-600">
            Entry activity by time period
          </p>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 bg-emerald-50 rounded-lg p-1">
          <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 ml-1 sm:ml-2 flex-shrink-0" />
          {timeRangeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onTimeRangeChange(option.value)}
              className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-[10px] sm:text-xs font-medium transition-all flex-1 sm:flex-none ${
                timeRange === option.value
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-emerald-700 hover:bg-emerald-100"
              }`}
              title={option.fullLabel}
            >
              <span className="sm:hidden">{option.label}</span>
              <span className="hidden sm:inline">{option.fullLabel}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
        <div className="inline-block min-w-full">
          <div className="h-80 sm:h-96 flex items-end justify-around gap-2 sm:gap-4 mb-4 pt-8">
            {days.map((day, dayIndex) => {
              const dayTotal = dayTotals[dayIndex];
              const isHovered = hoveredBar === day;
              const barHeight = dayTotal > 0 ? (dayTotal / maxValue) * 100 : 0;

              return (
                <div
                  key={day}
                  className="flex-1 flex flex-col items-center"
                  onMouseEnter={() => setHoveredBar(day)}
                  onMouseLeave={() => setHoveredBar(null)}
                  onClick={() => setHoveredBar(isHovered ? null : day)}
                >
                  {/* Total badge above bar */}
                  {dayTotal > 0 && (
                    <div className="bg-emerald-800 text-white px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-md text-xs sm:text-sm font-bold mb-2">
                      {dayTotal}
                    </div>
                  )}

                  <div
                    className="w-full relative cursor-pointer transition-all duration-300 rounded-lg shadow-sm"
                    style={{
                      height: `${Math.max(barHeight, 8)}%`,
                      minHeight: dayTotal > 0 ? "60px" : "0px",
                      backgroundColor: isHovered ? "#16a34a" : "#22c55e",
                      transform: isHovered ? "scale(1.05)" : "scale(1)",
                    }}
                  >
                    {/* Tooltip with breakdown */}
                    {isHovered && dayTotal > 0 && (
                      <div className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-4 px-2 sm:px-3 py-1.5 sm:py-2 bg-emerald-800 text-white text-[10px] sm:text-xs rounded-lg whitespace-nowrap shadow-lg">
                        <div className="font-semibold mb-1">{day}</div>
                        {timeSlots.map((slot) => {
                          const value = chartData[slot][day];
                          return value > 0 ? (
                            <div key={slot} className="flex items-center gap-2">
                              <span>
                                {slot}: {value}
                              </span>
                            </div>
                          ) : null;
                        })}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-emerald-800"></div>
                      </div>
                    )}
                  </div>

                  <div className="text-[10px] sm:text-xs font-semibold text-emerald-700 mt-2">
                    <span className="hidden sm:inline">{day}</span>
                    <span className="sm:hidden">{day.slice(0, 3)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
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
    <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-emerald-100 shadow-sm">
      <h3 className="font-semibold mb-3 sm:mb-4 text-emerald-800 text-sm sm:text-base">
        Distribution Overview
      </h3>

      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
        <svg
          width="100"
          height="100"
          viewBox="0 0 120 120"
          className="sm:w-[120px] sm:h-[120px]"
        >
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
            className="text-lg sm:text-xl font-bold fill-emerald-800"
          >
            {total}
          </text>
          <text
            x="50%"
            y="50%"
            dy="14"
            textAnchor="middle"
            className="text-[10px] sm:text-xs fill-emerald-600"
          >
            Total Records
          </text>
        </svg>

        <div className="space-y-2 sm:space-y-3 w-full">
          {segments.map((s) => (
            <div key={s.label} className="flex items-center text-xs sm:text-sm">
              <span
                className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full mr-2 flex-shrink-0"
                style={{ background: s.color }}
              />
              <span className="text-emerald-700 text-xs sm:text-sm">
                {s.label}
              </span>
              <span className="ml-auto font-semibold text-emerald-800 text-xs sm:text-sm">
                {Math.round((s.value / total) * 100)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
