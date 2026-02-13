"use client";
import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Download, 
  Filter,
  X,
  Calendar,
  Building2,
  CreditCard,
  FileText,
  ArrowUpDown
} from "lucide-react";

export default function MyEntries() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [staff, setStaff] = useState(null);

  /* SEARCH & FILTERS */
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [bayFilter, setBayFilter] = useState("all");
  const [entryTypeFilter, setEntryTypeFilter] = useState("all");
  const [customDateRange, setCustomDateRange] = useState({ start: "", end: "" });
  
  /* MOBILE POPUP & FILTERS */
  const [showMobilePopup, setShowMobilePopup] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  /* PAGINATION */
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  /* SORTING */
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/entries`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const list = Array.isArray(res.data)
          ? res.data
          : res.data.entries || [];

        setEntries(list);
        setSelected(list[0] || null);
      } catch (err) {
        console.error("Failed to load entries", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setStaff(JSON.parse(storedUser));
  }, []);

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

  /* DATE FILTER LOGIC */
  const isWithinDateRange = (entryDate) => {
    const date = new Date(entryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (dateFilter) {
      case "today":
        return date >= today;
      case "week":
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return date >= weekAgo;
      case "month":
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return date >= monthAgo;
      case "custom":
        if (!customDateRange.start || !customDateRange.end) return true;
        const start = new Date(customDateRange.start);
        const end = new Date(customDateRange.end);
        end.setHours(23, 59, 59, 999);
        return date >= start && date <= end;
      default:
        return true;
    }
  };

  /* GET UNIQUE BAYS */
  const uniqueBays = useMemo(() => {
    const bays = [...new Set(entries.map(e => e.bayId?.bayName).filter(Boolean))];
    return bays.sort();
  }, [entries]);

  /* FILTERED & SORTED ENTRIES */
  const filteredEntries = useMemo(() => {
    let filtered = entries.filter((e) => {
      if (staff?.assignedBay?.bayName) {
        if (e.bayId?.bayName !== staff.assignedBay.bayName) return false;
      }

      if (!isWithinDateRange(e.createdAt)) return false;
      
      // Status filter - handle both uppercase and case variations
      if (statusFilter !== "all") {
        const entryStatus = (e.status || "IN").toUpperCase();
        if (entryStatus !== statusFilter.toUpperCase()) return false;
      }
      
      // Bay filter - exact match
      if (bayFilter !== "all") {
        if (e.bayId?.bayName !== bayFilter) return false;
      }

      if (entryTypeFilter !== "all") {
        const type = (e.entryMethod || "manual").toLowerCase();
        if (type !== entryTypeFilter) return false;
      }

      if (search) {
        const q = search.toLowerCase();
        return (
          e.vehicleNumber?.toLowerCase().includes(q) ||
          e.visitorName?.toLowerCase().includes(q) ||
          e.visitorMobile?.includes(q) ||
          e.visitorCompany?.toLowerCase().includes(q) ||
          e.qidNumber?.toLowerCase().includes(q) ||
          e.purpose?.toLowerCase().includes(q) ||
          e.tenantName?.toLowerCase().includes(q)
        );
      }

      return true;
    });

    filtered.sort((a, b) => {
      let aVal, bVal;

      switch (sortField) {
        case "createdAt":
          aVal = new Date(a.createdAt);
          bVal = new Date(b.createdAt);
          break;
        case "visitorName":
          aVal = (a.visitorName || "").toLowerCase();
          bVal = (b.visitorName || "").toLowerCase();
          break;
        case "vehicleNumber":
          aVal = (a.vehicleNumber || "").toLowerCase();
          bVal = (b.vehicleNumber || "").toLowerCase();
          break;
        case "status":
          aVal = a.status || "";
          bVal = b.status || "";
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [entries, search, dateFilter, statusFilter, bayFilter, entryTypeFilter, customDateRange, staff, sortField, sortOrder]);

  /* PAGINATION LOGIC */
  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedEntries = filteredEntries.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  /* RESET FILTERS */
  const resetFilters = () => {
    setSearch("");
    setDateFilter("all");
    setStatusFilter("all");
    setBayFilter("all");
    setEntryTypeFilter("all");
    setCustomDateRange({ start: "", end: "" });
    setCurrentPage(1);
  };

  /* ACTIVE FILTERS COUNT */
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (search) count++;
    if (dateFilter !== "all") count++;
    if (statusFilter !== "all") count++;
    if (bayFilter !== "all") count++;
    if (entryTypeFilter !== "all") count++;
    return count;
  }, [search, dateFilter, statusFilter, bayFilter, entryTypeFilter]);

  /* EXPORT TO CSV */
  const exportToCSV = () => {
    if (filteredEntries.length === 0) {
      alert("No entries to export");
      return;
    }

    const headers = [
      "Date & Time",
      "Visitor Name",
      "QID Number",
      "Vehicle Number",
      "Mobile Number",
      "Bay",
      "Company",
      "Tenant",
      "Purpose",
      "Entry Type",
      "Status"
    ];

    const csvData = filteredEntries.map(e => [
      formatDateTime(e.createdAt),
      e.visitorName || "",
      e.qidNumber || "",
      e.vehicleNumber || "",
      e.visitorMobile || "",
      e.bayId?.bayName || "",
      e.visitorCompany || "",
      e.tenantName || "",
      e.purpose || "",
      (e.entryMethod || "Manual"),
      e.status || "IN"
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `entries_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /* HANDLE SORT */
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  return (
    <div className="min-h-screen bg-emerald-50/60">
      {/* HEADER */}
      <div className="sticky top-0 z-40 bg-white border-b border-emerald-100 px-4 sm:px-8 py-4 sm:py-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-emerald-800">My Entries</h1>
            <p className="text-sm text-emerald-600 mt-1">
              {filteredEntries.length} {filteredEntries.length === 1 ? 'entry' : 'entries'} captured by you
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md">
              {(staff?.name || "")
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm sm:text-base font-semibold text-emerald-800">
                {staff?.name}
              </p>
              <p className="text-xs sm:text-sm text-emerald-600 capitalize">
                {staff?.role}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SEARCH & FILTERS */}
      <div className="px-4 sm:px-8 py-6">
        <div className="bg-white border border-emerald-100 rounded-xl p-4 sm:p-6 shadow-sm space-y-4">
          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" size={20} />
              <input
                type="text"
                placeholder="Search by VRN, visitor name, mobile, company, QID, tenant, or purpose..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-11 w-full rounded-lg pl-10 pr-4 border border-emerald-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            
            {/* Mobile Filter Button */}
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="lg:hidden flex items-center justify-center gap-2 px-4 h-11 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition"
            >
              <Filter size={18} />
              Filters
              {activeFiltersCount > 0 && (
                <span className="bg-white text-emerald-600 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Export Button */}
            <button
              onClick={exportToCSV}
              disabled={filteredEntries.length === 0}
              className="flex items-center justify-center gap-2 px-4 h-11 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={18} />
              <span className="hidden sm:inline">Export CSV</span>
              <span className="sm:hidden">Export</span>
            </button>
          </div>

          {/* Desktop Filters */}
          <div className="hidden lg:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Date Filter */}
            <div>
              <label className="block text-xs font-medium text-emerald-700 mb-1.5">
                <Calendar size={14} className="inline mr-1" />
                Date Range
              </label>
              <select
                value={dateFilter}
                onChange={(e) => {
                  setDateFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-10 w-full rounded-lg px-3 border border-emerald-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-xs font-medium text-emerald-700 mb-1.5">
                <FileText size={14} className="inline mr-1" />
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-10 w-full rounded-lg px-3 border border-emerald-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Status</option>
                <option value="IN">In</option>
                <option value="OUT">Out</option>
              </select>
            </div>

            {/* Bay Filter */}
            <div>
              <label className="block text-xs font-medium text-emerald-700 mb-1.5">
                <Building2 size={14} className="inline mr-1" />
                Bay
              </label>
              <select
                value={bayFilter}
                onChange={(e) => {
                  setBayFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-10 w-full rounded-lg px-3 border border-emerald-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                disabled={staff?.assignedBay?.bayName}
              >
                <option value="all">All Bays</option>
                {uniqueBays.map(bay => (
                  <option key={bay} value={bay}>{bay}</option>
                ))}
              </select>
            </div>

            {/* Entry Type Filter */}
            <div>
              <label className="block text-xs font-medium text-emerald-700 mb-1.5">
                <CreditCard size={14} className="inline mr-1" />
                Entry Type
              </label>
              <select
                value={entryTypeFilter}
                onChange={(e) => {
                  setEntryTypeFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-10 w-full rounded-lg px-3 border border-emerald-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Types</option>
                <option value="manual">Manual</option>
                <option value="ocr">OCR</option>
              </select>
            </div>
          </div>

          {/* Custom Date Range */}
          {dateFilter === "custom" && (
            <div className="hidden lg:grid grid-cols-2 gap-3 pt-2 border-t border-emerald-100">
              <div>
                <label className="block text-xs font-medium text-emerald-700 mb-1.5">
                  Start Date
                </label>
                <input
                  type="date"
                  value={customDateRange.start}
                  onChange={(e) => {
                    setCustomDateRange({ ...customDateRange, start: e.target.value });
                    setCurrentPage(1);
                  }}
                  className="h-10 w-full rounded-lg px-3 border border-emerald-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-emerald-700 mb-1.5">
                  End Date
                </label>
                <input
                  type="date"
                  value={customDateRange.end}
                  onChange={(e) => {
                    setCustomDateRange({ ...customDateRange, end: e.target.value });
                    setCurrentPage(1);
                  }}
                  className="h-10 w-full rounded-lg px-3 border border-emerald-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}

          {/* Active Filters & Reset */}
          {activeFiltersCount > 0 && (
            <div className="flex items-center justify-between pt-2 border-t border-emerald-100">
              <p className="text-sm text-emerald-600">
                {activeFiltersCount} active {activeFiltersCount === 1 ? 'filter' : 'filters'}
              </p>
              <button
                onClick={resetFilters}
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
              >
                <X size={16} />
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Mobile Filters Panel */}
        {showMobileFilters && (
          <div className="lg:hidden mt-4 bg-white border border-emerald-100 rounded-xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-emerald-800">Filters</h3>
              <button onClick={() => setShowMobileFilters(false)}>
                <X size={20} className="text-emerald-600" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-emerald-700 mb-1.5">Date Range</label>
              <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="h-10 w-full rounded-lg px-3 border border-emerald-200 text-sm">
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            {dateFilter === "custom" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-emerald-700 mb-1.5">Start Date</label>
                  <input type="date" value={customDateRange.start} onChange={(e) => setCustomDateRange({ ...customDateRange, start: e.target.value })} className="h-10 w-full rounded-lg px-3 border border-emerald-200 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-emerald-700 mb-1.5">End Date</label>
                  <input type="date" value={customDateRange.end} onChange={(e) => setCustomDateRange({ ...customDateRange, end: e.target.value })} className="h-10 w-full rounded-lg px-3 border border-emerald-200 text-sm" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-emerald-700 mb-1.5">Status</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-10 w-full rounded-lg px-3 border border-emerald-200 text-sm">
                <option value="all">All Status</option>
                <option value="IN">In</option>
                <option value="OUT">Out</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-emerald-700 mb-1.5">Bay</label>
              <select value={bayFilter} onChange={(e) => setBayFilter(e.target.value)} className="h-10 w-full rounded-lg px-3 border border-emerald-200 text-sm" disabled={staff?.assignedBay?.bayName}>
                <option value="all">All Bays</option>
                {uniqueBays.map(bay => (
                  <option key={bay} value={bay}>{bay}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-emerald-700 mb-1.5">Entry Type</label>
              <select value={entryTypeFilter} onChange={(e) => setEntryTypeFilter(e.target.value)} className="h-10 w-full rounded-lg px-3 border border-emerald-200 text-sm">
                <option value="all">All Types</option>
                <option value="manual">Manual</option>
                <option value="ocr">OCR</option>
              </select>
            </div>

            <button onClick={() => { setShowMobileFilters(false); setCurrentPage(1); }} className="w-full h-10 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition">
              Apply Filters
            </button>

            {activeFiltersCount > 0 && (
              <button onClick={() => { resetFilters(); setShowMobileFilters(false); }} className="w-full h-10 border border-emerald-200 text-emerald-600 rounded-lg font-medium hover:bg-emerald-50 transition">
                Clear All Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div className="px-4 sm:px-8 pb-6">
        {/* DESKTOP TABLE */}
        <div className="hidden lg:block bg-white border border-emerald-100 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-emerald-100 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-emerald-800">Entries List</h3>
              <p className="text-sm text-emerald-600 mt-1">
                Showing {startIndex + 1}-{Math.min(endIndex, filteredEntries.length)} of {filteredEntries.length} entries
              </p>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-emerald-600">Show:</label>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="h-9 rounded-lg px-3 border border-emerald-200 text-sm"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
              <p className="text-sm text-emerald-600 mt-3">Loading entries...</p>
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="p-12 text-center">
              <Search size={48} className="mx-auto text-emerald-300 mb-3" />
              <p className="text-emerald-600 font-medium">No entries found</p>
              <p className="text-sm text-emerald-500 mt-1">Try adjusting your filters or search term</p>
            </div>
          ) : (
            <>
              {/* Scroll Hint */}
              <div className="bg-emerald-50 px-4 py-2 border-b border-emerald-100">
                <p className="text-xs text-emerald-700 font-medium flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                  Scroll horizontally to view all columns →
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-emerald-50">
                    <tr className="text-emerald-700 text-xs uppercase">
                      <th onClick={() => handleSort("createdAt")} className="px-4 py-3 text-left font-semibold cursor-pointer hover:bg-emerald-100 transition whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          Date & Time
                          <ArrowUpDown size={14} />
                        </div>
                      </th>
                      <th onClick={() => handleSort("visitorName")} className="px-4 py-3 text-left font-semibold cursor-pointer hover:bg-emerald-100 transition whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          Visitor Name
                          <ArrowUpDown size={14} />
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">QID</th>
                      <th onClick={() => handleSort("vehicleNumber")} className="px-4 py-3 text-left font-semibold cursor-pointer hover:bg-emerald-100 transition whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          VRN
                          <ArrowUpDown size={14} />
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Mobile No</th>
                      <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Bay</th>
                      <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Company</th>
                      <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Tenant</th>
                      <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Purpose</th>
                      <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Entry Type</th>
                      <th onClick={() => handleSort("status")} className="px-4 py-3 text-left font-semibold cursor-pointer hover:bg-emerald-100 transition whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          Status
                          <ArrowUpDown size={14} />
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-100">
                    {paginatedEntries.map((e) => (
                      <tr key={e._id} onClick={() => setSelected(e)} className="cursor-pointer hover:bg-emerald-50 transition">
                        <td className="px-4 py-3 text-emerald-700 whitespace-nowrap">{formatDateTime(e.createdAt)}</td>
                        <td className="px-4 py-3 font-medium whitespace-nowrap">{e.visitorName || "—"}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{e.qidNumber || "—"}</td>
                        <td className="px-4 py-3 font-semibold text-emerald-800 whitespace-nowrap">{e.vehicleNumber}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{e.visitorMobile || "—"}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 rounded-md text-xs">
                            <Building2 size={12} />
                            {e.bayId?.bayName || "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">{e.visitorCompany || "—"}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{e.tenantName || "—"}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{e.purpose || "—"}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="capitalize px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs">
                            {e.entryMethod || "Manual"}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            e.status === "IN" ? "bg-emerald-100 text-emerald-700" :
                            e.status === "OUT" ? "bg-gray-200 text-gray-700" :
                            "bg-yellow-100 text-yellow-700"
                          }`}>
                            {e.status || "IN"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* PAGINATION */}
          {!loading && filteredEntries.length > 0 && (
            <div className="px-6 py-4 bg-emerald-50 border-t border-emerald-100 flex items-center justify-between">
              <span className="text-sm text-emerald-600">
                Page {currentPage} of {totalPages}
              </span>

              <div className="flex items-center gap-2">
                <button onClick={() => handlePageChange(1)} disabled={currentPage === 1} className="px-3 py-1.5 border border-emerald-200 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition">
                  First
                </button>
                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="p-2 border border-emerald-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition">
                  <ChevronLeft size={18} />
                </button>
                
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button key={pageNum} onClick={() => handlePageChange(pageNum)} className={`w-9 h-9 rounded-lg text-sm font-medium transition ${
                        currentPage === pageNum ? "bg-emerald-600 text-white" : "border border-emerald-200 hover:bg-white"
                      }`}>
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 border border-emerald-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition">
                  <ChevronRight size={18} />
                </button>
                <button onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} className="px-3 py-1.5 border border-emerald-200 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition">
                  Last
                </button>
              </div>
            </div>
          )}
        </div>

        {/* MOBILE CARDS */}
        <div className="lg:hidden space-y-4">
          {loading ? (
            <div className="bg-white rounded-xl p-12 text-center border border-emerald-100">
              <div className="inline-block w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
              <p className="text-sm text-emerald-600 mt-3">Loading entries...</p>
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center border border-emerald-100">
              <Search size={48} className="mx-auto text-emerald-300 mb-3" />
              <p className="text-emerald-600 font-medium">No entries found</p>
              <p className="text-sm text-emerald-500 mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-xl p-4 border border-emerald-100">
                <p className="text-sm text-emerald-600">
                  Showing {startIndex + 1}-{Math.min(endIndex, filteredEntries.length)} of {filteredEntries.length}
                </p>
              </div>

              {paginatedEntries.map((e) => (
                <div key={e._id} onClick={() => { setSelected(e); setShowMobilePopup(true); }} className="bg-white border border-emerald-100 rounded-xl shadow-sm p-4 hover:shadow-md transition">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-emerald-800 text-base">{e.vehicleNumber}</h4>
                      <p className="text-xs text-emerald-600 mt-0.5">{formatDateTime(e.createdAt)}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      e.status === "IN" ? "bg-emerald-100 text-emerald-700" : "bg-gray-200 text-gray-700"
                    }`}>
                      {e.status || "IN"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
                    <div>
                      <span className="text-emerald-600 text-xs block mb-0.5">Visitor</span>
                      <span className="font-medium text-emerald-800">{e.visitorName || "—"}</span>
                    </div>
                    <div>
                      <span className="text-emerald-600 text-xs block mb-0.5">Mobile</span>
                      <span className="font-medium text-emerald-800">{e.visitorMobile || "—"}</span>
                    </div>
                    <div>
                      <span className="text-emerald-600 text-xs block mb-0.5">Bay</span>
                      <span className="font-medium text-emerald-800 flex items-center gap-1">
                        <Building2 size={12} className="text-emerald-600" />
                        {e.bayId?.bayName || "—"}
                      </span>
                    </div>
                    <div>
                      <span className="text-emerald-600 text-xs block mb-0.5">Entry Type</span>
                      <span className="font-medium text-emerald-800 capitalize">{e.entryMethod || "Manual"}</span>
                    </div>
                    {e.visitorCompany && (
                      <div className="col-span-2">
                        <span className="text-emerald-600 text-xs block mb-0.5">Company</span>
                        <span className="font-medium text-emerald-800">{e.visitorCompany}</span>
                      </div>
                    )}
                    {e.purpose && (
                      <div className="col-span-2">
                        <span className="text-emerald-600 text-xs block mb-0.5">Purpose</span>
                        <span className="font-medium text-emerald-800">{e.purpose}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {totalPages > 1 && (
                <div className="bg-white p-4 rounded-xl border border-emerald-100 flex items-center justify-between">
                  <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="px-4 py-2 border border-emerald-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm hover:bg-emerald-50 transition">
                    Previous
                  </button>
                  <span className="text-sm text-emerald-600 font-medium">{currentPage} / {totalPages}</span>
                  <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-4 py-2 border border-emerald-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm hover:bg-emerald-50 transition">
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile Detail Popup */}
      {showMobilePopup && selected && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-2xl max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-emerald-100 px-4 py-4 flex items-center justify-between">
              <h3 className="font-semibold text-emerald-800">Entry Details</h3>
              <button onClick={() => setShowMobilePopup(false)} className="p-2 hover:bg-emerald-50 rounded-lg transition">
                <X size={20} className="text-emerald-600" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div className="bg-emerald-50 rounded-lg p-3">
                <p className="text-xs text-emerald-600 mb-1">Vehicle Number</p>
                <p className="text-lg font-bold text-emerald-800">{selected.vehicleNumber}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white border border-emerald-100 rounded-lg p-3">
                  <p className="text-xs text-emerald-600 mb-1">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    selected.status === "IN" ? "bg-emerald-100 text-emerald-700" : "bg-gray-200 text-gray-700"
                  }`}>
                    {selected.status || "IN"}
                  </span>
                </div>
                <div className="bg-white border border-emerald-100 rounded-lg p-3">
                  <p className="text-xs text-emerald-600 mb-1">Entry Type</p>
                  <p className="font-medium text-emerald-800 capitalize">{selected.entryMethod || "Manual"}</p>
                </div>
              </div>

              <div className="bg-white border border-emerald-100 rounded-lg p-3">
                <p className="text-xs text-emerald-600 mb-1">Date & Time</p>
                <p className="font-medium text-emerald-800">{formatDateTime(selected.createdAt)}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white border border-emerald-100 rounded-lg p-3">
                  <p className="text-xs text-emerald-600 mb-1">Visitor Name</p>
                  <p className="font-medium text-emerald-800">{selected.visitorName || "—"}</p>
                </div>
                <div className="bg-white border border-emerald-100 rounded-lg p-3">
                  <p className="text-xs text-emerald-600 mb-1">Mobile</p>
                  <p className="font-medium text-emerald-800">{selected.visitorMobile || "—"}</p>
                </div>
                <div className="bg-white border border-emerald-100 rounded-lg p-3">
                  <p className="text-xs text-emerald-600 mb-1">QID</p>
                  <p className="font-medium text-emerald-800">{selected.qidNumber || "—"}</p>
                </div>
                <div className="bg-white border border-emerald-100 rounded-lg p-3">
                  <p className="text-xs text-emerald-600 mb-1">Bay</p>
                  <p className="font-medium text-emerald-800">{selected.bayId?.bayName || "—"}</p>
                </div>
              </div>

              {selected.visitorCompany && (
                <div className="bg-white border border-emerald-100 rounded-lg p-3">
                  <p className="text-xs text-emerald-600 mb-1">Company</p>
                  <p className="font-medium text-emerald-800">{selected.visitorCompany}</p>
                </div>
              )}

              {selected.tenantName && (
                <div className="bg-white border border-emerald-100 rounded-lg p-3">
                  <p className="text-xs text-emerald-600 mb-1">Tenant</p>
                  <p className="font-medium text-emerald-800">{selected.tenantName}</p>
                </div>
              )}

              {selected.purpose && (
                <div className="bg-white border border-emerald-100 rounded-lg p-3">
                  <p className="text-xs text-emerald-600 mb-1">Purpose</p>
                  <p className="font-medium text-emerald-800">{selected.purpose}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}