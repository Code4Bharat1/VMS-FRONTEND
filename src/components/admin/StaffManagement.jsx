"use client";

import { useState } from "react";
import { Search, Plus, Filter } from "lucide-react";

/* ---------------- DATA ---------------- */
const staffData = [
  {
    id: 1,
    name: "Imran Ali",
    supervisor: "Mohammed Rahman",
    mobile: "+974 5551 2202",
    role: "Security Guard",
    total: 248,
    status: "Active",
    email: "imran.ali@vmssmall.qa",
    bay: "Bay A primary · Night shift",
    metrics: {
      entries: 248,
      avgTime: "1.8 min",
      today: 19,
    },
    history: [
      { date: "06 Sep 2025", time: "09:42", visitor: "ABC Logistics", bay: "Bay A", method: "OCR" },
      { date: "06 Sep 2025", time: "09:18", visitor: "Fresh Bites Vendor", bay: "Bay A", method: "Manual" },
      { date: "06 Sep 2025", time: "08:55", visitor: "City Center Hypermarket", bay: "Bay B", method: "QR" },
    ],
    activities: [
      { time: "09:45", activity: "Approved vendor entry for City Center Hypermarket at Bay A." },
      { time: "09:21", activity: "Updated destination for maintenance visitor to Service Area." },
      { time: "08:59", activity: "Created manual entry for QR scanner fallback at Bay B." },
    ],
  },
  {
    id: 2,
    name: "Sarah Lee",
    supervisor: "Sarah Johnson",
    mobile: "+974 5522 7810",
    role: "Security Guard",
    total: 193,
    status: "Active",
  },
  {
    id: 3,
    name: "Ravi Kumar",
    supervisor: "Ahmed Ali",
    mobile: "+974 5570 3345",
    role: "Senior Guard",
    total: 305,
    status: "Active",
  },
  {
    id: 4,
    name: "Anu Mathew",
    supervisor: "Lamia Hassan",
    mobile: "+974 5590 8741",
    role: "Relief Guard",
    total: 102,
    status: "Inactive",
  },
  {
    id: 5,
    name: "Khalid Hassan",
    supervisor: "Ravi Kumar",
    mobile: "+974 5518 1120",
    role: "Security Guard",
    total: 221,
    status: "Active",
  },
];

/* ---------------- PAGE ---------------- */
export default function StaffManagement() {
  const [staff, setStaff] = useState(staffData);
  const [selected, setSelected] = useState(staffData[0]);
  const [search, setSearch] = useState("");

  const filtered = staff.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleStatus = (id) => {
    setStaff((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, status: s.status === "Active" ? "Inactive" : "Active" }
          : s
      )
    );
  };

  return (
    <div className="min-h-screen flex bg-[#f5f7fa] text-[13px] font-normal text-[#3b3f45]">
      <main className="flex-1 p-6">

        {/* HEADER */}
        <div className="flex justify-between mb-5">
          <div>
            <h1 className="text-[18px] font-semibold text-[#1f2937]">
              Staff Management
            </h1>
            <p className="text-[12px] text-[#7b8794] mt-0.5">
              Manage security staff, their supervisors, entry performance and activity in the VMS.
            </p>
          </div>

          <div className="flex gap-2">
            <button className="flex items-center gap-1 px-3 py-1.5 bg-[#ecfdf3] text-[#1a7f37] rounded-md text-[12px]">
              <Filter size={14} /> Status: All
            </button>
            <button className="flex items-center gap-1 px-3 py-1.5 bg-[#16a34a] text-white rounded-md text-[12px]">
              <Plus size={14} /> Add Staff
            </button>
          </div>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-3 gap-6">

          {/* TABLE */}
          <div className="col-span-2 bg-white rounded-xl p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">

            {/* SEARCH */}
            <div className="flex items-center gap-2 bg-[#f5f7fa] rounded-lg px-3 py-2 mb-3">
              <Search size={14} className="text-[#9aa5b1]" />
              <input
                className="outline-none w-full bg-transparent text-[13px] placeholder:text-[#9aa5b1]"
                placeholder="Search staff by name, supervisor or mobile"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* TABLE */}
            <table className="w-full">
              <thead>
                <tr className="bg-[#f5f7fa] text-[#6b7280] text-[12px] font-medium">
                  <th className="py-2.5 px-2 text-left">Staff Name</th>
                  <th className="text-left">Supervisor</th>
                  <th className="text-left">Mobile Number</th>
                  <th className="text-left">Role</th>
                  <th className="text-left">Total Entries Recorded</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((s) => (
                  <tr
                    key={s.id}
                    onClick={() => setSelected(s)}
                    className="border-b border-[#eef1f4] hover:bg-[#f9fafb] cursor-pointer"
                  >
                    <td className="py-2.5 px-2 font-medium text-[#1f2937]">
                      {s.name}
                    </td>
                    <td className="py-2.5 text-[#4b5563]">{s.supervisor}</td>
                    <td className="py-2.5 text-[#4b5563]">{s.mobile}</td>
                    <td className="py-2.5 text-[#4b5563]">{s.role}</td>
                    <td className="py-2.5 text-[#4b5563]">{s.total}</td>
                    <td>
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStatus(s.id);
                        }}
                        className={`px-2 py-[2px] rounded-full text-[11px] font-medium ${
                          s.status === "Active"
                            ? "bg-[#e7f7ee] text-[#1a7f37]"
                            : "bg-[#f1f2f4] text-[#6b7280]"
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <p className="text-[11px] text-[#9aa5b1] mt-2">
              Showing 1–5 of 42 staff members
            </p>
          </div>

          {/* RIGHT PANEL */}
          {selected && (
            <div className="space-y-4">

              {/* PROFILE */}
              <div className="bg-white rounded-xl p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                <div className="flex justify-between mb-2">
                  <h3 className="font-semibold text-[13px]">Staff profile</h3>
                  <span className="bg-[#e7f7ee] text-[#1a7f37] px-2 py-[2px] rounded-full text-[11px] font-medium">
                    Active
                  </span>
                </div>

                <p className="font-semibold text-[14px] text-[#1f2937]">
                  {selected.name}
                </p>
                <p className="text-[12px] text-[#7b8794]">
                  {selected.role} · {selected.bay}
                </p>

                <div className="grid grid-cols-2 gap-3 mt-3 text-[12px]">
                  <div>
                    <p className="text-[#9aa5b1]">Mobile number</p>
                    <p>{selected.mobile}</p>
                  </div>
                  <div>
                    <p className="text-[#9aa5b1]">Email</p>
                    <p>{selected.email}</p>
                  </div>
                  <div>
                    <p className="text-[#9aa5b1]">Supervisor</p>
                    <p>{selected.supervisor}</p>
                  </div>
                  <div>
                    <p className="text-[#9aa5b1]">Role</p>
                    <p>{selected.role}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-4">
                  <Metric title="Total entries recorded" value={selected.metrics.entries} />
                  <Metric title="Avg. processing time" value={selected.metrics.avgTime} />
                  <Metric title="Today's entries" value={selected.metrics.today} />
                </div>
              </div>

              {/* ENTRY HISTORY */}
              <div className="bg-white rounded-xl p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                <h3 className="font-semibold text-[13px] mb-2">
                  Entry history (recent)
                </h3>

                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="bg-[#f5f7fa] text-[#6b7280]">
                      <th className="text-left py-2 px-1">Date</th>
                      <th className="text-left px-1">Time</th>
                      <th className="text-left px-1">Visitor</th>
                      <th className="text-left px-1">Bay</th>
                      <th className="text-left px-1">Entry method</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selected.history.map((h, i) => (
                      <tr key={i} className="border-b border-[#eef1f4]">
                        <td className="py-2 px-1">{h.date}</td>
                        <td className="px-1">{h.time}</td>
                        <td className="px-1">{h.visitor}</td>
                        <td className="px-1">{h.bay}</td>
                        <td className="px-1">{h.method}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ACTIVITIES */}
              <div className="bg-white rounded-xl p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                <h3 className="font-semibold text-[13px] mb-2">
                  My activities overview
                </h3>

                {selected.activities.map((a, i) => (
                  <div key={i} className="flex gap-3 text-[12px] mb-2">
                    <span className="text-[#9aa5b1]">{a.time}</span>
                    <p>{a.activity}</p>
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
    <div className="bg-[#ecfdf3] rounded-lg px-3 py-2">
      <p className="text-[11px] text-[#6b7280]">{title}</p>
      <p className="text-[14px] font-semibold text-[#1f2937]">
        {value}
      </p>
    </div>
  );
}
