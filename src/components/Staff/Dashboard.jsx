"use client";

import { useState } from "react";
import Sidebar from "@/components/Staff/Sidebar";

export default function StaffDashboardPage() {
  const [form, setForm] = useState({
    name: "",
    qid: "",
    mobile: "",
    vrn: "",
    purpose: "",
    bay: "",
    company: "",
    method: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    alert("Entry saved (backend integration pending)");
  };

  const handlePrint = () => {
    alert("Slip generated");
  };

  return (
    <div className="min-h-screen bg-[#f6f8fa] flex">
      

      <main className="flex-1 p-4 sm:p-6 space-y-6">


        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h1 className="font-semibold text-2xl text-gray-800">
              Security Staff Panel
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Lowest access view for on-site guards. One-way entry capture only.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">Site: Nexcore Alliance</span>
            <div className="w-9 h-9 rounded-full bg-gray-300" />
          </div>
        </div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat title="Today's Entries Captured" value="26" note="Updated in real-time during your shift" />
          <Stat title="Average Processing Time" value="17s" tag="Target 15s" note="Time per entry" />
          <Stat title="Active Bays" value="3" tag="A / B / C" note="Assigned bays" />
          <Stat title="Last Entry Captured" value="14:18" note="Captured via QR" />
        </div>

        {/* MAIN CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ENTRY CAPTURE */}
          <div className="lg:col-span-2 bg-white border rounded-xl p-5 space-y-5">

            <h3 className="font-semibold text-2xl text-gray-700">
              Entry Capture (one-way only)
            </h3>

            {/* ENTRY MODE */}
            <div className="flex flex-wrap gap-3">
              <button className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm">QR Scan</button>
              <button className="px-4 py-2 rounded-lg bg-green-50 text-green-700 text-sm">OCR / ANPR</button>
              <button className="px-4 py-2 rounded-lg bg-green-50 text-green-700 text-sm">Manual</button>
            </div>

            {/* CAMERA */}
            <div className="h-44 border rounded-lg flex items-center justify-center text-sm text-gray-400">
              Camera preview / plate scan area
            </div>

            {/* FORM */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <Input label="Date" value="2025-09-08" readOnly />
              <Input label="Time In" value="14:20" readOnly />
              <Input label="Full Name" name="name" value={form.name} onChange={handleChange} />
              <Input label="QID Number" name="qid" value={form.qid} onChange={handleChange} />
              <Input label="Mobile Number" name="mobile" value={form.mobile} onChange={handleChange} />
              <Input label="Vehicle Registration" name="vrn" value={form.vrn} onChange={handleChange} />

              <Select label="Purpose" name="purpose" onChange={handleChange} />
              <Select label="Bay" name="bay" onChange={handleChange} />
              <Select label="Company" name="company" onChange={handleChange} />
              <Select label="Entry Method" name="method" onChange={handleChange} />
            </div>

            {/* ACTIONS */}
            <div className="flex flex-wrap justify-end gap-3">
              <button onClick={handlePrint} className="px-4 py-2 text-sm rounded-lg border">
                Save & Print Slip
              </button>
              <button onClick={handleSave} className="px-5 py-2 text-sm rounded-lg bg-green-600 text-white">
                Save Entry
              </button>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="space-y-6">

            <InfoBox title="What you can do">
              <Item label="Capture new visitor entries" allowed />
              <Item label="Use QR and OCR/ANPR" allowed />
              <Item label="Edit past records" blocked />
              <Item label="Delete records" blocked />
            </InfoBox>

            <InfoBox title="My stats today">
              <StatRow label="Entries captured" value="26" />
              <StatRow label="Avg processing time" value="17s" />
              <StatRow label="Active shift duration" value="03:12h" />
            </InfoBox>
          </div>
        </div>

        {/* RECENT ENTRIES */}
        <div className="bg-white border rounded-xl p-5 overflow-x-auto">
          <h3 className="font-medium mb-4">My Recent Entries</h3>

          <table className="min-w-[700px] w-full text-sm">
            <thead className="text-gray-500 border-b">
              <tr>
                <th className="py-2 text-left">Time In</th>
                <th>Name</th>
                <th>QID</th>
                <th>VRN</th>
                <th>Mobile</th>
                <th>Bay</th>
                <th>Company</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              <Row />
              <Row />
              <Row />
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

/* ---------- COMPONENTS ---------- */

function Stat({ title, value, note, tag }) {
  return (
    <div className="bg-white border rounded-xl p-4">
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>{title}</span>
        {tag && <span className="bg-green-50 text-green-700 px-2 rounded">{tag}</span>}
      </div>
      <div className="text-2xl font-semibold">{value}</div>
      <div className="text-xs text-gray-400">{note}</div>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div>
      <label className="text-xs text-gray-500">{label}</label>
      <input {...props} className="w-full border rounded-lg px-3 py-2 mt-1 text-sm" />
    </div>
  );
}

function Select({ label, name, onChange }) {
  return (
    <div>
      <label className="text-xs text-gray-500">{label}</label>
      <select name={name} onChange={onChange} className="w-full border rounded-lg px-3 py-2 mt-1 text-sm">
        <option value="">Select</option>
        <option value="A">Option A</option>
        <option value="B">Option B</option>
      </select>
    </div>
  );
}

function InfoBox({ title, children }) {
  return (
    <div className="bg-white border rounded-xl p-5 text-sm">
      <h4 className="font-medium mb-3">{title}</h4>
      {children}
    </div>
  );
}

function Item({ label, allowed, blocked }) {
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <span className={allowed ? "text-green-600" : "text-red-500"}>
        {allowed ? "Allowed" : "Blocked"}
      </span>
    </div>
  );
}

function StatRow({ label, value }) {
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function Row() {
  return (
    <tr className="border-b last:border-none">
      <td className="py-2">14:18</td>
      <td>Ahmed Ali</td>
      <td>QID-90321</td>
      <td>QA-12345</td>
      <td>55612345</td>
      <td>Bay B</td>
      <td>Nexcore</td>
      <td className="text-green-600">Saved</td>
    </tr>
  );
}
