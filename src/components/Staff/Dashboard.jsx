"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function StaffDashboardPage() {
  const [entries, setEntries] = useState([]);
  const [bays, setBays] = useState([]);
  const [staff, setStaff] = useState(null);

  /* ---------------- FETCH DATA (UNCHANGED) ---------------- */
  useEffect(() => {
    fetchData();

    const storedUser = localStorage.getItem("user");
    if (storedUser) setStaff(JSON.parse(storedUser));
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");

      const [entriesRes, baysRes] = await Promise.all([
        axios.get("http://localhost:5000/api/v1/entries", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5000/api/v1/bays", {
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
    return bay ? bay.bayName : "--";
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-[#f6f8fa]">
      {/* NAVBAR */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-[18px] sm:text-[22px] font-semibold text-gray-900">
              Security Staff Panel
            </h1>
            <p className="text-[13px] sm:text-[14px] text-gray-500 mt-1">
              Lowest access view for on-site guards. One-way entry capture only.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white font-semibold">
              {(staff?.name || "")
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </div>
            <div className="leading-tight">
              <p className="text-[14px] sm:text-[16px] font-semibold text-gray-900">
                {staff?.name}
              </p>
              <p className="text-[12px] sm:text-[14px] text-gray-500 capitalize">
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
              .map((b) => b.bayName)
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
        <div className="hidden sm:block bg-white rounded-xl shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-[18px] font-semibold text-gray-900">
              Recent Entries
            </h2>
            <p className="text-[14px] text-gray-500 mt-1">
              Entries captured during your shift
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[720px] w-full">
              <thead className="border-b border-gray-200 bg-emerald-50">
                <tr className="text-[14px] text-gray-600">
                  {[
                    "Visitor Name",
                    "Vehicle Number",
                    "Company",
                    "Bay",
                    "Method",
                    "Time In",
                  ].map((h) => (
                    <th key={h} className="px-6 py-4 text-left font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {entries.map((e) => (
                  <tr
                    key={e._id}
                    className="border-b border-gray-100 text-[14px] hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">{e.visitorName}</td>
                    <td className="px-6 py-4">{e.vehicleNumber}</td>
                    <td className="px-6 py-4">{e.visitorCompany}</td>
                    <td className="px-6 py-4">{getBayName(e.bayId)}</td>
                    <td className="px-6 py-4 capitalize">{e.entryMethod}</td>
                    <td className="px-6 py-4">
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
        </div>

        {/* MOBILE CARDS */}
        <div className="sm:hidden space-y-4">
          {entries.map((e) => (
            <div
              key={e._id}
              className="bg-white rounded-xl p-4 shadow-sm"
            >
              <p className="font-semibold text-gray-900">
                {e.visitorName}
              </p>
              <p className="text-sm text-gray-500">{e.visitorCompany}</p>

              <div className="mt-3 grid grid-cols-2 gap-y-2 text-sm">
                <span className="text-gray-500">Vehicle</span>
                <span>{e.vehicleNumber}</span>

                <span className="text-gray-500">Bay</span>
                <span>{getBayName(e.bayId)}</span>

                <span className="text-gray-500">Method</span>
                <span className="capitalize">{e.entryMethod}</span>

                <span className="text-gray-500">Time In</span>
                <span>
                  {new Date(e.inTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* STAT CARD */
function Stat({ title, value, subtitle }) {
  return (
    <div className="bg-white rounded-xl px-6 py-6 shadow-sm hover:bg-gray-50 transition">
      <p className="text-[14px] text-gray-500 mb-2">{title}</p>
      <p className="text-[32px] font-semibold text-gray-900">{value}</p>
      <p className="text-[14px] text-gray-500 mt-1">{subtitle}</p>
    </div>
  );
}
