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
} from "lucide-react";

const MODULE_ICONS = {
  AUTH: Shield,
  USER: User,
  ENTRY: Car,
  BAY: Settings,
  SECURITY: AlertTriangle,
};

export default function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [module, setModule] = useState("all");
  const [clearing, setClearing] = useState(false);

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
        {
          headers: { Authorization: `Bearer ${token}` },
        }
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
        {
          headers: { Authorization: `Bearer ${token}` },
        }
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
    return matchSearch && matchModule;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-emerald-50/60 flex items-center justify-center">
        <p className="text-sm text-emerald-600">Loading activity logs...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-emerald-50/60">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-emerald-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-xl font-bold text-emerald-800">
                Activity Logs
              </h1>
              <p className="text-sm text-emerald-600 flex items-center gap-1 mt-1">
                <Clock size={14} /> Auto-clears after 15 minutes
              </p>
            </div>

            <button
              onClick={clearLogs}
              disabled={clearing}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <Trash2 size={16} />
              {clearing ? "Clearing..." : "Clear Logs"}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-emerald-400" />
            <input
              type="text"
              placeholder="Search by user or action..."
              className="pl-9 pr-4 py-2 w-full border border-emerald-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="border border-emerald-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            value={module}
            onChange={(e) => setModule(e.target.value)}
          >
            <option value="all">All Modules</option>
            <option value="AUTH">Auth</option>
            <option value="STAFF">Staff</option>
            <option value="ENTRY">Entry</option>
            <option value="BAY">Bay</option>
            <option value="SECURITY">Security</option>
          </select>
        </div>

        {/* Logs */}
        <div className="space-y-3">
          {filteredLogs.length === 0 && (
            <div className="bg-white rounded-xl border border-emerald-100 shadow-sm p-8 text-center">
              <p className="text-sm text-emerald-600">No logs found.</p>
            </div>
          )}

          {filteredLogs.map((log) => {
            const Icon = MODULE_ICONS[log.module] || Shield;

            return (
              <div
                key={log._id}
                className="flex gap-4 p-4 bg-white rounded-xl border border-emerald-100 shadow-sm hover:shadow-md transition"
              >
                <div className="p-2 rounded-full bg-emerald-50">
                  <Icon className="w-5 h-5 text-emerald-600" />
                </div>

                <div className="flex-1">
                  <div className="flex justify-between gap-2">
                    <p className="text-sm font-medium text-emerald-800">
                      {log.description}
                    </p>
                    <span className="text-xs text-emerald-600">
                      {new Date(log.createdAt).toLocaleTimeString()}
                    </span>
                  </div>

                  <div className="text-xs text-emerald-600 mt-1 flex flex-wrap gap-3">
                    <span>👤 {log.actor?.name} ({log.actorRole})</span>
                    {log.bay?.name && <span>📍 {log.bay.name}</span>}
                    <span className="uppercase">🔖 {log.module}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}