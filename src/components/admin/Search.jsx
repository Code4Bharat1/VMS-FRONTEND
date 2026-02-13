"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import axios from "axios";

/* ================= MAIN ================= */

export default function SearchRecords() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedPreset, setSelectedPreset] = useState("");

  const [entries, setEntries] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  /* PAGINATION */
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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
    setSelectedPreset(type);
  };

  /* ================= SEARCH & FILTER ================= */
  useEffect(() => {
    let data = [...entries];

    // Date filter
    if (fromDate) {
      const fromTime = startOfDay(fromDate).getTime();
      data = data.filter((e) => new Date(e.inTime).getTime() >= fromTime);
    }

    if (toDate) {
      const toTime = endOfDay(toDate).getTime();
      data = data.filter((e) => new Date(e.inTime).getTime() <= toTime);
    }

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter((e) =>
        [
          e.vehicleNumber,
          e.visitorName,
          e.visitorCompany,
          e.visitorMobile,
          e.qidNumber,
          e.tenantName,
          e.purpose,
          e.bayId?.bayName,
          e.createdBy?.name,
        ]
          .join(" ")
          .toLowerCase()
          .includes(q)
      );
    }

    setFiltered(data);
    setCurrentPage(1);
  }, [search, entries, fromDate, toDate]);

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
      year: "numeric",
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
      "QID",
      "Mobile",
      "Company",
      "Tenant",
      "Purpose",
      "Entry Type",
      "Status",
      "Handled By",
    ];

    const rows = filtered.map((e) => [
      formatTime(e.inTime),
      e.bayId?.bayName || "",
      e.vehicleNumber || "",
      e.visitorName || "",
      e.qidNumber || "",
      e.visitorMobile || "",
      e.visitorCompany || "",
      e.tenantName || "",
      e.purpose || "",
      (e.entryMethod || "Manual"),
      e.status || "IN",
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
              <Download size={16} />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="px-4 sm:px-8 py-6 space-y-6">
        {/* DATE FILTER */}
        <div className="bg-white rounded-xl border border-emerald-100 shadow-sm p-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* FROM */}
            <div>
              <label className="block text-xs text-emerald-600 mb-1">From</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setSelectedPreset("");
                }}
                className="w-full h-10 rounded-lg border border-emerald-200 px-3 text-sm"
              />
            </div>

            {/* TO */}
            <div>
              <label className="block text-xs text-emerald-600 mb-1">To</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  setSelectedPreset("");
                }}
                className="w-full h-10 rounded-lg border border-emerald-200 px-3 text-sm"
              />
            </div>

            {/* QUICK PRESETS */}
            <div className="md:col-span-2 flex flex-wrap gap-2 items-end">
              <button
                onClick={() => setPreset("today")}
                className={`px-3 h-9 text-sm rounded-full transition ${
                  selectedPreset === "today"
                    ? "bg-emerald-600 text-white"
                    : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setPreset("yesterday")}
                className={`px-3 h-9 text-sm rounded-full transition ${
                  selectedPreset === "yesterday"
                    ? "bg-emerald-600 text-white"
                    : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                }`}
              >
                Yesterday
              </button>
              <button
                onClick={() => setPreset("last7")}
                className={`px-3 h-9 text-sm rounded-full transition ${
                  selectedPreset === "last7"
                    ? "bg-emerald-600 text-white"
                    : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                }`}
              >
                Last 7 days
              </button>
              <button
                onClick={() => setPreset("last30")}
                className={`px-3 h-9 text-sm rounded-full transition ${
                  selectedPreset === "last30"
                    ? "bg-emerald-600 text-white"
                    : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                }`}
              >
                Last 30 days
              </button>
              <button
                onClick={() => setPreset("thisWeek")}
                className={`px-3 h-9 text-sm rounded-full transition ${
                  selectedPreset === "thisWeek"
                    ? "bg-emerald-600 text-white"
                    : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                }`}
              >
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
                setSelectedPreset("");
              }}
              className="px-4 h-10 rounded-md text-emerald-600 hover:bg-emerald-50 transition"
            >
              Reset all filters
            </button>
          </div>
        </div>

        {/* DESKTOP TABLE */}
        <div className="hidden sm:block bg-white rounded-xl border border-emerald-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-emerald-50">
                <tr className="text-emerald-700 text-xs uppercase">
                  <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Date & Time</th>
                  <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Visitor Name</th>
                  <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">QID</th>
                  <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">VRN</th>
                  <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Mobile No</th>
                  <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Bay</th>
                  <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Company</th>
                  <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Tenant</th>
                  <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Purpose</th>
                  <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Entry Type</th>
                  <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Status</th>
                  <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Handled By</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-emerald-100">
                {!loading && paginatedEntries.length === 0 && (
                  <tr>
                    <td colSpan={12} className="px-6 py-8 text-center text-sm text-emerald-500">
                      No records found
                    </td>
                  </tr>
                )}

                {paginatedEntries.map((e) => (
                  <tr key={e._id} className="hover:bg-emerald-50 transition">
                    <td className="px-4 py-3 text-sm text-emerald-700 whitespace-nowrap">{formatTime(e.inTime)}</td>
                    <td className="px-4 py-3 text-sm font-medium whitespace-nowrap">{e.visitorName || "—"}</td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">{e.qidNumber || "—"}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-emerald-800 whitespace-nowrap">{e.vehicleNumber}</td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">{e.visitorMobile || "—"}</td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">{e.bayId?.bayName || "—"}</td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">{e.visitorCompany || "—"}</td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">{e.tenantName || "—"}</td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">{e.purpose || "—"}</td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">
                      <span className="capitalize px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs">
                        {e.entryMethod || "Manual"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          e.status === "IN"
                            ? "bg-emerald-100 text-emerald-700"
                            : e.status === "OUT"
                            ? "bg-gray-200 text-gray-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {e.status || "IN"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">{e.createdBy?.name || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

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
                <span className="font-medium">QID:</span>{" "}
                {e.qidNumber || "—"}
              </div>

              <div className="text-sm text-emerald-700">
                <span className="font-medium">Mobile:</span>{" "}
                {e.visitorMobile || "—"}
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

              <div className="text-sm text-emerald-700">
                <span className="font-medium">Status:</span>{" "}
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    e.status === "IN"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {e.status || "IN"}
                </span>
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