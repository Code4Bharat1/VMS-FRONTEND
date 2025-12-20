"use client";

import { useState } from "react";

export default function MySettings() {
  const [form, setForm] = useState({
    name: "Rashid Ahmed",
    staffId: "SEC-0142",
    mobile: "+974 5551 2244",
    email: "rashid.ahmed@example.com",
    supervisor: "Hassan Ali",
  });

  const [entryNotify, setEntryNotify] = useState(true);
  const [shiftReminder, setShiftReminder] = useState(true);
  const [emailSummary, setEmailSummary] = useState(false);

  /* password state */
  const [editPassword, setEditPassword] = useState(false);
  const [password, setPassword] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    alert("Settings saved (API integration pending)");
  };

  const handleReset = () => {
    alert("Settings reset");
  };

  return (
    <div className="min-h-screen bg-[#f5f7fa] flex text-[13px] text-gray-700">

      {/* CONTENT */}
      <main className="flex-1 p-4 sm:p-6 space-y-6">
        {/* Header */}
        <div className="mb-4">
          <h1 className="font-semibold text-2xl">My Settings</h1>
          <p className="text-xs text-gray-500">
            Manage your personal profile, security, and notification preferences.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* LEFT */}
          <div className="lg:col-span-8 space-y-4">
            {/* Account */}
            <div className="bg-white border rounded-lg p-4">
              <h3 className="font-semibold text-xl">Account & profile</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <Input label="Full name" name="name" value={form.name} onChange={handleChange} />
                <Input label="Staff ID" name="staffId" value={form.staffId} disabled />
                <Input label="Mobile number" name="mobile" value={form.mobile} onChange={handleChange} />
                <Input label="Email" name="email" value={form.email} onChange={handleChange} />
                <Input label="Supervisor" name="supervisor" value={form.supervisor} disabled />
              </div>
            </div>

            {/* SECURITY (UPDATED) */}
            <div className="bg-white border rounded-lg p-4">
              <h3 className="font-medium text-sm mb-3">Sign-in & security</h3>

              <div className="space-y-3 max-w-sm">
                {/* Password row */}
                <div className="border rounded-md px-3 py-2">
                  {!editPassword ? (
                    <span className="tracking-widest text-gray-600 text-sm">
                      ********
                    </span>
                  ) : (
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full text-sm outline-none"
                      autoFocus
                    />
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  {!editPassword ? (
                    <button
                      onClick={() => setEditPassword(true)}
                      className="px-3 py-1.5 bg-green-600 text-white rounded text-xs"
                    >
                      Update password
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        alert("Password updated");
                        setEditPassword(false);
                        setPassword("");
                      }}
                      className="px-3 py-1.5 bg-green-600 text-white rounded text-xs"
                    >
                      Save password
                    </button>
                  )}

                  <button
                    onClick={() => alert("Logged out from all devices")}
                    className="px-3 py-1.5 border rounded text-xs"
                  >
                    Sign out from all devices
                  </button>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white border rounded-lg p-4">
              <h3 className="font-medium text-sm mb-3">Notifications</h3>

              <Toggle
                label="Entry notifications"
                desc="Notify when my entry is edited"
                checked={entryNotify}
                onChange={() => setEntryNotify(!entryNotify)}
              />

              <Toggle
                label="Shift reminders"
                desc="Reminder at start of shift"
                checked={shiftReminder}
                onChange={() => setShiftReminder(!shiftReminder)}
              />

              <Toggle
                label="Email summaries"
                desc="Daily email summary"
                checked={emailSummary}
                onChange={() => setEmailSummary(!emailSummary)}
              />

              <div className="flex gap-3 mt-4 flex-wrap">
                <button
                  onClick={handleSave}
                  className="px-4 py-1 bg-green-600 text-white rounded text-xs"
                >
                  Save changes
                </button>
                <button
                  onClick={handleReset}
                  className="px-4 py-1 border rounded text-xs"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="lg:col-span-4 space-y-4">
            <InfoBox title="Access level">
              <p>Role: <strong>Security Staff</strong></p>
              <p>Permissions: Entry capture, basic search</p>
              <p>Can edit entries: No</p>
            </InfoBox>

            <InfoBox title="Shift preferences">
              <p>Default bay: <strong>Bay B</strong></p>
              <div className="flex gap-2 flex-wrap mt-2">
                <Tag text="My entries first" />
                <Tag text="Hide exited" />
                <Tag text="Today only" />
              </div>
            </InfoBox>

            <InfoBox title="Help & support">
              <ul className="list-disc pl-4 space-y-1">
                <li>Contact Supervisor for corrections</li>
                <li>Contact Admin for login issues</li>
              </ul>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => alert("Supervisor notified")}
                  className="px-3 py-1 bg-green-600 text-white rounded text-xs"
                >
                  Contact Supervisor
                </button>
                <button
                  onClick={() => alert("Opening help")}
                  className="px-3 py-1 border rounded text-xs"
                >
                  Help
                </button>
              </div>
            </InfoBox>
          </div>
        </div>
      </main>
    </div>
  );
}

/* REUSABLE COMPONENTS */

const Input = ({ label, ...props }) => (
  <div>
    <label className="text-gray-500 text-xs">{label}</label>
    <input
      {...props}
      className="w-full mt-1 border rounded px-2 h-8 text-xs disabled:bg-gray-100"
    />
  </div>
);

const Toggle = ({ label, desc, checked, onChange }) => (
  <div className="flex justify-between items-center mb-3">
    <div>
      <p className="font-medium text-xs">{label}</p>
      <p className="text-[11px] text-gray-500">{desc}</p>
    </div>
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="accent-green-600"
    />
  </div>
);

const InfoBox = ({ title, children }) => (
  <div className="bg-white border rounded-lg p-4 text-xs">
    <h3 className="font-medium mb-2">{title}</h3>
    {children}
  </div>
);

const Tag = ({ text }) => (
  <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[11px]">
    {text}
  </span>
);
