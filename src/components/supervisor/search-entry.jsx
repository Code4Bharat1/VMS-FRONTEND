"use client";
import React, { useState, useEffect } from "react";
import { Search, Calendar, ChevronDown, FileDown, Filter, X } from "lucide-react";
import Sidebar from "./sidebar";
import axios from "axios";

const SearchEntries = () => {
  const [filterVRN, setFilterVRN] = useState("");
  const [filterQID, setFilterQID] = useState("");
  const [filterMobile, setFilterMobile] = useState("");
  const [filterCompany, setFilterCompany] = useState("");

  const [activePage, setActivePage] = useState("search");
  
  const [entryMethod, setEntryMethod] = useState("All methods");
  const [bay, setBay] = useState("");
  const [staff, setStaff] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [viewAll, setViewAll] = useState(false);

  const [supervisor, setSupervisor] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setSupervisor(JSON.parse(storedUser));
  }, []);

  useEffect(() => {
    if (!supervisor?._id) return;

    const fetchEntries = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/entries`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setEntries(res.data.entries || []);
      } catch (err) {
        console.error("Failed to fetch entries", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, [supervisor]);

  useEffect(() => {
    if (supervisor?.assignedBay?._id) {
      setBay(supervisor.assignedBay._id);
    }
  }, [supervisor]);

  const staffOptions = React.useMemo(() => {
    const map = new Map();

    entries.forEach((e) => {
      if (e.createdBy?._id) {
        map.set(e.createdBy._id, e.createdBy.name);
      }
    });

    return Array.from(map, ([_id, name]) => ({ _id, name }));
  }, [entries]);

  const filteredEntries = entries.filter((e) => {
    // Skip date filtering if viewAll is enabled
    if (!viewAll) {
      const entryDate = new Date(e.createdAt);
      entryDate.setHours(0, 0, 0, 0);

      const from = new Date(fromDate);
      from.setHours(0, 0, 0, 0);

      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999);

      if (entryDate < from || entryDate > to) {
        return false;
      }
    }

    /* ================= BAY RESTRICTION ================= */
    if (
      supervisor?.assignedBay?._id &&
      String(e.bayId?._id) !== String(supervisor.assignedBay._id)
    ) {
      return false;
    }

    /* ================= STAFF FILTER ================= */
    if (staff) {
      if (String(e.createdBy?._id) !== String(staff)) {
        return false;
      }
    }

    /* ================= ENTRY METHOD FILTER ================= */
    if (entryMethod && entryMethod !== "All methods") {
      if (e.entryMethod !== entryMethod.toLowerCase()) {
        return false;
      }
    }

    /* ================= FIELD FILTERS ================= */
    if (filterVRN) {
      if (!e.vehicleNumber?.toLowerCase().includes(filterVRN.toLowerCase())) {
        return false;
      }
    }

    if (filterQID) {
      if (!e.qidNumber?.toLowerCase().includes(filterQID.toLowerCase())) {
        return false;
      }
    }

    if (filterMobile) {
      if (
        !e.visitorMobile?.toLowerCase().includes(filterMobile.toLowerCase())
      ) {
        return false;
      }
    }

    if (filterCompany) {
      const match =
        e.visitorCompany?.toLowerCase().includes(filterCompany.toLowerCase()) ||
        e.visitorName?.toLowerCase().includes(filterCompany.toLowerCase());

      if (!match) return false;
    }

    /* ================= SEARCH ================= */
    if (!search.trim()) return true;

    const q = search.toLowerCase();

    return (
      e.vehicleNumber?.toLowerCase().includes(q) ||
      e.visitorName?.toLowerCase().includes(q) ||
      e.visitorCompany?.toLowerCase().includes(q) ||
      e.visitorMobile?.toLowerCase().includes(q) ||
      e.qidNumber?.toLowerCase().includes(q) ||
      e.bayId?.bayName?.toLowerCase().includes(q) ||
      e.createdBy?.name?.toLowerCase().includes(q) ||
      e.tenantName?.toLowerCase().includes(q) ||
      e.purpose?.toLowerCase().includes(q)
    );
  });

  const formatDateTime = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const exportToCSV = () => {
    if (!filteredEntries.length) return;

    const headers = [
      "Time",
      "Visitor Name",
      "QID Number",
      "VRN",
      "Mobile Number",
      "Bay",
      "Company",
      "Tenant",
      "Purpose",
      "Handled By",
      "Entry Type",
      "Status",
    ];

    const rows = filteredEntries.map((e) => [
      e.createdAt ? new Date(e.createdAt).toLocaleString() : "",
      e.visitorName || "",
      e.qidNumber || "",
      e.vehicleNumber || "",
      e.visitorMobile || "",
      e.bayId?.bayName || "",
      e.visitorCompany || "",
      e.tenantName || "",
      e.purpose || "",
      e.createdBy?.name || "",
      e.entryMethod || "",
      e.outTime ? "OUT" : "IN",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows]
        .map((row) =>
          row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")
        )
        .join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = viewAll
      ? `all_entries_export_${new Date().toISOString().slice(0, 10)}.csv`
      : `entries_${fromDate.toISOString().slice(0, 10)}_to_${toDate.toISOString().slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearFilters = () => {
    setFilterVRN("");
    setFilterQID("");
    setFilterMobile("");
    setFilterCompany("");
    setEntryMethod("All methods");
    setStaff("");
    setFromDate(new Date());
    setToDate(new Date());
    setViewAll(false);
  };

  const hasActiveFilters = filterVRN || filterQID || filterMobile || filterCompany || 
    (entryMethod && entryMethod !== "All methods") || staff || viewAll;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      <Sidebar activePage={activePage} onPageChange={setActivePage} />

      <div className="flex-1 flex flex-col w-full min-w-0">
        {/* HEADER */}
        <div className="bg-white border-b border-emerald-100 shadow-sm">
          <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6">
            <div className="flex flex-col gap-3 sm:gap-4">
              <div className="flex-1">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-emerald-800 tracking-tight">
                  Search Entries
                </h1>
                <p className="text-xs sm:text-sm md:text-base text-emerald-600 mt-0.5 sm:mt-1">
                  View and search all visitor entry records
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                {/* Search Bar */}
                <div className="relative flex-1 sm:w-auto md:w-64 lg:w-80">
                  <Search
                    size={16}
                    className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 text-emerald-400 pointer-events-none"
                  />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search entries..."
                    className="pl-8 sm:pl-10 pr-3 sm:pr-4 h-9 sm:h-10 md:h-11 w-full rounded-lg
                               border border-emerald-200 bg-white
                               text-xs sm:text-sm text-gray-900 placeholder-emerald-400
                               focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                               transition-all duration-200"
                  />
                </div>

                {/* Export Button */}
                <button
                  onClick={exportToCSV}
                  disabled={filteredEntries.length === 0}
                  className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 md:px-5 h-9 sm:h-10 md:h-11
                             rounded-lg bg-emerald-600 text-white font-medium
                             hover:bg-emerald-700 active:bg-emerald-800
                             disabled:bg-emerald-300 disabled:cursor-not-allowed
                             transition-all duration-200 shadow-sm hover:shadow-md
                             text-xs sm:text-sm whitespace-nowrap"
                >
                  <FileDown size={16} className="sm:w-[18px] sm:h-[18px]" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-1 overflow-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6">
          {/* FILTERS */}
          <div className="bg-white rounded-lg sm:rounded-xl border border-emerald-100 shadow-sm mb-4 sm:mb-6">
            {/* Filter Header */}
            <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-b border-emerald-100 flex items-center justify-between">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Filter size={16} className="text-emerald-600 sm:w-[18px] sm:h-[18px]" />
                <h2 className="font-semibold text-emerald-800 text-sm sm:text-base md:text-lg">Filters</h2>
                {hasActiveFilters && (
                  <span className="ml-1 sm:ml-2 px-1.5 sm:px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] sm:text-xs font-medium rounded-full">
                    Active
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-xs sm:text-sm text-emerald-600 hover:text-emerald-700 font-medium
                               flex items-center gap-1 transition-colors"
                  >
                    <X size={14} className="sm:w-4 sm:h-4" />
                    <span>Clear</span>
                  </button>
                )}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="p-1 hover:bg-emerald-50 rounded transition-colors lg:hidden"
                >
                  <ChevronDown
                    size={18}
                    className={`text-emerald-600 transition-transform sm:w-5 sm:h-5 ${
                      showFilters ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Filter Content */}
            <div className={`${showFilters ? "block" : "hidden"} lg:block px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-5`}>
              {/* Row 1: Text Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                <div className="relative">
                  <input
                    className="h-9 sm:h-10 md:h-11 px-3 sm:px-4 w-full rounded-lg
                               border border-emerald-200 bg-white
                               text-xs sm:text-sm text-gray-900 placeholder-gray-400
                               focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                               transition-all duration-200"
                    placeholder="Vehicle Registration Number"
                    value={filterVRN}
                    onChange={(e) => setFilterVRN(e.target.value)}
                  />
                </div>

                <div className="relative">
                  <input
                    className="h-9 sm:h-10 md:h-11 px-3 sm:px-4 w-full rounded-lg
                               border border-emerald-200 bg-white
                               text-xs sm:text-sm text-gray-900 placeholder-gray-400
                               focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                               transition-all duration-200"
                    placeholder="QID Number"
                    value={filterQID}
                    onChange={(e) => setFilterQID(e.target.value)}
                  />
                </div>

                <div className="relative">
                  <input
                    className="h-9 sm:h-10 md:h-11 px-3 sm:px-4 w-full rounded-lg
                               border border-emerald-200 bg-white
                               text-xs sm:text-sm text-gray-900 placeholder-gray-400
                               focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                               transition-all duration-200"
                    placeholder="Mobile Number"
                    value={filterMobile}
                    onChange={(e) => setFilterMobile(e.target.value)}
                  />
                </div>

                <div className="relative">
                  <input
                    className="h-9 sm:h-10 md:h-11 px-3 sm:px-4 w-full rounded-lg
                               border border-emerald-200 bg-white
                               text-xs sm:text-sm text-gray-900 placeholder-gray-400
                               focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                               transition-all duration-200"
                    placeholder="Visitor / Company Name"
                    value={filterCompany}
                    onChange={(e) => setFilterCompany(e.target.value)}
                  />
                </div>
              </div>

              {/* Row 2: Date & Dropdown Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mt-3 sm:mt-4">
                {/* FROM DATE */}
                <div className="relative">
                  <Calendar
                    size={16}
                    className={`absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10 sm:w-[18px] sm:h-[18px] ${
                      viewAll ? "text-emerald-300" : "text-emerald-400"
                    }`}
                  />
                  <input
                    type="date"
                    value={fromDate.toISOString().slice(0, 10)}
                    onChange={(e) => setFromDate(new Date(e.target.value))}
                    disabled={viewAll}
                    className={`h-9 sm:h-10 md:h-11 pl-8 sm:pl-10 pr-3 sm:pr-4 w-full rounded-lg
                               border border-emerald-200 bg-white
                               text-xs sm:text-sm text-gray-900
                               focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                               transition-all duration-200
                               ${viewAll ? "opacity-50 cursor-not-allowed" : ""}`}
                  />
                </div>

                {/* TO DATE */}
                <div className="relative">
                  <Calendar
                    size={16}
                    className={`absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10 sm:w-[18px] sm:h-[18px] ${
                      viewAll ? "text-emerald-300" : "text-emerald-400"
                    }`}
                  />
                  <input
                    type="date"
                    value={toDate.toISOString().slice(0, 10)}
                    onChange={(e) => setToDate(new Date(e.target.value))}
                    disabled={viewAll}
                    className={`h-9 sm:h-10 md:h-11 pl-8 sm:pl-10 pr-3 sm:pr-4 w-full rounded-lg
                               border border-emerald-200 bg-white
                               text-xs sm:text-sm text-gray-900
                               focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                               transition-all duration-200
                               ${viewAll ? "opacity-50 cursor-not-allowed" : ""}`}
                  />
                </div>

                {/* ENTRY METHOD */}
                <div className="relative">
                  <select
                    value={entryMethod}
                    onChange={(e) => setEntryMethod(e.target.value)}
                    className="h-9 sm:h-10 md:h-11 px-3 sm:px-4 w-full rounded-lg
                               border border-emerald-200 bg-white
                               text-xs sm:text-sm text-gray-900 appearance-none
                               focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                               transition-all duration-200 cursor-pointer"
                  >
                    <option value="All methods">All Entry Methods</option>
                    <option value="ocr">OCR</option>
                    <option value="manual">Manual</option>
                    <option value="qr">QR Code</option>
                  </select>
                  <ChevronDown
                    size={14}
                    className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 text-emerald-400 pointer-events-none sm:w-4 sm:h-4"
                  />
                </div>

                {/* STAFF */}
                <div className="relative">
                  <select
                    value={staff}
                    onChange={(e) => setStaff(e.target.value)}
                    className="h-9 sm:h-10 md:h-11 px-3 sm:px-4 w-full rounded-lg
                               border border-emerald-200 bg-white
                               text-xs sm:text-sm text-gray-900 appearance-none
                               focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                               transition-all duration-200 cursor-pointer"
                  >
                    <option value="">All Staff Members</option>
                    {staffOptions.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 text-emerald-400 pointer-events-none sm:w-4 sm:h-4"
                  />
                </div>
              </div>

              {/* View All Toggle */}
              <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                <button
                  onClick={() => setViewAll(!viewAll)}
                  className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium text-xs sm:text-sm
                             transition-all duration-200 ${
                               viewAll
                                 ? "bg-emerald-600 text-white hover:bg-emerald-700"
                                 : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                             }`}
                >
                  <svg
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {viewAll ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    )}
                  </svg>
                  {viewAll ? "Viewing All Entries" : "View All Entries"}
                </button>
                {viewAll && (
                  <span className="text-xs sm:text-sm text-emerald-600">
                    Date range filter is disabled
                  </span>
                )}
              </div>

              {/* Results Count */}
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-emerald-100">
                <p className="text-xs sm:text-sm text-emerald-600">
                  Showing <span className="font-semibold text-emerald-700">{filteredEntries.length}</span> of{" "}
                  <span className="font-semibold text-emerald-700">{entries.length}</span> entries
                </p>
              </div>
            </div>
          </div>

          {/* RESULTS TABLE */}
          <div className="bg-white rounded-lg sm:rounded-xl border border-emerald-100 shadow-sm overflow-hidden">
            {/* Scroll Hint - Desktop Only */}
            <div className="hidden lg:block bg-emerald-50 px-4 py-2 border-b border-emerald-100">
              <p className="text-xs text-emerald-700 font-medium flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
                Scroll horizontally to view all columns →
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-emerald-100">
                <thead className="bg-gradient-to-r from-emerald-50 to-teal-50">
                  <tr>
                    {[
                      "Date & Time",
                      "Visitor Name",
                      "QID",
                      "VRN",
                      "Mobile No",
                      "Bay",
                      "Company",
                      "Tenant",
                      "Purpose",
                      "Handled By",
                      "Entry Type",
                      "Status",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-left text-[10px] sm:text-xs md:text-sm font-semibold text-emerald-800 uppercase tracking-wider whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-emerald-50 bg-white">
                  {loading ? (
                    <tr>
                      <td colSpan={12} className="px-4 sm:px-6 py-8 sm:py-12 text-center">
                        <div className="flex flex-col items-center justify-center gap-2 sm:gap-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 border-3 sm:border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
                          <p className="text-emerald-600 font-medium text-sm sm:text-base">Loading entries...</p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredEntries.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="px-4 sm:px-6 py-8 sm:py-12 text-center">
                        <div className="flex flex-col items-center justify-center gap-1.5 sm:gap-2">
                          <Search size={36} className="text-emerald-200 sm:w-12 sm:h-12" />
                          <p className="text-emerald-600 font-medium text-base sm:text-lg">No entries found</p>
                          <p className="text-emerald-500 text-xs sm:text-sm">Try adjusting your filters or search query</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredEntries.map((e, index) => (
                      <tr
                        key={e._id}
                        className={`hover:bg-emerald-50/50 transition-colors ${
                          index % 2 === 0 ? "bg-white" : "bg-emerald-50/20"
                        }`}
                      >
                        <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-[10px] sm:text-xs md:text-sm text-gray-700 whitespace-nowrap">
                          <div className="hidden sm:block">
                            {formatDateTime(e.createdAt)}
                          </div>
                          <div className="sm:hidden">
                            <div>{new Date(e.createdAt).toLocaleDateString()}</div>
                            <div className="text-[9px] text-gray-500">{new Date(e.createdAt).toLocaleTimeString()}</div>
                          </div>
                        </td>
                        <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-[10px] sm:text-xs md:text-sm text-gray-900 font-medium whitespace-nowrap">
                          {e.visitorName || "—"}
                        </td>
                        <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-[10px] sm:text-xs md:text-sm text-gray-700 whitespace-nowrap">
                          {e.qidNumber || "—"}
                        </td>
                        <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-[10px] sm:text-xs md:text-sm text-gray-900 font-mono font-semibold whitespace-nowrap">
                          {e.vehicleNumber}
                        </td>
                        <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-[10px] sm:text-xs md:text-sm text-gray-700 whitespace-nowrap">
                          {e.visitorMobile || "—"}
                        </td>
                        <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-[10px] sm:text-xs md:text-sm text-gray-900 whitespace-nowrap">
                          {e.bayId?.bayName || "—"}
                        </td>
                        <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-[10px] sm:text-xs md:text-sm text-gray-700 whitespace-nowrap">
                          {e.visitorCompany || "—"}
                        </td>
                        <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-[10px] sm:text-xs md:text-sm text-gray-700 whitespace-nowrap">
                          {e.tenantName || "—"}
                        </td>
                        <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-[10px] sm:text-xs md:text-sm text-gray-700 whitespace-nowrap">
                          {e.purpose || "—"}
                        </td>
                        <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-[10px] sm:text-xs md:text-sm text-gray-700 whitespace-nowrap">
                          {e.createdBy?.name || "—"}
                        </td>
                        <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-[10px] sm:text-xs md:text-sm whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-xs font-medium capitalize
                              ${
                                e.entryMethod === "ocr"
                                  ? "bg-blue-100 text-blue-700"
                                  : e.entryMethod === "manual"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-purple-100 text-purple-700"
                              }`}
                          >
                            {e.entryMethod || "Manual"}
                          </span>
                        </td>
                        <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-[10px] sm:text-xs md:text-sm whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-xs font-semibold
                              ${
                                e.outTime
                                  ? "bg-red-100 text-red-700"
                                  : "bg-green-100 text-green-700"
                              }`}
                          >
                            {e.outTime ? "OUT" : "IN"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchEntries;