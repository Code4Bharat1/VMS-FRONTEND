"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function StaffDashboardPage() {
  const [entries, setEntries] = useState([]);
  const [bays, setBays] = useState([]);
  const [staff, setStaff] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  /* ---------------- FETCH DATA (UNCHANGED) ---------------- */
  useEffect(() => {
    fetchData();

    const storedUser = localStorage.getItem("user");
    if (storedUser) setStaff(JSON.parse(storedUser));
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      const [entriesRes, baysRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/entries`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/bays`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setEntries(entriesRes.data.entries || []);
      setBays(baysRes.data.bays || []);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    }
  };

  /* ---------------- DERIVED STATS (UNCHANGED) ---------------- */
  const today = new Date().toDateString();

  const todayEntries = entries.filter(
    (e) => e.inTime && new Date(e.inTime).toDateString() === today
  );

  const activeBays = bays.filter(
    (b) => String(b.status).toLowerCase() === "active"
  );

  const lastEntry = [...entries]
    .filter((e) => e.inTime)
    .sort((a, b) => new Date(b.inTime) - new Date(a.inTime))[0];

  const getBayName = (bayId) => {
    const bay = bays.find((b) => b._id === bayId);
    return bay ? bay.bayId?.bayName : "--";
  };

  const staffBayName = staff?.assignedBay?.bayName;

  const filteredEntries = entries.filter((e) => {
    if (!staffBayName) return false;
    return e.bayId?.bayName === staffBayName;
  });

  /* ---------------- PAGINATION ---------------- */
  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedEntries = filteredEntries.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-emerald-50/60">
      {/* NAVBAR */}
      <div className="sticky top-0 z-40 bg-white border-b border-emerald-100 px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-emerald-800">
              Security Staff Panel
            </h1>
            <p className="text-sm text-emerald-600 mt-1">
              Lowest access view for on-site guards. One-way entry capture only.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold">
              {(staff?.name || "")
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </div>
            <div className="leading-tight">
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

      {/* CONTENT */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Stat
            title="Today's Entries Captured"
            value={todayEntries.length}
            subtitle="Updated in real-time"
          />
          <Stat
            title="Active Bays"
            value={activeBays.length}
            subtitle={`Across bays ${activeBays
              .map((b) => b.bayId?.bayName)
              .join(", ")}`}
          />
          <Stat
            title="Last Entry Captured"
            value={
              lastEntry
                ? new Date(lastEntry.inTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "--"
            }
            subtitle="Most recent entry"
          />
        </div>

        {/* DESKTOP TABLE */}
        <div className="hidden sm:block bg-white rounded-xl border border-emerald-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-emerald-100">
            <h2 className="text-lg font-semibold text-emerald-800">
              Recent Entries
            </h2>
            <p className="text-sm text-emerald-600 mt-1">
              Entries captured during your shift
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[720px] w-full">
              <thead className="bg-emerald-100">
                <tr className="text-sm text-emerald-700">
                  {[
                    "Visitor Name",
                    "Vehicle Number",
                    "Company",
                    "Bay",
                    "Vehicle",
                    "Time In",
                  ].map((h) => (
                    <th key={h} className="px-6 py-4 text-center font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-emerald-100">
                {paginatedEntries.map((e) => (
                  <tr
                    key={e._id}
                    className="hover:bg-emerald-50 transition text-center"
                  >
                    <td className="px-6 py-4 font-medium text-[14px] text-emerald-800 capitalize">{e.visitorName}</td>
                    <td className="px-6 py-4 font-medium text-sm">{e.vehicleNumber}</td>
                    <td className="px-6 py-4 text-[16px]">{e.visitorCompany}</td>
                    <td className="px-6 py-4 text-[16px]">{e.bayId?.bayName || "--"}</td>
                    <td className="px-6 py-4 capitalize text-[16px]">{e.vehicleType}</td>
                    <td className="px-6 py-4 text-[16px]">
                      {new Date(e.inTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="px-6 py-4 bg-emerald-50 border-t border-emerald-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <select
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(e.target.value)}
                className="px-3 py-2 border border-emerald-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
              <span className="text-sm text-emerald-600">Items per page</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-emerald-600">
                {currentPage} of {totalPages} pages
              </span>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-emerald-200 hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft size={18} className="text-emerald-600" />
                </button>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-emerald-200 hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <ChevronRight size={18} className="text-emerald-600" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* MOBILE CARDS */}
        <div className="sm:hidden space-y-4">
          {paginatedEntries.map((e) => (
            <div key={e._id} className="bg-white rounded-lg border border-emerald-100 p-4 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-emerald-800">{e.visitorName}</p>
                  <p className="text-sm text-emerald-600">{e.visitorCompany}</p>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-y-2 text-sm">
                <span className="text-emerald-600">Vehicle</span>
                <span className="font-medium text-emerald-800">{e.vehicleNumber}</span>

                <span className="text-emerald-600">Bay</span>
                <span className="font-medium text-emerald-800">{e.bayId?.bayName || "--"}</span>

                <span className="text-emerald-600">Method</span>
                <span className="font-medium text-emerald-800 capitalize">{e.entryMethod}</span>

                <span className="text-emerald-600">Time In</span>
                <span className="font-medium text-emerald-800">
                  {new Date(e.inTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))}

          {/* MOBILE PAGINATION */}
          {totalPages > 1 && (
            <div className="bg-white rounded-lg border border-emerald-100 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg border border-emerald-200 text-sm font-medium text-emerald-600 hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Previous
                </button>
                
                <span className="text-sm text-emerald-600">
                  {currentPage} / {totalPages}
                </span>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg border border-emerald-200 text-sm font-medium text-emerald-600 hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* STAT CARD */
function Stat({ title, value, subtitle }) {
  return (
    <div className="bg-white border border-emerald-100 rounded-xl px-6 py-6 shadow-sm hover:shadow transition">
      <p className="text-sm text-emerald-600 mb-2">{title}</p>
      <p className="text-3xl font-bold text-emerald-800">{value}</p>
      <p className="text-sm text-emerald-500 mt-1">{subtitle}</p>
    </div>
  );
}