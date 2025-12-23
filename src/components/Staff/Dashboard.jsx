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
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[24px] font-semibold text-gray-900">
              Security Staff Panel
            </h1>
            <p className="text-[14px] text-gray-500 mt-1">
              Lowest access view for on-site guards. One-way entry capture only.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white font-semibold">
              {(staff?.name || "")
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </div>
            <div>
              <p className="text-[18px] font-semibold text-gray-900">
                {staff?.name}
              </p>
              <p className="text-[14px] text-gray-500 capitalize">
                {staff?.role}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="px-8 py-6">
        {/* STAT CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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

        {/* TABLE */}
        <div className="bg-white rounded-xl">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-[18px] font-semibold text-gray-900">
              Recent Entries
            </h2>
            <p className="text-[14px] text-gray-500 mt-1">
              Entries captured during your shift
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-green-100">
                <tr className="text-[14px] text-gray-600">
                  <th className="px-6 py-4 text-left font-medium">
                    Visitor Name
                  </th>
                  <th className="py-4 text-left font-medium">
                    Vehicle Number
                  </th>
                  <th className="py-4 text-left font-medium">
                    Company
                  </th>
                  <th className="py-4 text-left font-medium">
                    Bay
                  </th>
                  <th className="py-4 text-left font-medium">
                    Method
                  </th>
                  <th className="py-4 text-left font-medium">
                    Time In
                  </th>
                </tr>
              </thead>

              <tbody>
                {entries.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center py-6 text-[14px] text-gray-400"
                    >
                      No entries found
                    </td>
                  </tr>
                ) : (
                  entries.map((e) => (
                    <tr
                      key={e._id}
                      className="
                        border-b border-gray-100
                        text-[14px] text-gray-800
                        cursor-pointer
                        transition-colors duration-150
                        hover:bg-gray-50
                      "
                    >
                      <td className="px-6 py-4">
                        {e.visitorName}
                      </td>
                      <td className="py-4">
                        {e.vehicleNumber}
                      </td>
                      <td className="py-4">
                        {e.visitorCompany}
                      </td>
                      <td className="py-4">
                        {getBayName(e.bayId)}
                      </td>
                      <td className="py-4 capitalize">
                        {e.entryMethod}
                      </td>
                      <td className="py-4">
                        {new Date(e.inTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
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
  );
}

/* ---------------- STAT CARD ---------------- */

function Stat({ title, value, subtitle }) {
  return (
    <div
      className="
        bg-white rounded-xl px-6 py-6
        transition-all duration-200
        hover:bg-gray-50
        hover:-translate-y-[1px]
      "
    >
      <p className="text-[14px] text-gray-500 mb-2">
        {title}
      </p>
      <p className="text-[32px] font-semibold text-gray-900">
        {value}
      </p>
      <p className="text-[14px] text-gray-500 mt-1">
        {subtitle}
      </p>
    </div>
  );
}
