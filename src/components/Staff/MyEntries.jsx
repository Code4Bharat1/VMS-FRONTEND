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

  const filteredEntries = entries.filter((e) => {
    if (bay !== "All bays" && e.bay !== bay) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#f6f8fa]">
      {/* HEADER */}
      <div className="bg-white px-4 sm:px-8 py-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              My Entries
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Entries captured by you
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white font-semibold">
              {(staff?.name || "")
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </div>
            <div className="hidden sm:block">
              <p className="text-lg font-semibold text-gray-900">
                {staff?.name}
              </p>
              <p className="text-sm text-gray-500 capitalize">
                {staff?.role}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="px-4 sm:px-8 py-6 grid grid-cols-12 gap-6">
        {/* ================= DESKTOP TABLE ================= */}
        <div className="hidden lg:block col-span-8 bg-white rounded-xl shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between">
            <h3 className="font-semibold text-gray-900">
              Entries captured by you
            </h3>

            <div className="flex gap-2">
              <select
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-9 px-3 rounded-lg bg-gray-50 border border-gray-200 text-sm"
              >
                <option>Today</option>
                <option>Yesterday</option>
                <option>Last 7 days</option>
              </select>

              <select
                value={bay}
                onChange={(e) => setBay(e.target.value)}
                className="h-9 px-3 rounded-lg bg-gray-50 border border-gray-200 text-sm"
              >
                <option>All bays</option>
                <option>Bay A</option>
                <option>Bay B</option>
                <option>Bay C</option>
              </select>
            </div>
          </div>

          {loading ? (
            <p className="p-6 text-sm text-gray-500">Loading entries…</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left">Time</th>
                  <th className="py-3 text-left">Vehicle</th>
                  <th className="py-3 text-left">Visitor</th>
                  <th className="py-3 text-left">Company</th>
                  <th className="py-3 text-left">Bay</th>
                  <th className="py-3 text-left">Method</th>
                </tr>
              </thead>

              <tbody>
                {filteredEntries.map((e) => (
                  <tr
                    key={e._id}
                    onClick={() => setSelected(e)}
                    className={`cursor-pointer border-b border-gray-50 hover:bg-gray-50 ${
                      selected?._id === e._id ? "bg-emerald-50" : ""
                    }`}
                  >
                    <td className="px-6 py-3">
                      {formatDateTime(e.createdAt)}
                    </td>
                    <td className="py-3">{e.vehicleNumber}</td>
                    <td className="py-3">{e.visitorName}</td>
                    <td className="py-3">{e.visitorCompany}</td>
                    <td className="py-3">{e.bayName}</td>
                    <td className="py-3 capitalize">
                      {e.vehicleType}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ================= MOBILE CARDS ================= */}
        <div className="lg:hidden col-span-12 space-y-4">
          {filteredEntries.map((e) => (
            <div
              key={e._id}
              onClick={() => setSelected(e)}
              className={`bg-white rounded-xl shadow-sm p-4 ${
                selected?._id === e._id ? "ring-2 ring-emerald-200" : ""
              }`}
            >
              <p className="font-semibold text-gray-900">
                {e.visitorName}
              </p>
              <p className="text-sm text-gray-500">
                {e.visitorCompany}
              </p>

              <div className="mt-3 grid grid-cols-2 gap-y-2 text-sm">
                <span className="text-gray-500">Vehicle</span>
                <span>{e.vehicleNumber}</span>

                <span className="text-gray-500">Bay</span>
                <span>{e.bayName}</span>

                <span className="text-gray-500">Method</span>
                <span className="capitalize">{e.vehicleType}</span>

                <span className="text-gray-500">Time</span>
                <span>{formatDateTime(e.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ================= RIGHT PANEL ================= */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          {selected && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                Selected Entry
              </h3>

              <p className="text-lg font-semibold mb-4">
                {selected.visitorName}
              </p>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <Info label="Mobile" value={selected.visitorMobile} />
                <Info label="QID" value={selected.qidNumber || "—"} />
                <Info label="Vehicle" value={selected.vehicleNumber} />
                <Info label="Bay" value={selected.bayName} />
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              My Statistics
            </h3>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <Stat label="Total entries" value={entries.length} />
              <Stat
                label="Manual share"
                value={`${Math.round(
                  (entries.filter((e) => e.method === "Manual").length /
                    Math.max(entries.length, 1)) *
                    100
                )}%`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- SMALL UI COMPONENTS ---------- */

function Info({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-medium text-gray-900">{value}</p>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-lg font-semibold text-gray-900">
        {value}
      </p>
    </div>
  );
}
