"use client";

import { useState } from "react";


const methods = ["All", "OCR", "QR", "Manual"];
const recordTypes = [
  "All records",
  "Visitor records",
  "Staff records",
  "Supervisor records",
  "Tenants records",
];

const rows = [
  {
    name: "Muhd Firdaus",
    vrn: "SGX 4521K",
    qid: "7845 2234 9981",
    company: "FastTrack Logistics",
    purpose: "Delivery",
    destination: "HyperMart – Bay B",
    time: "10:14 / 11:02",
    method: "OCR",
  },
  {
    name: "Aisha Rahman",
    vrn: "SLD 9082H",
    qid: "7845 9988 1123",
    company: "FreshChoice Foods",
    purpose: "F&B supply",
    destination: "FreshChoice – Bay A",
    time: "10:32 / —",
    method: "QR",
  },
  {
    name: "John Lim",
    vrn: "GBH 4412M",
    qid: "7845 6677 2211",
    company: "Metro Courier",
    purpose: "Courier",
    destination: "ElectroHub – Bay C",
    time: "09:48 / 10:20",
    method: "Manual",
  },
  {
    name: "Ravi Kumar",
    vrn: "SKP 2209T",
    qid: "7845 5566 8899",
    company: "SwiftHaul",
    purpose: "Backload",
    destination: "HyperMart – Bay B",
    time: "08:55 / 12:10",
    method: "OCR",
  },
  {
    name: "Nurul Huda",
    vrn: "SFT 1290C",
    qid: "7845 3344 5566",
    company: "DailyFresh Supplies",
    purpose: "Delivery",
    destination: "FreshChoice – Bay A",
    time: "07:42 / 08:15",
    method: "QR",
  },
];

export default function SearchRecords() {
  const [entryMethod, setEntryMethod] = useState("All");
  const [recordType, setRecordType] = useState("All records");

  return (
    <div className="min-h-screen flex bg-[#f6f8fb] text-[14px] text-gray-700">
    

      <main className="flex-1 ml-4 p-6 space-y-6">

        {/* HEADER */}
        <div>
          <h1 className="text-2xl font-semibold">Search Records</h1>
          <p className="text-gray-500">
            Search across all visitor, staff, supervisor and tenant records with advanced filters and exports.
          </p>
        </div>

        {/* FILTER CARD */}
        <div className="bg-white rounded-xl p-5">
          <h3 className="font-semibold mb-4">Search filters</h3>

          {/* ROW 1 */}
          <div className="grid grid-cols-4 gap-4 mb-4">
            <Input label="Vehicle registration number (VRN)" placeholder="e.g. SGX 4521K" />
            <Input label="QID / Emirates ID" placeholder="Scan or type ID number" />
            <Input label="Mobile number" placeholder="e.g. +974 5555 1234" />
            <DateRange />
          </div>

          {/* ROW 2 */}
          <div className="grid grid-cols-4 gap-4 mb-4">
            <Input label="Name" placeholder="Visitor / staff / supervisor name" />
            <Input label="Company" placeholder="e.g. FastTrack Logistics" />
            <Input label="Tenant / Destination" placeholder="e.g. HyperMart" />

            <div>
              <label className="text-sm text-gray-500">Entry method</label>
              <div className="flex gap-2 mt-1">
                {methods.map((m) => (
                  <Chip
                    key={m}
                    active={entryMethod === m}
                    onClick={() => setEntryMethod(m)}
                  >
                    {m}
                  </Chip>
                ))}
              </div>
            </div>
          </div>

          {/* ROW 3 */}
          <div className="grid grid-cols-4 gap-4 items-end">
            <div>
              <label className="text-sm text-gray-500">Record type</label>
              <div className="flex gap-2 mt-1 flex-wrap">
                {recordTypes.map((r) => (
                  <Chip
                    key={r}
                    active={recordType === r}
                    onClick={() => setRecordType(r)}
                  >
                    {r}
                  </Chip>
                ))}
              </div>
            </div>

            <Quick label="Quick presets" items={["Last 2 hours", "Today", "This week"]} />
            <Quick label="Export-ready range" items={["Yesterday", "Last 7 days", "Last 30 days"]} />

            <div className="flex justify-end gap-2">
              <button className="px-4 py-2 rounded-md bg-green-100 text-green-700">
                Save as preset
              </button>
              <button className="px-4 py-2 rounded-md bg-green-600 text-white">
                Search records
              </button>
            </div>
          </div>
        </div>

        {/* RESULTS */}
        <div className="bg-white rounded-xl p-5">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h3 className="font-semibold">Search results</h3>
              <p className="text-sm text-gray-400">
                Showing 1–10 of 234 records matching current filters.
              </p>
            </div>

            <div className="flex gap-2">
              <button className="px-3 py-1.5 bg-green-100 text-green-700 rounded-md">
                Export CSV
              </button>
              <button className="px-3 py-1.5 bg-green-100 text-green-700 rounded-md">
                Export PDF
              </button>
            </div>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500">
                <th className="text-left py-2">Visitor name</th>
                <th>VRN</th>
                <th>QID</th>
                <th>Company</th>
                <th>Purpose</th>
                <th>Destination</th>
                <th>Time in / out</th>
                <th>Entry method</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="bg-green-50">
                  <td className="py-2">{r.name}</td>
                  <td>{r.vrn}</td>
                  <td>{r.qid}</td>
                  <td>{r.company}</td>
                  <td>{r.purpose}</td>
                  <td>{r.destination}</td>
                  <td>{r.time}</td>
                  <td>
                    <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs">
                      {r.method}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* PAGINATION */}
          <div className="flex justify-between items-center mt-4 text-sm text-gray-400">
            <span>Rows per page: 10</span>
            <div className="flex gap-2">
              <button>Prev</button>
              <button className="px-2 bg-green-600 text-white rounded">1</button>
              <button>2</button>
              <button>3</button>
              <button>Next</button>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}

/* ---------- SMALL COMPONENTS ---------- */

function Input({ label, placeholder }) {
  return (
    <div>
      <label className="text-sm text-gray-500">{label}</label>
      <input
        className="w-full mt-1 px-3 py-2 bg-[#f6f8fb] rounded-md outline-none"
        placeholder={placeholder}
      />
    </div>
  );
}

function Chip({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-sm ${
        active
          ? "bg-green-600 text-white"
          : "bg-green-100 text-green-700"
      }`}
    >
      {children}
    </button>
  );
}

function DateRange() {
  return (
    <div>
      <label className="text-sm text-gray-500">Date range</label>
      <div className="flex gap-2 mt-1">
        <input className="bg-[#f6f8fb] px-2 py-2 rounded-md w-full" value="01 Aug 2024, 00:00" readOnly />
        <input className="bg-[#f6f8fb] px-2 py-2 rounded-md w-full" value="07 Aug 2024, 23:59" readOnly />
      </div>
    </div>
  );
}

function Quick({ label, items }) {
  return (
    <div>
      <label className="text-sm text-gray-500">{label}</label>
      <div className="flex gap-2 mt-1 flex-wrap">
        {items.map((i) => (
          <span
            key={i}
            className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm cursor-pointer"
          >
            {i}
          </span>
        ))}
      </div>
    </div>
  );
}
