"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function BayManagement() {
  const [bays, setBays] = useState([]);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      const [bayRes, entryRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/bays`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/entries`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setBays(bayRes.data.bays || []);
      setEntries(entryRes.data.entries || []);
    } catch (err) {
      console.error("Failed to load bay data", err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= OCCUPIED COUNT LOGIC (UNCHANGED) ================= */
  const getOccupiedCount = (bayId) => {
    return entries.filter((entry) => {
      if (entry.outTime !== null) return false;
      if (!entry.bayId) return false;

      const entryBayId =
        typeof entry.bayId === "object"
          ? entry.bayId._id
          : entry.bayId;

      return String(entryBayId) === String(bayId);
    }).length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Loading bay data...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex-1 overflow-x-hidden">

        {/* ================= WHITE NAVBAR (ADDED) ================= */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4 sticky top-0 z-40">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-[18px] sm:text-[22px] font-semibold text-gray-800">
                Bay Management
              </h1>
              <p className="text-[13px] sm:text-[14px] text-gray-500 mt-1">
                Real-time bay availability and occupancy status
              </p>
            </div>
          </div>
        </div>

        {/* ================= PAGE CONTENT ================= */}
        <div className="px-4 sm:px-6 lg:px-8 py-6">

          {/* ================= BAY GRID ================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {bays.map((bay) => {
              const occupied = getOccupiedCount(bay._id);

              return (
                <div
                  key={bay._id}
                  className="
                    bg-white rounded-2xl border border-gray-200
                    p-4 sm:p-5
                    shadow-sm hover:shadow-md
                    transition-shadow
                  "
                >
                  {/* BAY TITLE */}
                  <div className="mb-3">
                    <h2 className="text-[15px] sm:text-lg font-semibold text-gray-800">
                      Bay {bay.bayName}
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500">
                      Operational {bay.bayType} bay
                    </p>
                  </div>

                  {/* STATUS TAGS */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-700 font-medium">
                      Free: --
                    </span>
                    <span className="px-3 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700 font-medium">
                      Occupied: {occupied}
                    </span>
                  </div>

                  {/* PROGRESS BAR */}
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-2 bg-emerald-600 rounded-full transition-all duration-300"
                      style={{
                        width: occupied > 0 ? "60%" : "0%",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
}
