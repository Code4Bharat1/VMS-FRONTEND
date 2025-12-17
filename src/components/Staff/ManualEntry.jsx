"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Staff/Sidebar";

export default function ManualEntry() {
  const [visitorName, setVisitorName] = useState("");
  const [qid, setQid] = useState("");
  const [mobile, setMobile] = useState("");
  const [company, setCompany] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [driverName, setDriverName] = useState("");
  const [driverMobile, setDriverMobile] = useState("");
  const [purpose, setPurpose] = useState("");
  const [bayId, setBayId] = useState("");
  const [duration, setDuration] = useState("");
  const [notes, setNotes] = useState("");

  const [bays, setBays] = useState([]);
  const [loading, setLoading] = useState(false);

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  /* ---------------- FETCH BAYS ---------------- */
  useEffect(() => {
    if (!token) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bays`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setBays(data.bays || []))
      .catch(() => alert("Failed to load bays"));
  }, [token]);

  /* ---------------- SAVE ENTRY ---------------- */
  const saveEntry = async () => {
    if (!vehicleNumber || !bayId) {
      alert("Vehicle number and Bay are required");
      return;
    }

    setLoading(true);

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/entries/manual`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          visitorName,
          visitorMobile: mobile,
          visitorCompany: company,
          vehicleNumber,
          vehicleType,
          bayId,
        }),
      }
    );

    setLoading(false);

    if (!res.ok) {
      alert("Failed to save entry");
      return;
    }

    alert("Manual entry saved");

    // reset
    setVisitorName("");
    setQid("");
    setMobile("");
    setCompany("");
    setVehicleNumber("");
    setVehicleType("");
    setDriverName("");
    setDriverMobile("");
    setPurpose("");
    setBayId("");
    setDuration("");
    setNotes("");
  };

  return (
    <div className="min-h-screen bg-[#f5f7fa] flex text-[13px] text-gray-700">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 space-y-6">
        {/* HEADER */}
        <div className="flex justify-between mb-5">
          <div>
            <h1 className="font-semibold text-2xl">Manual Entry Capture</h1>
            <p className="text-xs text-gray-500">
              Capture visitor and vehicle details manually when QR or OCR cannot be used.
              One-way entry capture only.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Site: Nexcore Alliance</span>
            <div className="w-8 h-8 rounded-full bg-gray-300" />
          </div>
        </div>

        <div className="grid grid-cols-12 gap-5">
          {/* LEFT PANEL */}
          <div className="col-span-12 lg:col-span-8 bg-white border rounded-xl p-5 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-xl">Manual Visitor & Vehicle Details</h3>
                <p className="text-xs text-gray-500">
                  This entry is linked to your staff ID and bay allocation.
                </p>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                Mode: Manual
              </span>
            </div>

            {/* VISITOR */}
            <section>
              <h4 className="font-medium text-sm">Visitor information</h4>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Visitor Name" value={visitorName} onChange={setVisitorName} />
                <Input label="QID" value={qid} onChange={setQid} />
                <Input label="Mobile Number" value={mobile} onChange={setMobile} />
                <Input label="Company / Tenant" value={company} onChange={setCompany} />
              </div>
            </section>

            {/* VEHICLE */}
            <section>
              <h4 className="font-medium text-sm">Vehicle information</h4>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Vehicle Number" value={vehicleNumber} onChange={setVehicleNumber} />
                <Select label="Vehicle Type" value={vehicleType} onChange={setVehicleType}
                  options={["Truck", "Van", "Car"]} />
                <Input label="Driver Name" value={driverName} onChange={setDriverName} />
                <Input label="Driver Mobile" value={driverMobile} onChange={setDriverMobile} />
              </div>
            </section>

            {/* VISIT */}
            <section>
              <h4 className="font-medium text-sm">Visit details</h4>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Purpose" value={purpose} onChange={setPurpose} />
                <div>
                  <label className="text-xs text-gray-500">Destination Bay</label>
                  <select
                    className="h-9 w-full border rounded px-3"
                    value={bayId}
                    onChange={(e) => setBayId(e.target.value)}
                  >
                    <option value="">Select Bay</option>
                    {bays.map((bay) => (
                      <option key={bay._id} value={bay._id}>
                        {bay.name}
                      </option>
                    ))}
                  </select>
                </div>
                <Input label="Expected Duration (mins)" value={duration} onChange={setDuration} />
                <Input label="Notes" value={notes} onChange={setNotes} />
              </div>
            </section>

            {/* ACTIONS */}
            <div className="flex justify-end gap-3">
              <button
                onClick={saveEntry}
                disabled={loading}
                className="px-4 py-2 text-xs rounded bg-green-600 text-white disabled:opacity-60"
              >
                {loading ? "Saving..." : "Save Entry"}
              </button>
            </div>
          </div>

          {/* RIGHT PANEL (UNCHANGED) */}
          <div className="col-span-12 lg:col-span-4 space-y-4">
            <Card title="Suggested Bay Allocation">
              <p><strong>Bay B</strong></p>
              <p>Status: Free</p>
              <p>Queue position: #2</p>
            </Card>

            <Card title="My recent manual entries">
              <p>15:10 – QAT 44129 – Bay B</p>
              <p>14:55 – QAT 99231 – Bay A</p>
              <p>14:18 – QAT 77331 – Bay C</p>
            </Card>

            <Card title="Manual entry tips">
              <p>• Confirm VRN and mobile verbally</p>
              <p>• Select correct bay</p>
              <p>• Keep notes short</p>
            </Card>

            <Card title="My performance today">
              <p>Manual entries: 8</p>
              <p>Avg processing time: 22s</p>
              <p>Manual vs auto: 30%</p>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

/* -------- SMALL COMPONENTS -------- */

function Input({ label, value, onChange }) {
  return (
    <div>
      <label className="text-xs text-gray-500">{label}</label>
      <input
        className="h-9 w-full border rounded px-3"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div>
      <label className="text-xs text-gray-500">{label}</label>
      <select
        className="h-9 w-full border rounded px-3"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Select</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="bg-white border rounded-xl p-4 text-xs">
      <h3 className="font-medium mb-2">{title}</h3>
      {children}
    </div>
  );
}
