"use client";

import { useEffect, useState } from "react";
import {
  Search,
} from "lucide-react";
import axios from "axios";

/* ---------------- PAGE ---------------- */

export default function BayManagement() {
  const [bays, setBays] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBays();
  }, []);

  const fetchBays = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/bays`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setBays(res.data.bays || []);
    } catch (err) {
      console.error("Failed to fetch bays", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#f6f8fb] text-[14px] text-gray-700">

      {/* MAIN */}
      <div className="flex-1 overflow-auto">

        {/* TOP BAR */}
        <div className="bg-white border-b border-gray-200 px-8 py-5 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Bay Management
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Monitor live bay occupancy, timelines and vehicle linkages.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-800">
                Control Supervisor
              </p>
              <p className="text-xs text-gray-500">Bay Management</p>
            </div>
            <img
              src="https://i.pravatar.cc/40"
              className="w-9 h-9 rounded-full"
              alt=""
            />
          </div>
        </div>

        {/* CONTENT */}
        <div className="px-8 py-6 space-y-6">

          {/* LOADING */}
          {loading && (
            <div className="text-center py-20 text-gray-500">
              Loading bay data...
            </div>
          )}

          {/* BAY CARDS */}
          {!loading && (
            <div className="grid grid-cols-3 gap-6">
              {bays.map((bay) => (
                <BayCard
                  key={bay._id}
                  title={`Bay ${bay.bayName}`}
                  desc={`Operational ${bay.bayType} bay`}
                  free="--"
                  occupied="--"
                  util="--%"
                  next="--"
                  cleared="--"
                  status={bay.status}
                />
              ))}
            </div>
          )}

          {/* MIDDLE GRID */}
          <div className="grid grid-cols-3 gap-6">

            {/* TIMELINE */}
            <div className="col-span-2 bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-bold text-gray-800 mb-2">
                Bay activity timeline
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Visual view of free vs occupied periods.
              </p>

              <TimelineRow time="08:00" green="70%" yellow="30%" />
              <TimelineRow time="10:00" green="60%" yellow="40%" />
              <TimelineRow time="12:00" green="85%" yellow="15%" />
              <TimelineRow time="14:00" green="45%" yellow="55%" />

              <div className="flex justify-between mt-4 text-xs text-gray-400">
                <span>Current time: --</span>
                <span>Shift window: 08:00 – 16:00</span>
              </div>
            </div>

            {/* VEHICLE LINKAGE */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-bold text-gray-800 mb-4">
                Vehicle linkage details
              </h3>

              <VehicleRow
                vrn="--"
                info="Vehicle linkage coming soon"
                status="Pending"
              />
            </div>
          </div>

          {/* BOTTOM GRID */}
          <div className="grid grid-cols-3 gap-6">

            {/* ALERTS */}
            <div className="col-span-2 bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-bold text-gray-800 mb-4">
                Alerts & exceptions
              </h3>

              <Alert
                bay="System"
                text="No active alerts"
                note="Live"
              />
            </div>

            {/* MANUAL OVERRIDE */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-bold text-gray-800 mb-4">
                Manual override
              </h3>

              <label className="block text-xs text-gray-500 mb-1">
                Select bay
              </label>
              <select className="w-full border rounded-md px-3 py-2 mb-3 text-sm">
                {bays.map((bay) => (
                  <option key={bay._id} value={bay._id}>
                    Bay {bay.bayName}
                  </option>
                ))}
              </select>

              <label className="block text-xs text-gray-500 mb-1">
                Vehicle / VRN
              </label>
              <div className="relative mb-3">
                <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
                <input
                  className="w-full pl-9 pr-3 py-2 border rounded-md text-sm"
                  placeholder="Search or scan VRN"
                />
              </div>

              <label className="block text-xs text-gray-500 mb-1">
                Override action
              </label>
              <select className="w-full border rounded-md px-3 py-2 mb-3 text-sm">
                <option>Force mark as free</option>
              </select>

              <label className="block text-xs text-gray-500 mb-1">
                Reason for override
              </label>
              <textarea
                rows="3"
                className="w-full border rounded-md px-3 py-2 text-sm mb-4"
                placeholder="Short note"
              />

              <div className="flex gap-2">
                <button className="flex-1 border border-emerald-600 text-emerald-700 rounded-lg py-2 text-sm font-medium">
                  Preview impact
                </button>
                <button className="flex-1 bg-emerald-600 text-white rounded-lg py-2 text-sm font-medium">
                  Apply override
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

/* ---------------- COMPONENTS ---------------- */

function BayCard({ title, desc, free, occupied, util }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="font-bold text-gray-800 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 mb-3">{desc}</p>

      <div className="flex gap-2 mb-3">
        <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs">
          Free: {free}
        </span>
        <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs">
          Occupied: {occupied}
        </span>
        <span className="ml-auto text-sm font-semibold">
          {util}
        </span>
      </div>

      <div className="h-2 bg-gray-200 rounded-full">
        <div className="h-2 bg-emerald-600 rounded-full w-1/3" />
      </div>
    </div>
  );
}

function TimelineRow({ time, green, yellow }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <span className="text-xs w-12 text-gray-500">{time}</span>
      <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-3 bg-emerald-600 inline-block" style={{ width: green }} />
        <div className="h-3 bg-yellow-400 inline-block" style={{ width: yellow }} />
      </div>
    </div>
  );
}

function VehicleRow({ vrn, info, status }) {
  return (
    <div className="flex justify-between items-center mb-3">
      <div>
        <p className="font-semibold text-sm">{vrn}</p>
        <p className="text-xs text-gray-500">{info}</p>
      </div>
      <span className="px-2 py-0.5 rounded-full text-xs bg-yellow-100 text-yellow-700">
        {status}
      </span>
    </div>
  );
}

function Alert({ bay, text, note }) {
  return (
    <div className="flex items-center justify-between bg-emerald-50 rounded-lg p-3 mb-3">
      <div className="flex gap-3">
        <span className="bg-yellow-400 text-white text-xs px-2 py-0.5 rounded">
          {bay}
        </span>
        <p className="text-sm">{text}</p>
      </div>
      <span className="text-xs text-gray-500">{note}</span>
    </div>
  );
}
