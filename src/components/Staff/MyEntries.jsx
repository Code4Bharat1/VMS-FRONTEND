"use client";
import { useState, useEffect } from "react";
import axios from "axios";

export default function MyEntries() {
  const [date, setDate] = useState("Today");
  const [bay, setBay] = useState("All bays");
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [staff, setStaff] = useState(null);
  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/entries`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

   const list = Array.isArray(res.data)
  ? res.data
  : Array.isArray(res.data.data)
  ? res.data.data
  : Array.isArray(res.data.entries)
  ? res.data.entries
  : [];

setEntries(list);
setSelected(list[0] || null);

        setSelected(res.data?.[0] || null);
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
  
    if (storedUser) {
      setStaff(JSON.parse(storedUser));
    }
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
  // ✅ Filter by bay (date logic can be added later)
const filteredEntries = Array.isArray(entries)
  ? entries.filter((e) => {
      if (bay !== "All bays" && e.bay !== bay) return false;
      return true;
    })
  : [];

  return (
    <div className="flex h-screen">

      <main className="flex-1 overflow-auto">
        {/* Header */}
           <div className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">My Entries</h1>
              <p className="text-gray-500 mt-1">Entries captured by you</p>   
            </div>
            <div className="flex items-center gap-3">
<div className="flex items-center gap-4">
  <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-semibold">
    {(staff?.name || '')
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()}
  </div>

  <div>
    <h2 className="text-2xl font-semibold text-gray-800">
      {staff?.name || 'staff'}
    </h2>

    <p className="text-gray-500 text-sm">
      {staff?.role || 'staff'}
     
    </p>
  </div>
</div>

    
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-5">
          {/* TABLE */}
          <div className="col-span-12 lg:col-span-8 p-4">
            <h3 className="font-semibold text-xl mb-3">
              Entries captured by you
            </h3>

            {/* Filters */}
            <div className="flex gap-2 mb-3 text-xs flex-wrap">
              <select
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="border rounded px-2 h-8"
              >
                <option>Today</option>
                <option>Yesterday</option>
                <option>Last 7 days</option>
              </select>

              <select
                value={bay}
                onChange={(e) => setBay(e.target.value)}
                className="border rounded px-2 h-8"
              >
                <option>All bays</option>
                <option>Bay A</option>
                <option>Bay B</option>
                <option>Bay C</option>
              </select>
            </div>

            {/* Table */}
            {loading ? (
              <p className="text-sm text-gray-500">Loading entries...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead className="bg-green-50">
                    <tr>
                      <th className="p-2 text-left">Time In</th>
                      <th className="p-2 text-left">Vehicle Number</th>
                      <th className="p-2 text-left">Visitor</th>
                      <th className="p-2 text-left">Company</th>
                      <th className="p-2 text-left">Bay</th>
                      <th className="p-2 text-left">Method</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredEntries.map((e) => (
                      <tr
                        key={e._id}
                        onClick={() => setSelected(e)}
                        className={`border-t cursor-pointer hover:bg-gray-50 ${
                          selected?._id === e._id ? "bg-green-50" : ""
                        }`}
                      >
                        <td className="p-2">{formatDateTime(e.createdAt)}</td>
                        <td className="p-2">{e.vehicleNumber}</td>
                        <td className="p-2">{e.visitorName}</td>
                        <td className="p-2">{e.visitorCompany}</td>
                        <td className="p-2">{e.bayName}</td>
                        <td className="p-2">{e.vehicleType}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredEntries.length === 0 && (
                  <p className="text-xs text-gray-500 mt-3">
                    No entries found for selected filters.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* RIGHT PANEL */}
          <div className="col-span-12 lg:col-span-4 space-y-4">
            {selected && (
              <div className="bg-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-sm mb-2">
                  Selected entry summary
                </h3>

                <p className="font-bold text-lg mb-4">
                  {selected && selected.visitorName}

                </p>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-gray-500">Mobile No</span>
                    <p className="font-medium">{selected.visitorMobile}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">QID</span>
                    <p className="font-medium">
                      {selected.qidNumber || "—"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Vehicle No</span>
                    <p className="font-medium">
                      {selected.vehicleNumber}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Bay</span>
                    <p className="font-medium">{selected.bayName}</p>
                  </div>
                </div>

                <div className="text-xs mt-3">
                  <p className="text-gray-500">Purpose & destination</p>
                  <p>Delivery – {selected.visitorCompany}</p>
                  <p className="mt-2">
                    Time in: {selected.timeIn} • Status:{" "}
                    <strong>{selected.status}</strong>
                  </p>
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="bg-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-sm mb-3">
                My entry statistics
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-gray-50 p-2 rounded">
                  Total entries
                  <br />
                  <strong>{entries.length}</strong>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  Manual share
                  <br />
                  <strong>
                    {Math.round(
                      (entries.filter(e => e.method === "Manual").length /
                        Math.max(entries.length, 1)) * 100
                    )}%
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
