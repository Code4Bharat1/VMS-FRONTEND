"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function ManualEntry() {
  const [visitorName, setVisitorName] = useState("");
  const [qidNumber, setQidNumber] = useState("");
  const [mobile, setMobile] = useState("");
  const [company, setCompany] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [purpose, setPurpose] = useState("");
  const [bayId, setBayId] = useState("");
  const [staff, setStaff] = useState(null);
  const [bays, setBays] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setStaff(JSON.parse(storedUser));
  }, []);

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("accessToken")
      : null;

  useEffect(() => {
    if (!token) return;
    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/bays`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setBays(res.data.bays || []));
  }, [token]);

  const saveEntry = async () => {
    if (!vehicleNumber) return alert("Vehicle number is required");
    if (!bayId) return alert("Please select a Bay");

    const user = JSON.parse(localStorage.getItem("user"));
    const staffId = user?.id;
    if (!staffId) return alert("Staff not logged in");

    try {
      setLoading(true);
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/entries/manual`,
        {
          visitorName,
          visitorMobile: mobile,
          visitorCompany: company,
          vehicleNumber: vehicleNumber.toUpperCase(),
          vehicleType,
          qidNumber,
          bayId,
          createdBy: staffId,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Manual entry saved");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f8fa]">
      {/* HEADER */}
      <div className="bg-white px-8 py-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[24px] font-semibold text-gray-900">
              Manual Entry
            </h1>
            <p className="text-[14px] text-gray-500 mt-1">
              Capture visitor and vehicle details manually
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white font-semibold">
              {(staff?.name || "")
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </div>
            <div>
              <p className="text-[18px] font-semibold text-gray-900">
                {staff?.name}
              </p>
              <p className="text-[14px] text-gray-500 capitalize">
                {staff?.role}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FORM CARD */}
      <div className="px-8 py-8">
        <div className="max-w-5xl bg-white rounded-xl p-8 shadow-sm border border-gray-100">
          <Section title="Visitor Information">
            <Input label="Visitor Name" value={visitorName} onChange={setVisitorName} />
            <Input label="QID" value={qidNumber} onChange={setQidNumber} />
            <Input label="Mobile Number" value={mobile} onChange={setMobile} />
            <Input label="Company / Tenant" value={company} onChange={setCompany} />
          </Section>

          <Section title="Vehicle Information">
            <Input label="Vehicle Number" value={vehicleNumber} onChange={setVehicleNumber} />
            <Select
              label="Vehicle Type"
              value={vehicleType}
              onChange={setVehicleType}
              options={["Truck", "Van", "Car"]}
            />
          </Section>

          <Section title="Visit Details" withDivider>
            <Input label="Purpose" value={purpose} onChange={setPurpose} />
            <div>
              <label className="text-xs text-gray-500">Destination Bay</label>
              <select
                className="
                  h-11 w-full rounded-xl px-4
                  bg-gray-50 border border-gray-200
                  focus:outline-none focus:ring-2 focus:ring-emerald-500
                "
                value={bayId}
                onChange={(e) => setBayId(e.target.value)}
              >
                <option value="">Select Bay</option>
                {bays.map((bay) => (
                  <option key={bay._id} value={bay._id}>
                    {bay.bayName}
                  </option>
                ))}
              </select>
            </div>
          </Section>

          {/* ACTION */}
          <div className="flex justify-end mt-10 pt-6 border-t border-gray-100">
            <button
              onClick={saveEntry}
              disabled={loading}
              className="
                px-8 py-2.5 rounded-xl
                bg-emerald-600 text-white text-sm font-medium
                transition-all duration-300
                hover:-translate-y-0.5 hover:shadow-lg
                disabled:opacity-60
              "
            >
              {loading ? "Saving..." : "Save Entry"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- UI HELPERS ---------------- */

function Section({ title, children, withDivider }) {
  return (
    <div className={`mb-8 ${withDivider ? "pt-8 border-t border-gray-100" : ""}`}>
      <h3 className="text-sm font-semibold text-gray-900 mb-4">
        {title}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {children}
      </div>
    </div>
  );
}

function Input({ label, value, onChange }) {
  return (
    <div>
      <label className="text-xs text-gray-500 mb-1 block">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          h-11 w-full rounded-xl px-4
          bg-gray-50 border border-gray-200
          focus:outline-none focus:ring-2 focus:ring-emerald-500
        "
      />
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div>
      <label className="text-xs text-gray-500 mb-1 block">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          h-11 w-full rounded-xl px-4
          bg-gray-50 border border-gray-200
          focus:outline-none focus:ring-2 focus:ring-emerald-500
        "
      >
        <option value="">Select</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}
