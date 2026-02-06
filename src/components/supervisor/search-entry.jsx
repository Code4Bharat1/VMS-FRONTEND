"use client";
import React, { useState, useEffect } from "react";
import { Search, Calendar, ChevronDown, FileDown } from "lucide-react";
import Sidebar from "./sidebar";
import axios from "axios";

const SearchEntries = () => {
  const [filterVRN, setFilterVRN] = useState("");
  const [filterQID, setFilterQID] = useState("");
  const [filterMobile, setFilterMobile] = useState("");
  const [filterCompany, setFilterCompany] = useState("");

  const [activePage, setActivePage] = useState("search");
  const [dateRange, setDateRange] = useState("Today");
  const [entryMethod, setEntryMethod] = useState("All methods");
  const [bay, setBay] = useState("");
  const [staff, setStaff] = useState("");

  const [supervisor, setSupervisor] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

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
      e.createdBy?.name?.toLowerCase().includes(q)
    );
  });

  const exportToCSV = () => {
    if (!filteredEntries.length) return;

    const headers = [
      "Time",
      "Bay",
      "VRN",
      "Visitor",
      "Company",
      "Handled By",
      "Method",
      "Direction",
    ];

    const rows = filteredEntries.map((e) => [
      e.createdAt ? new Date(e.createdAt).toLocaleString() : "",
      e.bayId?.bayName || "",
      e.vehicleNumber || "",
      e.visitorName || "",
      e.visitorCompany || "",
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
    link.download = `entries_${new Date().toISOString().slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex min-h-screen bg-emerald-50/60">
      <Sidebar activePage={activePage} onPageChange={setActivePage} />

      <div className="flex-1">
        {/* HEADER */}
        <div className="bg-white border-b border-emerald-100 px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-emerald-800">
                Search Entries
              </h1>
              <p className="text-sm text-emerald-600">
                View and search all visitor entry records
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative w-72">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400"
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search entries"
                  className="pl-10 pr-4 h-10 w-full rounded-lg
                             border border-emerald-200
                             focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-5 h-10
             rounded-lg bg-emerald-600
             hover:bg-emerald-700 text-white"
              >
                <FileDown size={16} />
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* FILTERS (kept intact, just recolored) */}
        <div className="bg-white mx-8 mt-6 p-6 rounded-xl border border-emerald-100 shadow-sm">
          <h2 className="font-semibold text-emerald-800 mb-4">Filters</h2>

          <div className="grid grid-cols-4 gap-4">
            <input
              className="h-12 px-4 rounded-lg
             border border-emerald-300
             text-base
             focus:outline-none
             focus:ring-2
             focus:ring-emerald-500"
              placeholder="VRN"
              value={filterVRN}
              onChange={(e) => setFilterVRN(e.target.value)}
            />

            <input
              className="h-12 px-4 rounded-lg
             border border-emerald-300
             text-base
             focus:outline-none
             focus:ring-2
             focus:ring-emerald-500"
              placeholder="QID"
              value={filterQID}
              onChange={(e) => setFilterQID(e.target.value)}
            />

            <input
              className="h-12 px-4 rounded-lg
             border border-emerald-300
             text-base
             focus:outline-none
             focus:ring-2
             focus:ring-emerald-500"
              placeholder="Mobile"
              value={filterMobile}
              onChange={(e) => setFilterMobile(e.target.value)}
            />

            <input
              className="h-12 px-4 rounded-lg
             border border-emerald-300
             text-base
             focus:outline-none
             focus:ring-2
             focus:ring-emerald-500"
              placeholder="Visitor / Company"
              value={filterCompany}
              onChange={(e) => setFilterCompany(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-4 gap-4 mt-4">
            <input value={dateRange} readOnly className="input" />

            <select
              value={entryMethod}
              onChange={(e) => setEntryMethod(e.target.value)}
              className="h-12 px-4 rounded-lg
             border border-emerald-300
             text-base
             bg-white
             focus:outline-none
             focus:ring-2
             focus:ring-emerald-500"
            >
              <option value="">All methods</option>
              <option value="ocr">OCR</option>
              <option value="manual">Manual</option>
              <option value="qr">QR</option>
            </select>

            <select
              value={bay}
              onChange={(e) => setBay(e.target.value)}
              className="h-12 px-4 rounded-lg border border-emerald-300 text-base bg-white
             focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {supervisor?.assignedBay && (
                <option value={supervisor.assignedBay._id}>
                  {supervisor.assignedBay.bayName}
                </option>
              )}
            </select>

            <select
              value={staff}
              onChange={(e) => setStaff(e.target.value)}
              className="h-12 px-4 rounded-lg border border-emerald-300 text-base bg-white
             focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">All my staff</option>

              {staffOptions.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* RESULTS */}
        <div className="bg-white mx-8 my-6 rounded-xl border border-emerald-100 shadow-sm overflow-x-auto">
          <table className="min-w-[1100px] w-full">
            <thead className="bg-emerald-100 border-b border-emerald-200">
              <tr>
                {[
                  "Time",
                  "Bay",
                  "VRN",
                  "Visitor",
                  "Company",
                  "Handled By",
                  "Method",
                  "Direction",
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
              {!loading && filteredEntries.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-10 text-center text-emerald-500"
                  >
                    No entries found
                  </td>
                </tr>
              )}

              {filteredEntries.map((e) => (
                <tr key={e._id} className="hover:bg-emerald-50">
                  <td className="px-6 py-4 text-sm">
                    {new Date(e.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">{e.bayId?.bayName || "—"}</td>
                  <td className="px-6 py-4">{e.vehicleNumber}</td>
                  <td className="px-6 py-4">{e.visitorName || "—"}</td>
                  <td className="px-6 py-4">{e.visitorCompany || "—"}</td>
                  <td className="px-6 py-4">{e.createdBy?.name || "—"}</td>
                  <td className="px-6 py-4 capitalize">{e.entryMethod}</td>
                  <td className="px-6 py-4">{e.outTime ? "OUT" : "IN"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SearchEntries;
