"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function MyEntries() {
  const [date, setDate] = useState("Today");
  const [bay, setBay] = useState("All bays");
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [staff, setStaff] = useState(null);

  /* ✅ MOBILE POPUP */
  const [showMobilePopup, setShowMobilePopup] = useState(false);

  /* ✅ PAGINATION (ONLY ADDITION) */
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  /* 🔒 FILTER (UNCHANGED) */
  const filteredEntries = entries.filter((e) => {
    if (staff?.assignedBay?.bayName) {
      if (e.bayId?.bayName !== staff.assignedBay.bayName) return false;
    }
    if (bay !== "All bays" && e.bayId?.bayName !== bay) return false;
    return true;
  });

  /* ✅ PAGINATION LOGIC */
  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedEntries = filteredEntries.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <div className="min-h-screen bg-emerald-50/60">
      {/* HEADER */}
      <div className="sticky top-0 z-40 bg-white border-b border-emerald-100 px-4 sm:px-8 py-4 sm:py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-emerald-800">My Entries</h1>
            <p className="text-sm text-emerald-600 mt-1">
              Entries captured by you
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold">
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

      {/* CONTENT */}
      <div className="px-4 sm:px-8 py-6 grid grid-cols-12 gap-6">
        {/* DESKTOP TABLE */}
        <div className="hidden w-full lg:block col-span-12 bg-white border border-emerald-100 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-emerald-100">
            <h3 className="font-semibold text-emerald-800">
              Entries captured by you
            </h3>
            <p className="text-sm text-emerald-600 mt-1">
              View all your captured entries
            </p>
          </div>

          {loading ? (
            <p className="p-6 text-sm text-emerald-600">Loading entries…</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-emerald-100">
                <tr className="text-emerald-700">
                  {[
                    "Time",
                    "QID",
                    "Vehicle No",
                    "Visitor",
                    "Company",
                    "Bay",
                    "Vehicle",
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
                    onClick={() => setSelected(e)}
                    className="cursor-pointer hover:bg-emerald-50 transition text-center"
                  >
                    <td className="px-6 py-4">{formatDateTime(e.createdAt)}</td>
                    <td className="px-6 py-4">{e.qidNumber}</td>
                    <td className="px-6 py-4 font-medium text-emerald-800">
                      {e.vehicleNumber}
                    </td>
                    <td className="px-6 py-4">{e.visitorName}</td>
                    <td className="px-6 py-4">{e.visitorCompany}</td>
                    <td className="px-6 py-4">{e.bayId?.bayName || "—"}</td>
                    <td className="px-6 py-4 capitalize">{e.vehicleType}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* PAGINATION */}
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
        </div>

        {/* MOBILE CARDS */}
        <div className="lg:hidden col-span-12 space-y-4">
          {paginatedEntries.map((e) => (
            <div
              key={e._id}
              onClick={() => {
                setSelected(e);
                setShowMobilePopup(true);
              }}
              className="bg-white border border-emerald-100 rounded-lg shadow-sm p-4"
            >
              <div className="mt-3 grid grid-cols-2 gap-y-2 text-sm">
                <span className="text-emerald-600">Vehicle</span>
                <span className="font-medium text-emerald-800">{e.vehicleNumber}</span>

                <span className="text-emerald-600">Bay</span>
                <span className="font-medium text-emerald-800">{e.bayId?.bayName || "--"}</span>

                <span className="text-emerald-600">Method</span>
                <span className="font-medium text-emerald-800 capitalize">{e.vehicleType}</span>

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

          {totalPages > 1 && (
            <div className="bg-white p-4 rounded-lg border flex justify-between">
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
