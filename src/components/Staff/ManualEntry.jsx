"use client";

import { useEffect, useState } from "react";
import axios from "axios";
export default function ManualEntry() {
  const [visitorName, setVisitorName] = useState("");
  const [qidNumber, setQidNumber]= useState("");
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

    if (storedUser) {
      setStaff(JSON.parse(storedUser));
    }
  }, []);
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("accessToken")
      : null;


  const staffId =
    typeof window !== "undefined" ? localStorage.getItem("userId") : null;
  /* ---------------- FETCH BAYS ---------------- */
  useEffect(() => {
    if (!token) {
      console.log("❌ Token missing");
      return;
    }

    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/bays`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        console.log("✅ Bays API response:", res.data);
        setBays(res.data.bays || []);
      })
      .catch((err) => {
        console.error("❌ Failed to load bays:", err);
        alert("Failed to load bays");
      });
  }, [token]);

  /* ---------------- SAVE ENTRY ---------------- */
  const saveEntry = async () => {
    console.log("vehicleNumber:", vehicleNumber);
    console.log("bayId:", bayId);

    if (!vehicleNumber) {
      alert("Vehicle number is required");
      return;
    }

    if (!bayId) {
      alert("Please select a Bay");
      return;
    }

    const user = JSON.parse(localStorage.getItem("user"));
    const staffId = user?.id;

    if (!staffId) {
      alert("Staff not logged in");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
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
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      alert("Manual entry saved successfully");

      setVisitorName("");
      setMobile("");
      setCompany("");
      setVehicleNumber("");
      setVehicleType("");
      setBayId("");
      setQidNumber("");
    } catch (err) {
      console.error(err);
      alert("Failed to save entry");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">

      <main className="flex-1 w">
        {/* HEADER */}
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">My Bays</h1>
              <p className="text-gray-500 mt-1">Monitor live bay status, traffic, and alerts for the bays assigned to you.</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-semibold">
                {(staff?.name || '')
                  .split(' ')
                  .map(n => n[0])
                  .join('')
                  .toUpperCase()}
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-gray-800">
                  {staff?.name || 'staff'}
                </h2>

                <p className="text-gray-500 text-sm">
                  {staff?.role || 'staff'}

                </p>
              </div>


            </div>
          </div>
        </div>
        <div className="grid grid-cols-12 gap-5">
          {/* LEFT PANEL */}
          <div className="col-span-12 lg:col-span-8 bg-white border-white bg-teal-500 rounded-xl p-5 space-y-6">
            <div className="flex items-center justify-between ">
              <div>
                <h3 className="font-semibold text-xl">Manual Visitor & Vehicle Details</h3>
                <p className="text-xs text-gray-500">
                  This entry is linked to your staff ID and bay allocation.
                </p>
              </div>

            </div>

            {/* VISITOR */}
            <section>
              <h4 className="font-medium text-sm">Visitor information</h4>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Visitor Name" value={visitorName} onChange={setVisitorName} />
                <Input label="QID" value={qidNumber} onChange={setQidNumber} />
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
                        {bay.bayName}
                      </option>
                    ))}
                  </select>

                </div>
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
