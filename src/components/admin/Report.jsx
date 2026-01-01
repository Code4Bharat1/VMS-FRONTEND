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
    <div className="flex min-h-screen bg-emerald-50/60 text-[14px] text-emerald-700">
      <div className="flex-1 overflow-x-hidden">
        {/* ================= HEADER ================= */}
        <div className="bg-white border-b border-emerald-200 px-4 sm:px-6 lg:px-8 py-4 sticky top-0 z-40">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-[18px] sm:text-[22px] font-bold text-emerald-800">
                Reporting Dashboard
              </h1>
              <p className="text-sm text-emerald-600 mt-1">
                Overview of visitors, staff performance and bay operations
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium">
                Export PDF
              </button>
              <button className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium">
                Export Excel
              </button>
            </div>
          </div>
        </div>

        {/* ================= CONTENT ================= */}
        <div className="px-4 sm:px-6 lg:px-8 py-5 space-y-6">
          {/* ================= REPORT TYPE ================= */}
          <div className="flex gap-2 flex-wrap">
            <Tab
              active={reportType === "daily"}
              onClick={() => setReportType("daily")}
            >
              Daily report
            </Tab>
            <Tab
              active={reportType === "weekly"}
              onClick={() => setReportType("weekly")}
            >
              Weekly report
            </Tab>
          </div>

          {/* ================= FILTER BAR ================= */}
          <div className="flex flex-wrap gap-2">
            <Filter label="Date range" value="01 Sep 2025 – 07 Sep 2025" />
            <Filter label="Staff" value="All staff" />
            <Filter label="Tenant" value="All tenants" />
            <Filter label="Bay" value="All bays" />
            <button className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium">
              Advanced filters
            </button>
          </div>

          {/* ================= METRICS ================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <Metric
              title="Total visitors in range"
              value={summary.totalVisitors}
            />
            <Metric
              title="Tenant deliveries"
              value={summary.tenantDeliveries}
            />
            <Metric
              title="Avg. bay processing time"
              value={summary.avgProcessingTime}
            />
            <Metric title="Active staff on duty" value={summary.activeStaff} />
          </div>

          {/* ================= CHARTS SECTION ================= */}
          <div className="bg-emerald-50 rounded-2xl p-3 sm:p-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="lg:col-span-2 bg-white rounded-xl border border-emerald-200 p-4 sm:p-6">
                <h3 className="text-[15px] sm:text-lg font-semibold text-emerald-800 mb-3">
                  Deliveries trend
                </h3>

                <div
                  className="
                    h-[120px] sm:h-[180px]
                    bg-emerald-50 rounded-lg
                    flex items-center justify-center
                    text-emerald-400 text-sm
                  "
                >
                  Aggregation query based chart
                </div>
              </div>

              <div className="bg-white rounded-xl border border-emerald-200 p-4 sm:p-6">
                <h3 className="text-[15px] sm:text-lg font-semibold text-emerald-800 mb-3">
                  Bay distribution
                </h3>

                <div
                  className="
                    h-[120px] sm:h-[180px]
                    bg-emerald-50 rounded-lg
                    flex items-center justify-center
                    text-emerald-400 text-sm
                  "
                >
                  Bay-wise percentage data
                </div>
              </div>
            </div>
          </div>

          {/* ================= LOG TABLE ================= */}
          <div className="bg-white rounded-xl border border-emerald-200 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between gap-2 mb-4">
              <h3 className="text-[15px] sm:text-lg font-semibold text-emerald-800">
                Detailed activity log
              </h3>
              <span className="text-sm text-emerald-500">
                Includes bays A, B, C
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-[900px] w-full text-sm">
                <thead className="bg-emerald-50 border-b border-emerald-200">
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
                        className="px-4 py-3 text-left font-semibold text-emerald-700"
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
                        className="text-center py-8 text-emerald-400"
                      >
                        Records will appear here from database query
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between gap-4 mt-4 text-sm text-emerald-600">
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
    <div
      className="
        bg-white border border-emerald-200 rounded-xl
        p-4 sm:p-5
        flex flex-col justify-between
        min-h-[96px]
      "
    >
      <p className="text-[13px] sm:text-sm text-emerald-600 leading-tight">
        {title}
      </p>
      <p className="text-[22px] sm:text-2xl font-bold text-emerald-800 mt-2">
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
        active ? "bg-emerald-600 text-white" : "bg-emerald-50 text-emerald-700"
      }`}
    >
      {children}
    </button>
  );
}

function Filter({ label, value }) {
  return (
    <div className="bg-white border border-emerald-200 px-4 py-2 rounded-lg text-sm">
      <span className="text-emerald-500">{label}: </span>
      <span className="font-medium text-emerald-800">{value}</span>
    </div>
  );
}
