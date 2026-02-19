"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  Shield,
  User,
  Car,
  Settings,
  AlertTriangle,
  Search,
  Trash2,
  Clock,
  Activity,
  Filter,
  ChevronDown,
  FileText,
  Users,
  X,
  Download,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const MODULE_ICONS = {
  AUTH: Shield,
  USER: User,
  ENTRY: Car,
  BAY: Settings,
  SECURITY: AlertTriangle,
  STAFF: Users,
  SUPERVISOR: User,
  VENDOR: Settings,
};

const MODULE_COLORS = {
  AUTH:       { bg: "bg-blue-50",    icon: "text-blue-500",    badge: "bg-blue-100 text-blue-700" },
  USER:       { bg: "bg-purple-50",  icon: "text-purple-500",  badge: "bg-purple-100 text-purple-700" },
  ENTRY:      { bg: "bg-emerald-50", icon: "text-emerald-600", badge: "bg-emerald-100 text-emerald-700" },
  BAY:        { bg: "bg-amber-50",   icon: "text-amber-500",   badge: "bg-amber-100 text-amber-700" },
  SECURITY:   { bg: "bg-red-50",     icon: "text-red-500",     badge: "bg-red-100 text-red-700" },
  STAFF:      { bg: "bg-teal-50",    icon: "text-teal-600",    badge: "bg-teal-100 text-teal-700" },
  SUPERVISOR: { bg: "bg-indigo-50",  icon: "text-indigo-500",  badge: "bg-indigo-100 text-indigo-700" },
  VENDOR:     { bg: "bg-orange-50",  icon: "text-orange-500",  badge: "bg-orange-100 text-orange-700" },
};

const DEFAULT_COLOR = { bg: "bg-emerald-50", icon: "text-emerald-600", badge: "bg-emerald-100 text-emerald-700" };

function formatTime(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return date.toLocaleDateString("en-GB");
}

function formatFullTime(dateStr) {
  return new Date(dateStr).toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [module, setModule] = useState("all");
  const [clearing, setClearing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const LOGS_PER_PAGE = 10;

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("accessToken")
      : null;

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/logs`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLogs(res.data.logs || []);
    } catch (err) {
      console.error("Failed to load logs", err);
    } finally {
      setLoading(false);
    }
  };

  const clearLogs = async () => {
    if (!confirm("Are you sure you want to clear all logs?")) return;
    try {
      setClearing(true);
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/logs/clear`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLogs([]);
    } catch (err) {
      alert("Failed to clear logs");
    } finally {
      setClearing(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchSearch =
      log.description?.toLowerCase().includes(search.toLowerCase()) ||
      log.actor?.name?.toLowerCase().includes(search.toLowerCase());
    const matchModule = module === "all" || log.module === module;
    const logDate = new Date(log.createdAt);
    const matchFrom = !dateFrom || logDate >= new Date(dateFrom + "T00:00:00");
    const matchTo   = !dateTo   || logDate <= new Date(dateTo   + "T23:59:59");
    return matchSearch && matchModule && matchFrom && matchTo;
  });

  // Reset to page 1 whenever filters change
  useEffect(() => { setPage(1); }, [search, module, dateFrom, dateTo]);

  const totalPages = Math.ceil(filteredLogs.length / LOGS_PER_PAGE);
  const paginatedLogs = filteredLogs.slice((page - 1) * LOGS_PER_PAGE, page * LOGS_PER_PAGE);

  const exportCSV = () => {
    if (filteredLogs.length === 0) return;
    const headers = ["Date & Time", "Module", "Action", "Actor", "Role", "Bay"];
    const rows = filteredLogs.map((log) => [
      formatFullTime(log.createdAt),
      log.module || "",
      (log.description || "").replace(/,/g, ";"),
      log.actor?.name || "Unknown",
      log.actorRole || "",
      log.bay?.name || "",
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `activity-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Derived stats from existing log data — no new API calls
  const uniqueModules = [...new Set(logs.map((l) => l.module).filter(Boolean))];
  const uniqueActors  = [...new Set(logs.map((l) => l.actor?.name).filter(Boolean))];
  const mostActiveModule = uniqueModules.reduce((max, m) => {
    const count = logs.filter((l) => l.module === m).length;
    return count > (logs.filter((l) => l.module === max).length) ? m : max;
  }, uniqueModules[0] || "—");

  const todayLogs = logs.filter((l) => {
    const d = new Date(l.createdAt);
    const t = new Date();
    return d.toDateString() === t.toDateString();
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-emerald-50/60 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-emerald-600">Loading activity logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-emerald-50/60">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-emerald-100 shadow-sm px-4 sm:px-8 py-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-emerald-800">Activity Logs</h1>
            <p className="text-sm text-emerald-500 flex items-center gap-1.5 mt-0.5">
              <Clock size={13} />
              Real-time activity feed
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative w-full sm:w-auto">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
              <input
                type="text"
                placeholder="Search logs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-8 h-10 w-full sm:w-52 rounded-lg border border-emerald-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X size={13} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* Filter toggle */}
              <button
                onClick={() => setShowFilters((p) => !p)}
                className={`flex items-center gap-2 px-3 h-10 rounded-lg border text-sm transition flex-1 sm:flex-none justify-center ${
                  showFilters
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "border-emerald-200 bg-white hover:bg-emerald-50 text-emerald-700"
                }`}
              >
                <Filter size={15} />
                <span className="hidden xs:inline">Module</span>
                <ChevronDown size={13} className={`transition-transform ${showFilters ? "rotate-180" : ""}`} />
              </button>

              {/* Export CSV */}
              <button
                onClick={exportCSV}
                disabled={filteredLogs.length === 0}
                className="flex items-center gap-2 px-3 h-10 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition disabled:opacity-40 disabled:cursor-not-allowed shadow-sm flex-1 sm:flex-none justify-center"
              >
                <Download size={15} />
                <span className="hidden sm:inline">Export CSV</span>
                <span className="sm:hidden">CSV</span>
              </button>

              {/* Clear */}
              <button
                onClick={clearLogs}
                disabled={clearing || logs.length === 0}
                className="flex items-center gap-2 px-3 h-10 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition disabled:opacity-40 disabled:cursor-not-allowed shadow-sm flex-1 sm:flex-none justify-center"
              >
                <Trash2 size={15} />
                <span>{clearing ? "Clearing..." : "Clear"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      {showFilters && (
        <div className="bg-white border-b border-emerald-100 px-4 sm:px-8 py-3 flex flex-col sm:flex-row sm:flex-wrap gap-3">
          <div className="flex flex-wrap gap-2">
          {["all", ...uniqueModules].map((m) => (
            <button
              key={m}
              onClick={() => setModule(m)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                module === m
                  ? "bg-emerald-600 text-white"
                  : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              }`}
            >
              {m === "all" ? "All Modules" : m}
              <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
                module === m ? "bg-white/20" : "bg-white"
              }`}>
                {m === "all" ? logs.length : logs.filter((l) => l.module === m).length}
              </span>
            </button>
          ))}
          </div>
          {/* Date range */}
          <div className="flex flex-wrap items-center gap-2 sm:ml-2 sm:border-l sm:border-emerald-100 sm:pl-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-emerald-100">
            <Calendar size={14} className="text-emerald-500 flex-shrink-0" />
            <span className="text-xs text-emerald-700 font-medium whitespace-nowrap">Date range:</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="border border-emerald-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            />
            <span className="text-xs text-gray-400">to</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="border border-emerald-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            />
            {(dateFrom || dateTo) && (
              <button
                onClick={() => { setDateFrom(""); setDateTo(""); }}
                className="text-red-400 hover:text-red-600 transition"
                title="Clear dates"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>
      )}

      <div className="px-4 sm:px-8 py-6 space-y-6">

        {/* Stats row — derived purely from logs data */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Logs"
            value={logs.length}
            sub="all time"
            icon={FileText}
            color="emerald"
          />
          <StatCard
            label="Today's Activity"
            value={todayLogs.length}
            sub="logs today"
            icon={Activity}
            color="blue"
          />
          <StatCard
            label="Active Users"
            value={uniqueActors.length}
            sub="distinct actors"
            icon={Users}
            color="purple"
          />
          <StatCard
            label="Top Module"
            value={mostActiveModule || "—"}
            sub={`${logs.filter((l) => l.module === mostActiveModule).length} events`}
            icon={Shield}
            color="amber"
            small
          />
        </div>

        {/* Results count + active filter pill */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-emerald-600">
            Showing <span className="font-semibold text-emerald-800">{filteredLogs.length}</span> of{" "}
            <span className="font-semibold">{logs.length}</span> logs
          </p>
          {(module !== "all" || search || dateFrom || dateTo) && (
            <button
              onClick={() => { setModule("all"); setSearch(""); setDateFrom(""); setDateTo(""); }}
              className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 transition"
            >
              <X size={12} /> Clear filters
            </button>
          )}
        </div>

        {/* Log List */}
        <div className="space-y-2">
          {filteredLogs.length === 0 ? (
            <div className="bg-white rounded-xl border border-emerald-100 shadow-sm p-12 text-center">
              <FileText size={36} className="text-emerald-200 mx-auto mb-3" />
              <p className="text-sm font-medium text-emerald-600">No logs found</p>
              <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filters</p>
            </div>
          ) : (
            paginatedLogs.map((log, idx) => {
              const Icon = MODULE_ICONS[log.module] || Shield;
              const colors = MODULE_COLORS[log.module] || DEFAULT_COLOR;

              return (
                <div
                  key={log._id}
                  className="flex gap-3 sm:gap-4 p-3 sm:p-4 bg-white rounded-xl border border-emerald-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition group"
                >
                  {/* Icon */}
                  <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex-shrink-0 flex items-center justify-center ${colors.bg}`}>
                    <Icon size={18} className={colors.icon} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-gray-800 leading-snug">
                        {log.description}
                      </p>
                      <span
                        className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0 mt-0.5"
                        title={formatFullTime(log.createdAt)}
                      >
                        {formatTime(log.createdAt)}
                      </span>
                    </div>

                    {/* Meta row */}
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-1.5">
                      {/* Actor */}
                      <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">
                        <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                          {log.actor?.name?.charAt(0)?.toUpperCase() || "?"}
                        </span>
                        <span className="font-medium text-gray-700">{log.actor?.name || "Unknown"}</span>
                        {log.actorRole && (
                          <span className="text-gray-400 capitalize">· {log.actorRole}</span>
                        )}
                      </span>

                      {/* Module badge */}
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${colors.badge}`}>
                        {log.module}
                      </span>

                      {/* Bay */}
                      {log.bay?.name && (
                        <span className="text-xs text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">
                          📍 {log.bay.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white rounded-xl border border-emerald-100 shadow-sm px-4 py-3">
            <p className="text-xs text-gray-500">
              Page <span className="font-semibold text-emerald-700">{page}</span> of{" "}
              <span className="font-semibold text-emerald-700">{totalPages}</span>
              <span className="hidden sm:inline text-gray-400"> · {filteredLogs.length} total logs</span>
            </p>

            <div className="flex items-center gap-1">
              {/* Prev */}
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg text-emerald-700 hover:bg-emerald-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft size={16} />
              </button>

              {/* Page numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((n) => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
                .reduce((acc, n, i, arr) => {
                  if (i > 0 && n - arr[i - 1] > 1) acc.push("...");
                  acc.push(n);
                  return acc;
                }, [])
                .map((item, i) =>
                  item === "..." ? (
                    <span key={`ellipsis-${i}`} className="px-1 text-gray-400 text-xs">…</span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => setPage(item)}
                      className={`min-w-[32px] h-8 rounded-lg text-xs font-semibold transition ${
                        page === item
                          ? "bg-emerald-600 text-white shadow-sm"
                          : "text-emerald-700 hover:bg-emerald-50"
                      }`}
                    >
                      {item}
                    </button>
                  )
                )}

              {/* Next */}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg text-emerald-700 hover:bg-emerald-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Bottom count */}
        {filteredLogs.length > 0 && (
          <p className="text-center text-xs text-gray-400 pb-2">
            Showing {(page - 1) * LOGS_PER_PAGE + 1}–{Math.min(page * LOGS_PER_PAGE, filteredLogs.length)} of {filteredLogs.length} log{filteredLogs.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>
    </div>
  );
}

/* ========== STAT CARD ========== */
function StatCard({ label, value, sub, icon: Icon, color = "emerald", small = false }) {
  const colorMap = {
    emerald: { bg: "bg-emerald-50",  icon: "text-emerald-500", value: "text-emerald-800", border: "border-emerald-100" },
    blue:    { bg: "bg-blue-50",     icon: "text-blue-500",    value: "text-blue-800",    border: "border-blue-100" },
    purple:  { bg: "bg-purple-50",   icon: "text-purple-500",  value: "text-purple-800",  border: "border-purple-100" },
    amber:   { bg: "bg-amber-50",    icon: "text-amber-500",   value: "text-amber-800",   border: "border-amber-100" },
  };
  const c = colorMap[color];

  return (
    <div className={`bg-white rounded-xl border ${c.border} shadow-sm p-4`}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-gray-500">{label}</p>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${c.bg}`}>
          <Icon size={15} className={c.icon} />
        </div>
      </div>
      <p className={`font-bold ${c.value} ${small ? "text-lg" : "text-2xl"}`}>{value}</p>
      <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
    </div>
  );
}