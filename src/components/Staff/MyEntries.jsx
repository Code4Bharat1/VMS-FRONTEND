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

  // ✅ ONLY ADDITION
  const [showMobilePopup, setShowMobilePopup] = useState(false);

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
    // 🔒 Only entries of staff's assigned bay
    if (staff?.assignedBay?.bayName) {
      if (e.bayId?.bayName !== staff.assignedBay.bayName) return false;
    }

    // (optional) dropdown filter if you use it later
    if (bay !== "All bays" && e.bayId?.bayName !== bay) return false;

    return true;
  });

  return (
    <div className="min-h-screen bg-teal-50">
      {/* HEADER */}
      <div className="bg-white px-4 sm:px-8 py-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">My Entries</h1>
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
              <p className="text-sm text-gray-500 capitalize">{staff?.role}</p>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="px-4 sm:px-8 py-6 grid grid-cols-12 gap-6">
        {/* DESKTOP TABLE */}
        <div className="hidden w-full lg:block col-span-12 bg-white rounded-xl shadow-sm">

          <div className="px-6 py-4 border-b border-gray-100 flex justify-between">
            <h3 className="font-semibold text-gray-900">
              Entries captured by you
            </h3>
          </div>

          {loading ? (
            <p className="p-6 text-sm text-gray-500">Loading entries…</p>
          ) : (
            <table className="w-full text-sm ">
              <thead className="text-black text-[16px] border-b border-gray-100 bg-green-100">
                <tr>
                  <th className="px-3  text-center">Time</th>
                  <th className="px-3 text-center">QID</th>
                  <th className="py-3 text-center">Vehicle No</th>
                  <th className="py-3 text-center">Visitor</th>
                  <th className="py-3 text-center">Company</th>
                  <th className="py-3 text-center">Bay</th>
                  <th className="py-3 text-center">Vehicle</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.map((e) => (
                  <tr
                    key={e._id}
                    onClick={() => setSelected(e)}
                    className=" cursor-pointer border-b-2 text-[16px] border-gray-200 hover:bg-gray-50 text-center"
                  >
                    <td className="px-3">{formatDateTime(e.createdAt)}</td>
                    <td className="py-3">{e.qidNumber}</td>
                    <td className="py-3">{e.vehicleNumber}</td>
                    <td className="py-3">{e.visitorName}</td>
                    <td className="py-3">{e.visitorCompany}</td>
                    <td className="py-3">{e.bayId?.bayName || "—"}</td>
                    <td className="py-3">{e.vehicleType}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* MOBILE CARDS */}
        <div className="lg:hidden col-span-12 space-y-4">
          {filteredEntries.map((e) => (
            <div
              key={e._id}
              onClick={() => {
                setSelected(e);
                setShowMobilePopup(true);
              }}
              className="bg-white rounded-xl shadow-sm p-4"
            >
              <p className="font-semibold text-gray-900">{e.visitorName}</p>
              <p className="text-sm text-gray-500">{e.visitorCompany}</p>

              <div className="mt-3 grid grid-cols-2 gap-y-2 text-sm">
                <span className="text-gray-500">Vehicle No</span>
                <span>{e.vehicleNumber}</span>

                <span className="text-gray-500">Bay</span>
                <span>{e.bayId?.bayName || "—"}</span>

                <span className="text-gray-500">Vehicle</span>
                <span className="capitalize">{e.vehicleType}</span>

                <span className="text-gray-500">Time</span>
                <span>{formatDateTime(e.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT PANEL (DESKTOP ONLY)
        <div className="hidden lg:block col-span-4 space-y-4">
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
                <Info label="Bay" value={selected.bayId?.bayName || "—"} />
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
        </div> */}
      </div>

      {/* ✅ MOBILE POPUP — SAME JSX, JUST OVERLAY */}
      {showMobilePopup && selected && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center lg:hidden"
          onClick={() => setShowMobilePopup(false)}
        >
          <div
            className="bg-white rounded-xl shadow-sm p-6 w-[92%] max-w-sm transition-all duration-300 scale-100 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* CLOSE BUTTON */}
            <button
              onClick={() => setShowMobilePopup(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-lg"
            >
              ✕
            </button>

            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              Selected Entry
            </h3>

            <p className="text-lg font-semibold mb-4">{selected.visitorName}</p>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <Info label="Mobile" value={selected.visitorMobile} />
              <Info label="QID" value={selected.qidNumber || "—"} />
              <Info label="Vehicle" value={selected.vehicleNumber} />
              <Info label="Bay" value={selected.bayName} />
            </div>
          </div>
        </div>
      )}
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
      <p className="text-lg font-semibold text-gray-900">{value}</p>
    </div>
  );
}
