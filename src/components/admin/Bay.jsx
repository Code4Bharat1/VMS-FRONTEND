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

  /* -------- Delete State -------- */
  const [deletingId, setDeletingId] = useState(null);

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
      fetchData();
    } catch (err) {
      console.error("Failed to add bay", err);
    } finally {
      setSaving(false);
    }
  };

  /* ================= DELETE BAY ================= */
  const deleteBay = async (id) => {
    if (!window.confirm("Are you sure you want to delete this bay?")) return;

    try {
      setDeletingId(id);
      const token = localStorage.getItem("accessToken");

      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/bays/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchData();
    } catch (err) {
      console.error("Failed to delete bay", err);
    } finally {
      setDeletingId(null);
    }
  };

  /* ================= ANALYTICS HELPERS ================= */
  const BAY_CAPACITY = 3;

  const getBayStats = (bayId) => {
    const active = entries.filter(
      (e) =>
        e.outTime === null &&
        e.bayId &&
        String(typeof e.bayId === "object" ? e.bayId._id : e.bayId) ===
          String(bayId)
    );

    const occupied = active.length;
    const free = Math.max(BAY_CAPACITY - occupied, 0);
    const utilisation = Math.round((occupied / BAY_CAPACITY) * 100);

    return { occupied, free, utilisation };
  };

  const activeVehicles = entries.filter((e) => e.bayId && e.outTime === null);

  const alerts = activeVehicles
    .map((e) => {
      const mins = (Date.now() - new Date(e.inTime)) / 60000;
      if (mins > 60) {
        return {
          id: e._id,
          message: `Vehicle ${e.vehicleNumber} overstayed`,
          dueIn: `${Math.floor(mins)} mins`,
        };
      }
      return null;
    })
    .filter(Boolean);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Loading bay data...
      </div>
    );
  }
  const getSupervisorFromBay = (entry) => {
    if (!entry || !entry.bayId) return "—";

    const bayId =
      typeof entry.bayId === "object" ? entry.bayId._id : entry.bayId;

    const bay = bays.find((b) => String(b._id) === String(bayId));
    if (!bay) return "—";

    return (
      bay.supervisorName ||
      bay.supervisor ||
      bay.supervisor?.name ||
      bay.supervisorId?.name ||
      "—"
    );
  };

  return (
    <div className="min-h-screen bg-emerald-50/60">
      {/* ================= NAVBAR ================= */}
      <div className="bg-white  px-6 py-4 sticky top-0 z-40">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl text-emerald-800 font-semibold">Bay Management</h1>
            <p className="text-sm text-gray-500">
              Monitor live bay occupancy, timelines and vehicle linkages
            </p>
          </div>

          <button
            onClick={() => setShowAddBay(true)}
            className="px-4 py-2 rounded-lg bg-green-700 text-white text-sm"
          >
            + Add Bay
          </button>
        </div>
      </div>

      {/* ================= PAGE CONTENT ================= */}
      <div className="px-6 py-6 space-y-6">
        {/* ===== TOP: BAY SUMMARY ===== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {bays.map((bay) => {
            const { occupied, free, utilisation } = getBayStats(bay._id);

            return (
              <div key={bay._id} className="bg-white rounded-xl  p-4">
                <div className="flex justify-between mb-2">
                  <h3 className="font-semibold">Bay {bay.bayName}</h3>
                  <span className="text-xs bg-emerald-100 px-2 py-1 rounded-full">
                    Live occupancy
                  </span>
                </div>

                <p className="text-xs text-gray-500 mb-2">{bay.bayType} bay</p>

                <div className="flex gap-2 text-xs mb-3">
                  <span className="bg-green-100 px-2 py-1 rounded">
                    Free: {free}
                  </span>
                  <span className="bg-yellow-100 px-2 py-1 rounded">
                    Occupied: {occupied}
                  </span>
                </div>

                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-2 bg-emerald-700"
                    style={{ width: `${utilisation}%` }}
                  />
                </div>

                <p className="text-xs text-gray-400 mt-2">
                  {utilisation}% utilisation
                </p>
              </div>
            );
          })}
        </div>

        {/* ===== MIDDLE: TIMELINE + LINKAGE ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Timeline */}
          <div className="bg-white rounded-xl  p-5">
            <h3 className="font-semibold mb-2">Bay activity timeline</h3>
            <p className="text-xs text-gray-500 mb-4">
              Visual view of free vs occupied periods across bays
            </p>

            {[8, 10, 12, 14].map((t) => (
              <div key={t} className="mb-3">
                <p className="text-xs text-gray-400 mb-1">{t}:00</p>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-3 bg-green-600 w-2/3" />
                </div>
              </div>
            ))}

            <div className="flex justify-between text-xs text-gray-400 mt-4">
              <span>Current time: 11:42</span>
              <span>Shift window: 08:00–16:00</span>
            </div>
          </div>

          {/* Vehicle linkage */}
          <div className="bg-white rounded-xl  p-5">
            <h3 className="font-semibold mb-2">Vehicle linkage details</h3>
            <p className="text-xs text-gray-500 mb-4">
              Current vehicles linked to bays
            </p>

            <div className="space-y-3 text-sm">
              {activeVehicles.map((e) => (
                <div
                  key={e._id}
                  className="flex justify-between items-center bg-emerald-50 p-3 rounded-lg"
                >
                  <div>
                    <p className="font-medium">
                      {e.vehicleNumber} · Bay{" "}
                      {typeof e.bayId === "object" ? e.bayId.bayName : ""}
                    </p>
                    <p className="text-xs text-gray-500">
                      Arrived {new Date(e.inTime).toLocaleTimeString()}
                    </p>

                    <p className="text-xs text-gray-500">
                      Supervisor:{" "}
                      <span className="font-medium">
                        {getSupervisorFromBay(e)}
                      </span>
                    </p>
                  </div>

                  <span className="text-xs bg-green-600 text-white px-3 py-1 rounded-full">
                    Linked
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ===== BOTTOM: ALERTS + OVERRIDE ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Alerts */}
          <div className="bg-white rounded-xl  p-5">
            <h3 className="font-semibold mb-4">Alerts & exceptions</h3>

            <div className="space-y-3">
              {alerts.length === 0 && (
                <p className="text-sm text-gray-500">No alerts</p>
              )}

              {alerts.map((a) => (
                <div
                  key={a.id}
                  className="flex justify-between items-center bg-emerald-50 p-3 rounded-lg"
                >
                  <span className="text-xs bg-orange-500 text-white px-2 py-1 rounded">
                    Bay
                  </span>
                  <p className="text-sm flex-1 mx-3">{a.message}</p>
                  <span className="text-xs text-gray-500">{a.dueIn}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Manual override */}
          <div className="bg-white rounded-xl p-5">
            <h3 className="font-semibold mb-2">Manual override</h3>
            <p className="text-xs text-gray-500 mb-4">
              Use only for exceptions. Actions are logged.
            </p>

            <div className="space-y-3">
              <select className="w-full border rounded-lg px-3 py-2 text-sm">
                <option>Select bay</option>
              </select>

              <input
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="Vehicle / VRN"
              />

              <select className="w-full border rounded-lg px-3 py-2 text-sm">
                <option>Force mark as free</option>
              </select>

              <textarea
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="Reason for override"
              />
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button className="px-4 py-2  rounded-lg text-sm">
                Preview impact
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm">
                Apply override
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ================= ADD BAY MODAL ================= */}
      {showAddBay && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-sm rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Add New Bay</h2>

            <div className="space-y-4">
              <input
                value={bayName}
                onChange={(e) => setBayName(e.target.value)}
                className="w-full  rounded-lg px-3 py-2"
                placeholder="Bay Name"
              />
              <input
                value={bayType}
                onChange={(e) => setBayType(e.target.value)}
                className="w-full  rounded-lg px-3 py-2"
                placeholder="Bay Type"
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddBay(false)}
                className="px-4 py-2  rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={addBay}
                disabled={saving}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg"
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
