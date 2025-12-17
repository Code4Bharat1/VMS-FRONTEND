"use client";

import { useState } from "react";
import Sidebar from "@/components/Staff/Sidebar";

export default function QREntry() {
  // ---------- STATE ----------
  const [camera, setCamera] = useState("front");
  const [visitorName, setVisitorName] = useState("");
  const [qid, setQid] = useState("");
  const [vrn, setVrn] = useState("");
  const [mobile, setMobile] = useState("");
  const [purpose, setPurpose] = useState("");
  const [destination, setDestination] = useState("");

  // ---------- ACTIONS ----------
  const handleSave = () => {
    const payload = {
      visitorName,
      qid,
      vrn,
      mobile,
      purpose,
      destination,
      method: "QR",
    };

    console.log("ENTRY SAVED:", payload);
    alert("Entry saved (check console)");
  };

  const handleRetry = () => {
    alert("Retrying scan...");
  };

  const handleSwitchCamera = () => {
    setCamera(camera === "front" ? "back" : "front");
  };

  return (
    <div className="min-h-screen bg-[#f5f7fa] flex text-[13px] text-gray-700">
      {/* SIDEBAR */}
      <Sidebar />

      {/* CONTENT */}
      <main className="flex-1 p-4 sm:p-6 space-y-6">
        {/* HEADER */}
        <div className="flex justify-between mb-5">
          <div>
            <h1 className="text-lg font-semibold">QR Scan Entry Capture</h1>
            <p className="text-xs text-gray-500">
              Use your device camera to scan visitor or delivery QR codes.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-5">
          {/* LEFT */}
          <div className="col-span-12 lg:col-span-8 space-y-4">
            {/* SCANNER */}
            <div className="bg-white border rounded-xl p-5">
              <div className="flex justify-between mb-4">
                <h3 className="text-sm font-medium">QR Scanner</h3>
                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                  Mode: QR only
                </span>
              </div>

              <div className="border-2 border-dashed border-green-400 rounded-xl h-56 flex flex-col items-center justify-center mb-4">
                <div className="w-10 h-10 border-2 border-green-500 rounded-md" />
                <p className="text-xs text-gray-500 mt-3 text-center">
                  Camera: <b>{camera}</b>
                </p>
              </div>

              <div className="flex justify-center gap-2 mb-4">
                <button
                  onClick={handleSwitchCamera}
                  className="px-4 py-1.5 rounded bg-green-100 text-green-700 text-xs"
                >
                  Switch camera
                </button>
                <button
                  onClick={handleRetry}
                  className="px-4 py-1.5 rounded bg-green-100 text-green-700 text-xs"
                >
                  Retry scan
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3 text-xs">
                <InfoBox label="Logged-in staff" value="Guard-102" />
                <InfoBox label="Last scan" value="14:22" />
                <InfoBox label="Entry method" value="QR Scan" />
              </div>
            </div>

            {/* FORM */}
            <div className="bg-white border rounded-xl p-5">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <Input label="Visitor Name" value={visitorName} setValue={setVisitorName} />
                <Input label="QID" value={qid} setValue={setQid} />
                <Input label="VRN" value={vrn} setValue={setVrn} />
                <Input label="Mobile Number" value={mobile} setValue={setMobile} />

                <Select
                  label="Purpose"
                  value={purpose}
                  setValue={setPurpose}
                  options={["Delivery", "Visit", "Maintenance"]}
                />

                <Select
                  label="Destination (Bay / Tenant)"
                  value={destination}
                  setValue={setDestination}
                  options={["Bay A", "Bay B", "Bay C"]}
                />
              </div>

              <div className="flex justify-end gap-3 mt-5">
                <button className="px-4 py-1.5 rounded border text-xs">
                  Save & Print Slip
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-1.5 rounded bg-green-600 text-white text-xs"
                >
                  Save Entry
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="col-span-12 lg:col-span-4 space-y-4">
            <Card title="Scan status & guidance">
              <ul className="space-y-1 text-xs text-gray-600">
                <li>• Ensure QR is fully visible</li>
                <li>• Verify visitor details before saving</li>
                <li>• Use manual entry if scan fails</li>
              </ul>
            </Card>

            <Card title="My QR scan metrics today">
              <div className="grid grid-cols-3 gap-3">
                <Metric label="QR entries" value="18" />
                <Metric label="Avg time" value="14s" />
                <Metric label="Success rate" value="96%" />
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ---------- COMPONENTS ---------- */

function Input({ label, value, setValue }) {
  return (
    <div>
      <label className="text-gray-500">{label}</label>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full mt-1 h-8 border rounded px-2"
      />
    </div>
  );
}

function Select({ label, value, setValue, options }) {
  return (
    <div>
      <label className="text-gray-500">{label}</label>
      <select
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full mt-1 h-8 border rounded px-2"
      >
        <option value="">Select</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

function InfoBox({ label, value }) {
  return (
    <div className="bg-gray-50 border rounded-lg p-2">
      <p className="text-gray-500">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="bg-white border rounded-xl p-4 text-xs">
      <h3 className="text-sm font-medium mb-2">{title}</h3>
      {children}
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="bg-gray-50 border rounded-lg p-3 text-center">
      <p className="text-[11px] text-gray-500">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}
