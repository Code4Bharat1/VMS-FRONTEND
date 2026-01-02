//Admin bay
"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function BayManagement() {
  const [bays, setBays] = useState([]);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  /* -------- Add Bay Modal State -------- */
  const [showAddBay, setShowAddBay] = useState(false);
  const [bayName, setBayName] = useState("");
  const [bayType, setBayType] = useState("");
  const [saving, setSaving] = useState(false);

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

  /* ================= ADD BAY ================= */
  const addBay = async () => {
    if (!bayName || !bayType) return;

    try {
      setSaving(true);
      const token = localStorage.getItem("accessToken");

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/bays`,
        { bayName, bayType },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setShowAddBay(false);
      setBayName("");
      setBayType("");

      fetchData(); // refresh list
    } catch (err) {
      console.error("Failed to add bay", err);
    } finally {
      setSaving(false);
    }
  };

  /* ================= OCCUPIED COUNT ================= */
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

        {/* ================= NAVBAR ================= */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4 sticky top-0 z-40">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[18px] sm:text-[22px] font-semibold text-gray-800">
                Bay Management
              </h1>
              <p className="text-[13px] sm:text-[14px] text-gray-500 mt-1">
                Real-time bay availability and occupancy status
              </p>
            </div>

            <button
              onClick={() => setShowAddBay(true)}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium cursor-pointer"
            >
              + Add Bay
            </button>
          </div>
        </div>

        {/* ================= PAGE CONTENT ================= */}
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {bays.map((bay) => {
              const occupied = getOccupiedCount(bay._id);

              return (
                <div
                  key={bay._id}
                  className="bg-white rounded-md border border-gray-200 p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="mb-3">
                    <h2 className="text-[15px] sm:text-lg font-semibold text-gray-800">
                      Bay {bay.bayName}
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500">
                      {bay.bayType} bay
                    </p>
                  </div>

                  <div className="flex gap-2 mb-4">
                    <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-700 font-medium">
                      Free: --
                    </span>
                    <span className="px-3 py-1 text-xs rounded-full bg-[#EECD59] text-gray-700 font-medium">
                      Occupied: {occupied}
                    </span>
                  </div>

                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-2 bg-emerald-700 rounded-full transition-all"
                      style={{ width: occupied > 0 ? "60%" : "0%" }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ================= ADD BAY MODAL ================= */}
      {showAddBay && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Add New Bay
            </h2>

            <div className="space-y-4 text-sm">
              <input
                type="text"
                placeholder="Bay Name (e.g. A, B, C)"
                value={bayName}
                onChange={(e) => setBayName(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />

              <input
                type="text"
                placeholder="Bay Type (e.g. Loading, Parking)"
                value={bayType}
                onChange={(e) => setBayType(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddBay(false)}
                className="px-4 py-2 text-sm rounded-lg border"
              >
                Cancel
              </button>
              <button
                onClick={addBay}
                disabled={saving}
                className="px-4 py-2 text-sm rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {saving ? "Saving..." : "Add Bay"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
