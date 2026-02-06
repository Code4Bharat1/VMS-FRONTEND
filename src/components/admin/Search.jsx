"use client";

import { useEffect, useState } from "react";
import {
  Search,
  FileDown,
  UserX,
  UserCheck,
  Users,
  Shield,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import axios from "axios";

/* ================= STAT CARD ================= */

const Stat = ({ title, value, icon: Icon }) => (
  <div className="bg-white rounded-xl border border-emerald-100 p-6 shadow-sm">
    <div className="flex justify-between mb-3">
      <Icon className="text-emerald-600" />
      <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">
        Live
      </span>
    </div>
    <p className="text-emerald-600 text-sm">{title}</p>
    <p className="text-3xl font-bold text-emerald-800">{value}</p>
  </div>
);

/* ================= MAIN ================= */

export default function SearchRecords() {
  const [fromDate, setFromDate] = useState("");
const [toDate, setToDate] = useState("");

  const [entries, setEntries] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  /* ✅ PAGINATION (ONLY ADDITION) */
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  /* ================= FETCH ENTRIES ================= */
  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/entries`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = res.data.entries || [];
      setEntries(data);
      setFiltered(data);
    } catch (err) {
      console.error("Failed to fetch entries", err);
    } finally {
      setLoading(false);
    }
  };

  const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const endOfDay = (date) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

const applyDateFilter = (from, to) => {
  let data = [...entries];

  if (from) {
    const fromTime = startOfDay(from).getTime();
    data = data.filter((e) => new Date(e.inTime).getTime() >= fromTime);
  }

  if (to) {
    const toTime = endOfDay(to).getTime();
    data = data.filter((e) => new Date(e.inTime).getTime() <= toTime);
  }

  setFiltered(data);
  setCurrentPage(1);
};
const setPreset = (type) => {
  const today = new Date();

  let from = null;
  let to = null;

  switch (type) {
    case "today":
      from = today;
      to = today;
      break;

    case "yesterday":
      from = new Date(today);
      from.setDate(today.getDate() - 1);
      to = from;
      break;

    case "last7":
      from = new Date(today);
      from.setDate(today.getDate() - 6);
      to = today;
      break;

    case "last30":
      from = new Date(today);
      from.setDate(today.getDate() - 29);
      to = today;
      break;

    case "thisWeek":
      from = new Date(today);
      from.setDate(today.getDate() - today.getDay());
      to = today;
      break;
  }

  setFromDate(from.toISOString().slice(0, 10));
  setToDate(to.toISOString().slice(0, 10));
  applyDateFilter(from, to);
};

  /* ================= SEARCH ================= */
  useEffect(() => {
    if (!search.trim()) {
      setFiltered(entries);
      setCurrentPage(1);
      return;
    }

    const q = search.toLowerCase();

    setFiltered(
      entries.filter((e) =>
        [
          e.vehicleNumber,
          e.visitorName,
          e.visitorCompany,
          e.visitorMobile,
          e.qidNumber,
          e.bayId?.bayName,
          e.createdBy?.name,
        ]
          .join(" ")
          .toLowerCase()
          .includes(q)
      )
    );
    setCurrentPage(1);
  }, [search, entries]);

  /* ================= PAGINATION LOGIC ================= */
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedEntries = filtered.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  /* ================= FORMAT TIME ================= */
  const formatTime = (inTime) => {
    if (!inTime) return "—";
    return new Date(inTime).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  /* ================= EXPORT CSV ================= */
  const exportToCSV = () => {
    if (!filtered.length) return;

    const headers = [
      "Time",
      "Bay",
      "VRN",
      "Visitor Name",
      "Company",
      "Handled By",
    ];

    const rows = filtered.map((e) => [
      formatTime(e.inTime),
      e.bayId?.bayName || "",
      e.vehicleNumber || "",
      e.visitorName || "",
      e.visitorCompany || "",
      e.createdBy?.name || "",
    ]);

    const csv =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows]
        .map((r) => r.map((v) => `"${String(v)}"`).join(","))
        .join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csv);
    link.download = `entries_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-emerald-50/60">
      {/* HEADER */}
      <div className="bg-white border-b border-emerald-100 px-4 sm:px-8 py-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-emerald-800">
              Search Records
            </h1>
            <p className="text-sm text-emerald-600 mt-1">
              Search across visitor, staff, supervisor and tenant records
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400"
              />
              <input
                type="text"
                placeholder="Search records"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 h-10 w-full rounded-lg
                           border border-emerald-200 text-sm
                           focus:outline-none focus:ring-2
                           focus:ring-emerald-500 bg-white"
              />
            </div>

            <button
              onClick={exportToCSV}
              className="flex items-center justify-center gap-2 px-5 h-10
                         rounded-lg bg-emerald-600 hover:bg-emerald-700
                         transition text-white text-sm font-medium"
            >
              <FileDown size={16} />
              Export CSV
            </button>
          </div>
        </div>
      </div>
{/* DATE FILTER */}
<div className="bg-white rounded-xl border border-emerald-100 shadow-sm p-5">
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

    {/* FROM */}
    <div>
      <label className="block text-xs text-emerald-600 mb-1">From</label>
      <input
        type="date"
        value={fromDate}
        onChange={(e) => setFromDate(e.target.value)}
        className="w-full h-10 rounded-lg border border-emerald-200 px-3 text-sm"
      />
    </div>

    {/* TO */}
    <div>
      <label className="block text-xs text-emerald-600 mb-1">To</label>
      <input
        type="date"
        value={toDate}
        onChange={(e) => setToDate(e.target.value)}
        className="w-full h-10 rounded-lg border border-emerald-200 px-3 text-sm"
      />
    </div>

    {/* QUICK PRESETS */}
    <div className="md:col-span-2 flex flex-wrap gap-2 items-end">
      <button onClick={() => setPreset("today")} className="px-3 h-9 text-sm rounded-full bg-emerald-100 text-emerald-700">
        Today
      </button>
      <button onClick={() => setPreset("yesterday")} className="px-3 h-9 text-sm rounded-full bg-emerald-100 text-emerald-700">
        Yesterday
      </button>
      <button onClick={() => setPreset("last7")} className="px-3 h-9 text-sm rounded-full bg-emerald-100 text-emerald-700">
        Last 7 days
      </button>
      <button onClick={() => setPreset("last30")} className="px-3 h-9 text-sm rounded-full bg-emerald-100 text-emerald-700">
        Last 30 days
      </button>
      <button onClick={() => setPreset("thisWeek")} className="px-3 h-9 text-sm rounded-full bg-emerald-100 text-emerald-700">
        This week
      </button>
    </div>
  </div>

  {/* ACTIONS */}
  <div className="flex justify-end gap-3 mt-4">
    <button
      onClick={() => {
        setFromDate("");
        setToDate("");
        setFiltered(entries);
      }}
      className="px-4 h-10 rounded-md"
    >
      Reset all filters
    </button>

    <button
      onClick={() => applyDateFilter(fromDate, toDate)}
      className="px-5 h-10 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium"
    >
      Search records
    </button>
  </div>
</div>

      {/* CONTENT */}
      <div className="px-4 sm:px-8 py-6 space-y-6">
       

        {/* DESKTOP TABLE */}
        <div className="hidden sm:block bg-white rounded-xl border border-emerald-100 shadow-sm overflow-x-auto">
          <table className="min-w-[900px] w-full">
            <thead className="bg-emerald-100 border-b border-emerald-200">
              <tr>
                {[
                  "Time",
                  "Bay",
                  "VRN",
                  "Visitor Name",
                  "Company",
                  "Handled By",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-4 text-left text-sm font-medium text-emerald-700"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-emerald-100">
              {!loading && paginatedEntries.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-emerald-500">
                    No records found
                  </td>
                </tr>
              )}

              {paginatedEntries.map((e) => (
                <tr key={e._id} className="hover:bg-emerald-50 transition">
                  <td className="px-6 py-4 text-sm text-emerald-800">
                    {formatTime(e.inTime)}
                  </td>
                  <td className="px-6 py-4 text-sm text-emerald-800">
                    {e.bayId?.bayName || "—"}
                  </td>
                  <td className="px-6 py-4 text-sm text-emerald-800">
                    {e.vehicleNumber}
                  </td>
                  <td className="px-6 py-4 text-sm text-emerald-800">
                    {e.visitorName || "—"}
                  </td>
                  <td className="px-6 py-4 text-sm text-emerald-800">
                    {e.visitorCompany || "—"}
                  </td>
                  <td className="px-6 py-4 text-sm text-emerald-800">
                    {e.createdBy?.name || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-emerald-50 border-t border-emerald-100 flex items-center justify-between">
              <span className="text-sm text-emerald-600">
                Page {currentPage} of {totalPages}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 border rounded-lg disabled:opacity-50"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 border rounded-lg disabled:opacity-50"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* MOBILE CARDS */}
        <div className="sm:hidden space-y-4">
          {!loading && paginatedEntries.length === 0 && (
            <div className="text-center text-sm text-emerald-500">
              No records found
            </div>
          )}

          {paginatedEntries.map((e) => (
            <div
              key={e._id}
              className="bg-white rounded-xl border border-emerald-100 shadow-sm p-4 space-y-2"
            >
              <div className="text-xs text-emerald-600">
                {formatTime(e.inTime)}
              </div>

              <div className="text-sm font-medium text-emerald-800">
                {e.visitorName || "—"}
              </div>

              <div className="text-sm text-emerald-700">
                <span className="font-medium">VRN:</span>{" "}
                {e.vehicleNumber || "—"}
              </div>

              <div className="text-sm text-emerald-700">
                <span className="font-medium">Company:</span>{" "}
                {e.visitorCompany || "—"}
              </div>

              <div className="text-sm text-emerald-700">
                <span className="font-medium">Bay:</span>{" "}
                {e.bayId?.bayName || "—"}
              </div>

              <div className="text-sm text-emerald-700">
                <span className="font-medium">Handled By:</span>{" "}
                {e.createdBy?.name || "—"}
              </div>
            </div>
          ))}

          {totalPages > 1 && (
            <div className="bg-white rounded-xl border p-4 flex justify-between">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 border rounded-lg disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-emerald-600">
                {currentPage}/{totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border rounded-lg disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
