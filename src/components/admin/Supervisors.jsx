"use client";

import { useState } from "react";
import { Search, Plus, Filter } from "lucide-react";
import Sidebar from "@/components/admin/Sidebar";

/* ---------------- MOCK DATA ---------------- */
const supervisorsData = [
  {
    id: 1,
    name: "Mohammed Rahman",
    staffCount: 12,
    mobile: "+974 5551 2201",
    email: "m.rahman@vmssmall.qa",
    status: "Active",
    shift: "Night shift · Bay A & Bay B",
    stats: {
      staff: 12,
      checks: 34,
      incidents: 1,
    },
    staff: [
      { name: "Imran Ali", role: "Security Guard", bay: "Bay A", status: "Active" },
      { name: "Anu Mathew", role: "Security Guard", bay: "Bay B", status: "Active" },
      { name: "Khalid Hassan", role: "Senior Guard", bay: "Shared bays", status: "On duty" },
      { name: "Sarah Lee", role: "Relief Guard", bay: "-", status: "Off shift" },
    ],
    performance: {
      onTime: "96%",
      patrols: 118,
      compliance: "99%",
    },
    activities: [
      { time: "09:45", text: "Reviewed delivery queue at Bay A" },
      { time: "09:18", text: "Approved manual entry for vendor vehicle" },
      { time: "08:52", text: "Reassigned staff from Bay B to Bay C" },
      { time: "08:30", text: "Noted minor delay at Bay B (logged)" },
    ],
  },
  {
    id: 2,
    name: "Sarah Johnson",
    staffCount: 9,
    mobile: "+974 5523 8890",
    email: "s.johnson@vmssmall.qa",
    status: "Active",
    shift: "Night shift · Bay A & Bay B",
    stats: {
      staff: 12,
      checks: 34,
      incidents: 1,
    },
    staff: [
      { name: "Imran Ali", role: "Security Guard", bay: "Bay A", status: "Active" },
      { name: "Anu Mathew", role: "Security Guard", bay: "Bay B", status: "Active" },
      { name: "Khalid Hassan", role: "Senior Guard", bay: "Shared bays", status: "On duty" },
      { name: "Sarah Lee", role: "Relief Guard", bay: "-", status: "Off shift" },
    ],
    performance: {
      onTime: "96%",
      patrols: 118,
      compliance: "99%",
    },
    activities: [
      { time: "09:45", text: "Reviewed delivery queue at Bay A" },
      { time: "09:18", text: "Approved manual entry for vendor vehicle" },
      { time: "08:52", text: "Reassigned staff from Bay B to Bay C" },
      { time: "08:30", text: "Noted minor delay at Bay B (logged)" },
    ],
  },
  {
    id: 3,
    name: "Ahmed Ali",
    staffCount: 7,
    mobile: "+974 5577 4411",
    email: "ahmed.ali@vmssmall.qa",
    status: "Active",
  },
  {
    id: 4,
    name: "Lamia Hassan",
    staffCount: 5,
    mobile: "+974 5590 1275",
    email: "lamia.hassan@vmssmall.qa",
    status: "Inactive",
  },
  {
    id: 5,
    name: "Ravi Kumar",
    staffCount: 10,
    mobile: "+974 5519 9980",
    email: "ravi.kumar@vmssmall.qa",
    status: "Active",
  },
];

/* ---------------- PAGE ---------------- */
export default function supervisors() {
  const [supervisors, setSupervisors] = useState(supervisorsData);
  const [selected, setSelected] = useState(supervisorsData[0]);
  const [search, setSearch] = useState("");

  const filtered = supervisors.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleStatus = (id) => {
    setSupervisors((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, status: s.status === "Active" ? "Inactive" : "Active" }
          : s
      )
    );
  };

  return (
    <div className="min-h-screen flex bg-[#f6f8fb] text-[14px] text-gray-700">
   

      <main className="flex-1 p-4 sm:p-6 space-y-6">
        {/* HEADER */}
        <div className="flex justify-between mb-5">
          <div>
            <h1 className="text-2xl font-semibold">Supervisor Management</h1>
            <p className="text-gray-500">
              Manage security supervisors, their assigned staff, performance and recent bay activities.
            </p>
          </div>

          <div className="flex gap-2">
            <button className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-md">
              <Filter size={14} /> Status: All
            </button>
            <button className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-md">
              <Plus size={14} /> Add Supervisor
            </button>
          </div>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-3 gap-6">

          {/* TABLE */}
          <div className="col-span-2 bg-white border rounded-xl p-4">
            <div className="flex items-center gap-2 border rounded-md px-3 py-2 mb-3">
              <Search size={14} className="text-gray-400" />
              <input
                className="outline-none w-full"
                placeholder="Search supervisors by name, mobile or email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <table className="w-full">
              <thead>
                <tr className="border-b text-gray-500">
                  <th className="py-2 text-left">Supervisor Name</th>
                  <th className="text-left">Staff Assigned</th>
                  <th className="text-left">Mobile Number</th>
                  <th className="text-left">Email</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((s) => (
                  <tr
                    key={s.id}
                    onClick={() => setSelected(s)}
                    className="border-b hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="py-2 font-medium">{s.name}</td>
                    <td>{s.staffCount}</td>
                    <td>{s.mobile}</td>
                    <td>{s.email}</td>
                    <td>
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStatus(s.id);
                        }}
                        className={`px-2 py-0.5 rounded-full text-xs ${
                          s.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <p className="text-xs text-gray-400 mt-2">
              Showing 1–5 of 18 supervisors
            </p>
          </div>

          {/* RIGHT PANEL */}
          {selected && (
            <div className="space-y-4">

              {/* DETAILS */}
              <div className="bg-white border rounded-xl p-4">
                <div className="flex justify-between mb-2">
                  <h3 className="font-semibold">Supervisor details</h3>
                  <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs">
                    Active
                  </span>
                </div>

                <p className="font-semibold">{selected.name}</p>
                <p className="text-xs text-gray-500">{selected.shift}</p>

                <div className="grid grid-cols-3 gap-2 mt-4">
                  <Metric title="Staff assigned" value={selected.stats?.staff} />
                  <Metric title="Checks completed (today)" value={selected.stats?.checks} />
                  <Metric title="Incidents in last 7 days" value={selected.stats?.incidents} />
                </div>
              </div>

              {/* STAFF */}
              <div className="bg-white border rounded-xl p-4">
                <h3 className="font-semibold mb-2">Assigned security staff</h3>
                {selected.staff?.map((m, i) => (
                  <div key={i} className="bg-green-50 rounded-md p-2 mb-2 flex justify-between">
                    <div>
                      <p className="font-medium">{m.name}</p>
                      <p className="text-xs text-gray-500">{m.role} · {m.bay}</p>
                    </div>
                    <span className="text-xs text-gray-600">{m.status}</span>
                  </div>
                ))}
              </div>

              {/* PERFORMANCE */}
              <div className="bg-white border rounded-xl p-4">
                <h3 className="font-semibold mb-2">Performance metrics</h3>
                <div className="grid grid-cols-3 gap-2">
                  <Metric title="On-time shift starts" value={selected.performance?.onTime} />
                  <Metric title="Patrol rounds completed" value={selected.performance?.patrols} />
                  <Metric title="Bay compliance rate" value={selected.performance?.compliance} />
                </div>
              </div>

              {/* ACTIVITIES */}
              <div className="bg-white border rounded-xl p-4">
                <h3 className="font-semibold mb-2">Recent activities</h3>
                {selected.activities?.map((a, i) => (
                  <div key={i} className="flex justify-between text-sm mb-2">
                    <p>{a.text}</p>
                    <span className="text-gray-400">{a.time}</span>
                  </div>
                ))}
              </div>

            </div>
          )}
        </div>
      </main>
    </div>
  );
}

/* ---------------- METRIC ---------------- */
function Metric({ title, value }) {
  return (
    <div className="bg-green-50 rounded-md p-2">
      <p className="text-xs text-gray-400">{title}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}
