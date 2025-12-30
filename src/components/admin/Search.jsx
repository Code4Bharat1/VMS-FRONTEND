"use client";

import { useEffect, useState } from "react";
import { Search, FileDown } from "lucide-react";
import axios from "axios";

export default function SearchRecords() {
  const [entries, setEntries] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

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

  /* ================= SEARCH ================= */
  useEffect(() => {
    if (!search.trim()) {
      setFiltered(entries);
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
  }, [search, entries]);

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
    <div className="min-h-screen bg-teal-50">
      {/* ================= HEADER ================= */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-8 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-[18px] sm:text-[22px] font-semibold text-gray-800">
              Search Records
            </h1>
            <p className="text-[13px] sm:text-[14px] text-gray-500 mt-1">
              Search across visitor, staff, supervisor and tenant records
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {/* SEARCH */}
            <div className="relative w-full sm:w-72">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search records"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 h-10 w-full rounded-lg
                           border border-gray-300 text-[14px]
                           focus:outline-none focus:ring-2
                           focus:ring-emerald-500"
              />
            </div>

            {/* EXPORT */}
            <button
              onClick={exportToCSV}
              className="flex items-center justify-center gap-2 px-4 h-10
                         rounded-lg bg-emerald-600 text-white text-[14px]"
            >
              <FileDown size={16} />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* ================= CONTENT ================= */}
      <div className="px-4 sm:px-8 py-6">
        {/* ========== DESKTOP TABLE ========== */}
        <div className="hidden sm:block bg-white rounded-2xl shadow-sm overflow-x-auto">
          <table className="min-w-[900px] w-full">
            <thead className="border-b border-gray-200 bg-green-100">
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
                    className="px-6 py-4 text-left text-[14px]
                               font-medium text-gray-600"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {!loading && filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-6 text-center text-[14px] text-gray-400"
                  >
                    No records found
                  </td>
                </tr>
              )}

              {filtered.map((e) => (
                <tr key={e._id} className="hover:bg-green-50">
                  <td className="px-6 py-4 text-[14px]">
                    {formatTime(e.inTime)}
                  </td>
                  <td className="px-6 py-4 text-[14px]">
                    {e.bayId?.bayName || "—"}
                  </td>
                  <td className="px-6 py-4 text-[14px]">
                    {e.vehicleNumber}
                  </td>
                  <td className="px-6 py-4 text-[14px]">
                    {e.visitorName || "—"}
                  </td>
                  <td className="px-6 py-4 text-[14px]">
                    {e.visitorCompany || "—"}
                  </td>
                  <td className="px-6 py-4 text-[14px]">
                    {e.createdBy?.name || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ========== MOBILE CARDS ========== */}
        <div className="sm:hidden space-y-4">
          {!loading && filtered.length === 0 && (
            <div className="text-center text-[14px] text-gray-400">
              No records found
            </div>
          )}

          {filtered.map((e) => (
            <div
              key={e._id}
              className="bg-white rounded-xl shadow-sm p-4 space-y-2"
            >
              <div className="text-[13px] text-gray-500">
                {formatTime(e.inTime)}
              </div>

              <div className="text-[14px] font-medium text-gray-800">
                {e.visitorName || "—"}
              </div>

              <div className="text-[13px] text-gray-600">
                <span className="font-medium">VRN:</span>{" "}
                {e.vehicleNumber || "—"}
              </div>

              <div className="text-[13px] text-gray-600">
                <span className="font-medium">Company:</span>{" "}
                {e.visitorCompany || "—"}
              </div>

              <div className="text-[13px] text-gray-600">
                <span className="font-medium">Bay:</span>{" "}
                {e.bayId?.bayName || "—"}
              </div>

              <div className="text-[13px] text-gray-600">
                <span className="font-medium">Handled By:</span>{" "}
                {e.createdBy?.name || "—"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
