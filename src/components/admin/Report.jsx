"use client";

import { useEffect, useState } from "react";

/* ---------------- PLACEHOLDER QUERY FUNCTIONS ---------------- */

async function fetchSummaryMetrics() {
  return {
    totalVisitors: null,
    tenantDeliveries: null,
    avgProcessingTime: null,
    activeStaff: null,
  };
}

async function fetchTrendData() {
  return [];
}

async function fetchBayDistribution() {
  return [];
}

async function fetchActivityLogs() {
  return [];
}

/* ---------------- PAGE ---------------- */

export default function ReportsDashboard() {
  const [summary, setSummary] = useState({});
  const [trend, setTrend] = useState([]);
  const [bayData, setBayData] = useState([]);
  const [logs, setLogs] = useState([]);
  const [reportType, setReportType] = useState("daily");

  useEffect(() => {
    async function loadData() {
      setSummary(await fetchSummaryMetrics());
      setTrend(await fetchTrendData());
      setBayData(await fetchBayDistribution());
      setLogs(await fetchActivityLogs());
    }
    loadData();
  }, []);

  return (
    <div className="flex h-screen bg-gray-50 text-[15px] text-gray-700">
      <div className="flex-1 overflow-auto">

        {/* TOP NAVBAR */}
        <div className="bg-white border-b border-gray-200 px-8 py-5
          flex items-center justify-between sticky top-0 z-50">

          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Reporting Dashboard
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Overview of visitors, tenants, staff performance and bay operations.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button className="px-4 py-2 bg-emerald-50 text-emerald-700
              rounded-lg text-sm font-medium">
              Export PDF
            </button>

            <button className="px-4 py-2 bg-emerald-50 text-emerald-700
              rounded-lg text-sm font-medium">
              Export Excel
            </button>

            <div className="flex items-center gap-4 pl-4 border-l border-gray-200">
              <div className="w-10 h-10 rounded-full bg-gray-200
                flex items-center justify-center font-semibold text-gray-700">
                AT
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-800">Alex Tan</p>
                <p className="text-xs text-gray-500">Operations Manager</p>
              </div>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="px-8 py-6 space-y-6">

          {/* REPORT TYPE */}
          <div className="flex gap-2">
            <Tab active={reportType === "daily"} onClick={() => setReportType("daily")}>
              Daily report
            </Tab>
            <Tab active={reportType === "weekly"} onClick={() => setReportType("weekly")}>
              Weekly report
            </Tab>
          </div>

          {/* FILTER BAR */}
          <div className="flex gap-3 flex-wrap">
            <Filter label="Date range" value="01 Sep 2025 – 07 Sep 2025" />
            <Filter label="Staff" value="All staff" />
            <Filter label="Tenant" value="All tenants" />
            <Filter label="Bay" value="All bays" />
            <button className="px-4 py-2 bg-emerald-50 text-emerald-700
              rounded-lg text-sm font-medium">
              Advanced filters
            </button>
          </div>

          {/* METRICS */}
          <div className="grid grid-cols-4 gap-6">
            <Metric title="Total visitors in range" value={summary.totalVisitors} />
            <Metric title="Tenant deliveries" value={summary.tenantDeliveries} />
            <Metric title="Avg. bay processing time" value={summary.avgProcessingTime} />
            <Metric title="Active staff on duty" value={summary.activeStaff} />
          </div>

          {/* CHARTS */}
          <div className="grid grid-cols-3 gap-6">

            <div className="col-span-2 bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex justify-between mb-3">
                <h3 className="text-lg font-bold text-gray-800">
                  Deliveries trend
                </h3>
                <span className="text-sm text-gray-400">
                  Visitors • Tenants
                </span>
              </div>

              <div className="h-[180px] bg-gray-50 rounded-lg
                flex items-center justify-center text-gray-400">
                Aggregation query based chart
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-3">
                Bay distribution
              </h3>

              <div className="h-[180px] bg-gray-50 rounded-lg
                flex items-center justify-center text-gray-400">
                Bay-wise percentage data
              </div>
            </div>
          </div>

          {/* LOG TABLE */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">
                Detailed activity log
              </h3>
              <span className="text-sm text-gray-400">
                Includes bays A, B, C
              </span>
            </div>

            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {[
                    "S.N",
                    "Bay",
                    "Time",
                    "Name",
                    "QID",
                    "VRN",
                    "Mobile",
                    "Purpose",
                    "Destination",
                    "Company",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left font-semibold text-gray-600"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {logs.length === 0 && (
                  <tr>
                    <td
                      colSpan="10"
                      className="text-center py-8 text-gray-400"
                    >
                      Records will appear here from database query
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="flex justify-between mt-4 text-sm text-gray-600">
              <span>Showing 1–5 of 120 records</span>
              <div className="flex gap-2">
                <button>Prev</button>
                <button className="px-3 py-1 bg-emerald-600 text-white rounded">
                  1
                </button>
                <button>2</button>
                <button>3</button>
                <button>Next</button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

/* ---------------- COMPONENTS ---------------- */

function Metric({ title, value }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-800 mt-2">
        {value ?? "—"}
      </p>
    </div>
  );
}

function Tab({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium ${
        active
          ? "bg-emerald-600 text-white"
          : "bg-emerald-50 text-emerald-700"
      }`}
    >
      {children}
    </button>
  );
}

function Filter({ label, value }) {
  return (
    <div className="bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm">
      <span className="text-gray-400">{label}: </span>
      <span className="font-medium text-gray-800">{value}</span>
    </div>
  );
}
