"use client";

import { useState } from "react";
import Sidebar from "@/components/Staff/Sidebar";

export default function SearchEntry() {
  const [entries, setEntries] = useState([]);
  const [selected, setSelected] = useState(null);
  const [quickFilter, setQuickFilter] = useState("today");

  return (
    <div className="h-screen bg-[#f5f7fa] flex overflow-hidden text-[13px] text-gray-700">
     
      {/* PAGE CONTENT */}
      <main className="flex-1 p-4 sm:p-6 space-y-6">
        {/* HEADER */}
        <div className="mb-4 flex justify-between items-start">
          <div>
            <h1 className="font-semibold text-2xl">Search Entries</h1>
            <p className="text-xs text-gray-500">
              Search across entry records with filters. Your view is limited to
              entries you are allowed to see.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-5">
          {/* LEFT SECTION */}
          <div className="col-span-12 lg:col-span-8 space-y-4">
            {/* SEARCH PANEL */}
            <div className="bg-white border rounded-lg p-4">
              <div className="flex justify-between mb-3">
                <h3 className="font-semibold text-xl">
                  Search entry records
                </h3>
                <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                  Search & filter
                </span>
              </div>

              {/* INPUT FIELDS */}
              <div className="grid grid-cols-3 gap-3 text-xs mb-3">
                <input
                  className="border rounded px-2 h-8"
                  placeholder="Enter vehicle registration number"
                />
                <input
                  className="border rounded px-2 h-8"
                  placeholder="Enter visitor name"
                />
                <input
                  className="border rounded px-2 h-8"
                  placeholder="Enter mobile number"
                />
                <input
                  className="border rounded px-2 h-8 col-span-2"
                  placeholder="Enter company or tenant"
                />
              </div>

              {/* DROPDOWNS */}
              <div className="grid grid-cols-4 gap-3 text-xs mb-3">
                <select className="border rounded px-2 h-8">
                  <option value="">Select date range</option>
                  <option>Today</option>
                  <option>Yesterday</option>
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                </select>

                <select className="border rounded px-2 h-8">
                  <option value="">All methods</option>
                  <option>QR</option>
                  <option>OCR / ANPR</option>
                  <option>Manual</option>
                </select>

                <select className="border rounded px-2 h-8">
                  <option value="">All bays</option>
                  <option>Bay A</option>
                  <option>Bay B</option>
                  <option>Bay C</option>
                </select>

                <select className="border rounded px-2 h-8">
                  <option value="">All statuses</option>
                  <option>Inside</option>
                  <option>Exited</option>
                </select>
              </div>

              {/* QUICK FILTER BUTTONS */}
              <div className="flex gap-2 mb-3 flex-wrap">
                {[
                  { id: "today", label: "Today" },
                  { id: "yesterday", label: "Yesterday" },
                  { id: "last7", label: "Last 7 days" },
                  { id: "mine", label: "My entries only" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setQuickFilter(item.id)}
                    className={`px-3 py-1 rounded-full text-xs border transition ${
                      quickFilter === item.id
                        ? "bg-green-100 text-green-700 border-green-300"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex gap-2">
                <button
                  className="px-4 py-1 rounded bg-green-600 text-white text-xs hover:bg-green-700 transition"
                  onClick={() =>
                    console.log("Run search with filter:", quickFilter)
                  }
                >
                  Run search
                </button>

                <button
                  className="px-4 py-1 rounded border text-xs hover:bg-gray-50 transition"
                  onClick={() => setQuickFilter("today")}
                >
                  Clear filters
                </button>
              </div>
            </div>

            {/* TABLE */}
            <div className="bg-white border rounded-lg p-4">
              <table className="w-full text-xs">
                <thead className="bg-green-50">
                  <tr>
                    <th className="p-2 text-left">Time In</th>
                    <th className="p-2 text-left">Time Out</th>
                    <th className="p-2 text-left">VRN</th>
                    <th className="p-2 text-left">Visitor Name</th>
                    <th className="p-2 text-left">
                      Company / Tenant
                    </th>
                    <th className="p-2 text-left">Bay</th>
                    <th className="p-2 text-left">Entry Method</th>
                    <th className="p-2 text-left">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {[
                    {
                      timeIn: "09:14",
                      timeOut: "-",
                      vrn: "QAT 44129",
                      name: "Ahmed Khan",
                      company: "Nexcore Supplies",
                      bay: "Bay B",
                      method: "QR",
                      status: "Inside",
                    },
                    {
                      timeIn: "09:02",
                      timeOut: "09:41",
                      vrn: "QAT 99231",
                      name: "Maria Lopez",
                      company: "Skyline Retail",
                      bay: "Bay A",
                      method: "OCR / ANPR",
                      status: "Exited",
                    },
                  ].map((e, i) => (
                    <tr
                      key={i}
                      onClick={() => setSelected(e)}
                      className="border-t cursor-pointer hover:bg-gray-50"
                    >
                      <td className="p-2">{e.timeIn}</td>
                      <td className="p-2">{e.timeOut}</td>
                      <td className="p-2">{e.vrn}</td>
                      <td className="p-2">{e.name}</td>
                      <td className="p-2">{e.company}</td>
                      <td className="p-2">{e.bay}</td>
                      <td className="p-2">{e.method}</td>
                      <td className="p-2">
                        {e.status === "Inside" ? (
                          <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                            Inside
                          </span>
                        ) : (
                          <span className="text-gray-500">
                            Exited
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-between mt-3 text-xs text-gray-500">
                <span>Showing 1–5 of 128 matching entries</span>
                <div className="flex gap-2">
                  <button className="border px-3 py-1 rounded">
                    Previous
                  </button>
                  <button className="border px-3 py-1 rounded bg-green-50 text-green-600">
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="col-span-12 lg:col-span-4 space-y-4">
            <div className="bg-white border rounded-lg p-4">
              <h3 className="text-sm font-medium mb-2">
                Selected entry details
              </h3>

              {selected ? (
                <>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-gray-500">VRN</span>
                      <p className="font-medium">{selected.vrn}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Visitor</span>
                      <p className="font-medium">{selected.name}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Bay</span>
                      <p className="font-medium">{selected.bay}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Entry method</span>
                      <p className="font-medium">
                        {selected.method}
                      </p>
                    </div>
                  </div>

                  <div className="text-xs mt-3">
                    <p className="text-gray-500">
                      Purpose & destination
                    </p>
                    <p>
                      Delivery – Tenant: {selected.company}
                    </p>
                    <p className="mt-2">
                      Time in: {selected.timeIn} • Status{" "}
                      <span className="text-green-600 font-medium">
                        Inside
                      </span>
                    </p>
                  </div>

                  <div className="flex gap-2 mt-3">
                    <button className="px-3 py-1 border rounded text-xs">
                      Notify Supervisor
                    </button>
                    <button className="px-3 py-1 border rounded text-xs">
                      View full record
                    </button>
                  </div>
                </>
              ) : (
                <p className="text-xs text-gray-400">
                  Select an entry to view details
                </p>
              )}
            </div>

            <div className="bg-white border rounded-lg p-4 text-xs">
              <h3 className="font-medium mb-2">Quick filters</h3>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full">
                  Inside only
                </span>
                <span className="px-2 py-1 bg-gray-100 rounded-full">
                  Exited today
                </span>
                <span className="px-2 py-1 bg-gray-100 rounded-full">
                  My entries only
                </span>
                <span className="px-2 py-1 bg-gray-100 rounded-full">
                  Manual entries
                </span>
              </div>
            </div>

            <div className="bg-white border rounded-lg p-4 text-xs">
              <h3 className="font-medium mb-2">Search guidance</h3>
              <ul className="list-disc pl-4 space-y-1 text-gray-600">
                <li>Start with VRN or mobile when available.</li>
                <li>Narrow date range to reduce long lists.</li>
                <li>Use bay filter for specific loading bays.</li>
                <li>Confirm spelling and timing if record not found.</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
