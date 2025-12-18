"use client";

import { useState } from "react";
import { Calendar, ChevronDown, FileDown } from "lucide-react";

const rows = [
  {
    time: "10:14 / 11:02",
    bay: "Bay B",
    vrn: "SGX 4521K",
    name: "Muhd Firdaus",
    company: "FastTrack Logistics",
    handledBy: "—",
    method: "OCR",
    direction: "IN",
  },
  {
    time: "10:32 / —",
    bay: "Bay A",
    vrn: "SLD 9082H",
    name: "Aisha Rahman",
    company: "FreshChoice Foods",
    handledBy: "—",
    method: "QR",
    direction: "IN",
  },
];

export default function SearchRecords() {
  const [dateRange, setDateRange] = useState("Today");
  const [entryMethod, setEntryMethod] = useState("All methods");
  const [bay, setBay] = useState("All bays");
  const [staff, setStaff] = useState("All staff");

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex-1 overflow-auto">
                {/* 🔹 TOP NAVBAR (ADDED) */}
        <div className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Search Records</h1>
            <p className="text-gray-500 text-sm mt-1">
              Search across visitor, staff, supervisor and tenant records.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-semibold text-gray-700">
              AT
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-800">Alex Tan</p>
              <p className="text-xs text-gray-500">Operations Manager</p>
            </div>
          </div>
        </div>


        {/* FILTERS */}
        <div className="bg-white mx-8 mt-6 p-6 rounded-lg border border-gray-200">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-gray-900">Filters</h2>
            <p className="text-sm text-gray-500">
              Search within assigned bays and time window.
            </p>
          </div>

          {/* ROW 1 */}
          <div className="grid grid-cols-4 gap-4">
            <Input label="VRN" placeholder="e.g. SGX 4521K" />
            <Input label="QID" placeholder="Enter QID" />
            <Input label="Mobile Number" placeholder="+974 5555 1234" />
            <Input label="Visitor / Company" placeholder="Name or company" />
          </div>

          {/* ROW 2 */}
          <div className="grid grid-cols-4 gap-4 mt-4">
            <Select
              label="Date range"
              value={dateRange}
              onChange={setDateRange}
              icon={<Calendar size={16} />}
              options={["Today", "Yesterday", "Last 7 days"]}
            />

            <Select
              label="Entry method"
              value={entryMethod}
              onChange={setEntryMethod}
              options={["All methods", "OCR", "QR", "Manual"]}
            />

            <Select
              label="Bay"
              value={bay}
              onChange={setBay}
              options={["All bays", "Bay A", "Bay B", "Bay C"]}
            />

            <Select
              label="Handled by staff"
              value={staff}
              onChange={setStaff}
              options={["All staff", "Ali Hassan", "Sara Ibrahim"]}
            />
          </div>

          {/* ACTIONS */}
          <div className="flex justify-between items-center mt-6">
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-green-50 text-green-700 rounded-md text-xs font-medium">
                Last 2 hours
              </button>
              <button className="px-3 py-1 text-gray-600 hover:bg-gray-50 rounded-md text-xs font-medium">
                Today
              </button>
            </div>

            <div className="flex gap-2">
              <button className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-md text-sm font-medium">
                Clear
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700">
                Search records
              </button>
            </div>
          </div>
        </div>

        {/* RESULTS */}
        <div className="bg-white mx-8 mt-6 mb-6 p-6 rounded-lg border border-gray-200">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Results</h2>
              <p className="text-sm text-gray-500">
                Showing records based on applied filters.
              </p>
            </div>

            <button className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50">
              <FileDown size={16} />
              Export CSV
            </button>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  {[
                    "Time",
                    "Bay",
                    "VRN",
                    "Visitor Name",
                    "Company",
                    "Handled By",
                    "Method",
                    "Direction",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left py-3 px-4 text-xs font-semibold text-gray-700 bg-gray-50"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="px-4 py-3 text-sm">{r.time}</td>
                    <td className="px-4 py-3 text-sm">{r.bay}</td>
                    <td className="px-4 py-3 text-sm">{r.vrn}</td>
                    <td className="px-4 py-3 text-sm">{r.name}</td>
                    <td className="px-4 py-3 text-sm">{r.company}</td>
                    <td className="px-4 py-3 text-sm">{r.handledBy}</td>
                    <td className="px-4 py-3 text-sm">{r.method}</td>
                    <td className="px-4 py-3 text-sm">{r.direction}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

/* ---------- COMPONENTS ---------- */

function Input({ label, placeholder }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-2">
        {label}
      </label>
      <input
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm
        focus:outline-none focus:ring-2 focus:ring-green-500"
      />
    </div>
  );
}

function Select({ label, value, onChange, options, icon }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm
          appearance-none bg-white cursor-pointer
          focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          {options.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>

        {icon ? (
          <span className="absolute right-3 top-2.5 text-gray-400">{icon}</span>
        ) : (
          <ChevronDown
            size={16}
            className="absolute right-3 top-2.5 text-gray-400 pointer-events-none"
          />
        )}
      </div>
    </div>
  );
}
