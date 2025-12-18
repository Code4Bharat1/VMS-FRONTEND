"use client";

import { useEffect, useState } from "react";

/* ---------------- PLACEHOLDER QUERY FUNCTIONS ---------------- */
/* Replace these with real API / MongoDB aggregation later */

async function fetchSummaryMetrics() {
  // Example MongoDB aggregation:
  // db.entries.aggregate([{ $match: { date: { $gte, $lte } } }, { $count: "total" }])
  return {
    totalVisitors: null,
    tenantDeliveries: null,
    avgProcessingTime: null,
    activeStaff: null,
  };
}

async function fetchTrendData() {
  // db.entries.aggregate([{ $group: { _id: "$date", count: { $sum: 1 } } }])
  return [];
}

async function fetchBayDistribution() {
  // db.entries.aggregate([{ $group: { _id: "$bay", count: { $sum: 1 } } }])
  return [];
}

async function fetchActivityLogs() {
  // db.entries.find().sort({ time: -1 }).limit(100)
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
    <div className="min-h-screen flex bg-[#f6f8fb] text-[14px] text-gray-700">
  

      <main className="flex-1 ml-4 p-6 space-y-6">

        {/* HEADER */}
        <div className="flex justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Reporting Dashboard</h1>
            <p className="text-gray-500">
              Overview of visitors, tenants, staff performance and bay operations across selected period.
            </p>
          </div>

          <div className="flex gap-2">
            <button className="px-3 py-1.5 bg-green-100 text-green-700 rounded-md">
              Export PDF
            </button>
            <button className="px-3 py-1.5 bg-green-100 text-green-700 rounded-md">
              Export Excel
            </button>
          </div>
        </div>

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
          <button className="px-3 py-1.5 bg-green-100 text-green-700 rounded-md">
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

          {/* TREND */}
          <div className="col-span-2 bg-white rounded-xl p-4">
            <div className="flex justify-between mb-2">
              <h3 className="font-semibold">Deliveries trend</h3>
              <span className="text-sm text-gray-400">Visitors • Tenants</span>
            </div>

            {/* Chart placeholder */}
            <div className="h-[160px] bg-[#f6f8fb] rounded-md flex items-center justify-center text-gray-400">
              Data from aggregation query (daily count)
            </div>

            <div className="flex gap-4 mt-2 text-sm text-gray-500">
              <span>● Deliveries</span>
              <span>● Pull-outs</span>
              <span>● 7-day moving average</span>
            </div>
          </div>

          {/* BAY DISTRIBUTION */}
          <div className="bg-white rounded-xl p-4">
            <h3 className="font-semibold mb-2">Bay distribution & top companies</h3>

            <div className="h-[160px] bg-[#f6f8fb] rounded-md flex items-center justify-center text-gray-400">
              Bay-wise % distribution query
            </div>

            <div className="mt-3 text-sm text-gray-500">
              Bay A • Bay B • Bay C
            </div>
          </div>
        </div>

        {/* LOG TABLE */}
        <div className="bg-white rounded-xl p-4">
          <div className="flex justify-between mb-2">
            <h3 className="font-semibold">Detailed activity log</h3>
            <span className="text-sm text-gray-400">Includes all bays A, B, C</span>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500">
                <th>S.N</th>
                <th>Loading Bay</th>
                <th>Time</th>
                <th>Name</th>
                <th>QID</th>
                <th>VRN</th>
                <th>Mobile</th>
                <th>Purpose</th>
                <th>Destination</th>
                <th>Company</th>
              </tr>
            </thead>

            <tbody>
              {logs.length === 0 && (
                <tr>
                  <td colSpan="10" className="text-center py-6 text-gray-400">
                    Records will appear here from database query
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="flex justify-between mt-3 text-sm text-gray-400">
            <span>Showing 1–5 of 120 records</span>
            <div className="flex gap-2">
              <button>Prev</button>
              <button className="px-2 bg-green-600 text-white rounded">1</button>
              <button>2</button>
              <button>3</button>
              <button>Next</button>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}

/* ---------------- COMPONENTS ---------------- */

function Metric({ title, value }) {
  return (
    <div className="bg-white rounded-xl p-4">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-semibold mt-2">
        {value ?? "—"}
      </p>
    </div>
  );
}

function Tab({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-1.5 rounded-full text-sm ${
        active
          ? "bg-green-600 text-white"
          : "bg-green-100 text-green-700"
      }`}
    >
      {children}
    </button>
  );
}

function Filter({ label, value }) {
  return (
    <div className="bg-white px-3 py-1.5 rounded-md text-sm">
      <span className="text-gray-400">{label}: </span>
      <span>{value}</span>
    </div>
  );
}
