"use client";

import { useState } from "react";
import Sidebar from "@/components/Staff/Sidebar";

const entriesData = [
  { time: "09:14", vrn: "QAT 44129", name: "Ahmed Khan", company: "Nexcore Supplies", bay: "Bay B", method: "QR", status: "Inside" },
  { time: "09:02", vrn: "QAT 99231", name: "Maria Lopez", company: "Skyline Retail", bay: "Bay A", method: "OCR / ANPR", status: "Exited" },
  { time: "08:47", vrn: "QAT 77311", name: "John Perez", company: "LogiCorp", bay: "Bay C", method: "Manual", status: "Inside" },
  { time: "08:21", vrn: "QAT 66421", name: "Rashid Ali", company: "FreshMart", bay: "Bay B", method: "QR", status: "Exited" },
  { time: "07:55", vrn: "QAT 55291", name: "Emily Chen", company: "Metro Food", bay: "Bay A", method: "Manual", status: "Pending update" },
];

export default function MyEntries() {
  const [date, setDate] = useState("Today");
  const [method, setMethod] = useState("All methods");
  const [bay, setBay] = useState("All bays");
  const [status, setStatus] = useState("All statuses");
  const [selected, setSelected] = useState(entriesData[2]);

  return (
    <div className="min-h-screen bg-[#f5f7fa] flex font-sans text-[20px] text-gray-700">
      
      {/* STAFF SIDEBAR */}
      <Sidebar />

      {/* PAGE CONTENT */}
      <main className="flex-1 p-4 sm:p-6 space-y-6">

        
        {/* Header */}
        <div className="mb-4">
          <h1 className="font-semibold text-2xl">My Entries</h1>
          <p className="text-xs text-gray-500">
            View and review all entries you have captured. Limited to your own records and current shift rules.
          </p>
        </div>

        <div className="grid grid-cols-12 gap-5">
          
          {/* Table Section */}
          <div className="col-span-12 lg:col-span-8 bg-white border rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-xl">Entries captured by you</h3>
              <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                Today & recent
              </span>
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-3 text-xs flex-wrap">
              <select value={date} onChange={e => setDate(e.target.value)} className="border rounded px-2 h-8">
                <option>Today</option>
                <option>Yesterday</option>
                <option>Last 7 days</option>
              </select>

              <select value={method} onChange={e => setMethod(e.target.value)} className="border rounded px-2 h-8">
                <option>All methods</option>
                <option>QR</option>
                <option>OCR / ANPR</option>
                <option>Manual</option>
              </select>

              <select value={bay} onChange={e => setBay(e.target.value)} className="border rounded px-2 h-8">
                <option>All bays</option>
                <option>Bay A</option>
                <option>Bay B</option>
                <option>Bay C</option>
              </select>

              <select value={status} onChange={e => setStatus(e.target.value)} className="border rounded px-2 h-8">
                <option>All statuses</option>
                <option>Inside</option>
                <option>Exited</option>
                <option>Pending update</option>
              </select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead className="bg-green-50">
                  <tr className="text-left">
                    <th className="p-2">Time In</th>
                    <th className="p-2">VRN</th>
                    <th className="p-2">Visitor Name</th>
                    <th className="p-2">Company / Tenant</th>
                    <th className="p-2">Bay</th>
                    <th className="p-2">Entry Method</th>
                    <th className="p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {entriesData.map((e, i) => (
                    <tr
                      key={i}
                      onClick={() => setSelected(e)}
                      className={`border-t cursor-pointer hover:bg-gray-50 ${
                        selected.vrn === e.vrn ? "bg-green-50" : ""
                      }`}
                    >
                      <td className="p-2">{e.time}</td>
                      <td className="p-2">{e.vrn}</td>
                      <td className="p-2">{e.name}</td>
                      <td className="p-2">{e.company}</td>
                      <td className="p-2">{e.bay}</td>
                      <td className="p-2">{e.method}</td>
                      <td className="p-2">
                        <span
                          className={`px-2 py-0.5 rounded-full ${
                            e.status === "Inside"
                              ? "bg-green-100 text-green-700"
                              : e.status === "Exited"
                              ? "bg-gray-200 text-gray-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {e.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-3 text-xs text-gray-500">
              <span>Showing 1–5 of 42 entries</span>
              <div className="flex gap-2">
                <button className="px-3 py-1 border rounded">Previous</button>
                <button className="px-3 py-1 border rounded bg-green-50 text-green-600">
                  Next
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="col-span-12 lg:col-span-4 space-y-4">
            
            {/* Selected Summary */}
            <div className="bg-white border rounded-lg p-4">
              <h3 className="font-medium text-sm mb-3">Selected entry summary</h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div><span className="text-gray-500">VRN</span><p className="font-medium">{selected.vrn}</p></div>
                <div><span className="text-gray-500">Visitor</span><p className="font-medium">{selected.name}</p></div>
                <div><span className="text-gray-500">Bay</span><p className="font-medium">{selected.bay}</p></div>
                <div><span className="text-gray-500">Entry method</span><p className="font-medium">{selected.method}</p></div>
              </div>
              <div className="text-xs mt-3">
                <p className="text-gray-500">Purpose & destination</p>
                <p>Delivery – Tenant: {selected.company}</p>
                <p className="mt-2">
                  Time in: {selected.time} • Status:{" "}
                  <span className="text-green-600 font-medium">{selected.status}</span>
                </p>
              </div>
              <div className="flex gap-2 mt-3">
                <button className="px-3 py-1 border rounded text-xs">
                  Request correction
                </button>
                <button className="px-3 py-1 border rounded text-xs">
                  View full details
                </button>
              </div>
            </div>

            {/* Statistics */}
            <div className="bg-white border rounded-lg p-4">
              <h3 className="font-medium text-sm mb-3">My entry statistics</h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-gray-50 p-2 rounded">Total entries<br /><strong>24</strong></div>
                <div className="bg-gray-50 p-2 rounded">Avg processing time<br /><strong>20s</strong></div>
                <div className="bg-gray-50 p-2 rounded">Manual share<br /><strong>35%</strong></div>
                <div className="bg-gray-50 p-2 rounded">Error / correction rate<br /><strong>2%</strong></div>
              </div>
            </div>

            {/* Shift Notes */}
            <div className="bg-white border rounded-lg p-4">
              <h3 className="font-medium text-sm mb-2">Shift notes</h3>
              <ul className="text-xs list-disc pl-4 space-y-1 text-gray-600">
                <li>Prioritise QR and OCR / ANPR where possible.</li>
                <li>Double-check VRN and mobile number before saving.</li>
                <li>Use clear notes when you expect delays or bay changes.</li>
              </ul>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
