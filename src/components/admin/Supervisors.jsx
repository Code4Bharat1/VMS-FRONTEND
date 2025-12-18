"use client";

import { useEffect, useState } from "react";
import { Search, Plus, Filter, X } from "lucide-react";
import api from "@/lib/axios";

export default function Supervisors() {
  const [supervisors, setSupervisors] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");

  // ADD MODAL STATE
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    assignedBay: "",
  });

  /* ---------------- FETCH SUPERVISORS ---------------- */
  const fetchSupervisors = async () => {
    try {
      const res = await api.get("/supervisors");

      const mapped = (res.data.supervisors || []).map((u) => ({
        id: u._id,
        name: u.name,
        staffCount: 0,
        mobile: u.phone || "-",
        email: u.email,
        status: u.isActive ? "Active" : "Inactive",
      }));

      setSupervisors(mapped);
      setSelected(mapped[0] || null);
    } catch (err) {
      console.error("FETCH ERROR:", err);
    }
  };

  useEffect(() => {
    fetchSupervisors();
  }, []);

  /* ---------------- TOGGLE STATUS ---------------- */
  const toggleStatus = async (id) => {
    try {
      await api.patch(`/supervisors/${id}/status`);
      fetchSupervisors();
    } catch (err) {
      console.error(err);
    }
  };

  /* ---------------- CREATE SUPERVISOR ---------------- */
  const createSupervisor = async () => {
    try {
      await api.post("/supervisors", {
        ...form,
      });

      setShowAdd(false);
      setForm({
        name: "",
        email: "",
        phone: "",
        password: "",
        assignedBay: "",
      });

      fetchSupervisors();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add supervisor");
    }
  };

  const filtered = supervisors.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-50 text-[15px] text-gray-700">
      <div className="flex-1 overflow-auto">
        {/* HEADER */}

        {/* TOP BAR */}
        <div className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between sticky top-0 z-50">
          {/* LEFT */}
          <div>
            <h1 className="text-[22px] font-bold text-gray-900">
              Supervisor Management
            </h1>
            <p className="text-[14px] text-gray-500 mt-1">
              Manage security supervisors, assigned staff, performance and bay
              activities
            </p>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-4">
            {/* ADD BUTTON */}
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 px-5 py-2
  bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700"
            >
              <Plus size={16} />
              Add Supervisor
            </button>

            {/* USER */}
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-semibold text-gray-700">
                AT
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Alex Tan</p>
                <p className="text-xs text-gray-500">Operations Manager</p>
              </div>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="px-8 py-6">
          <div className="grid grid-cols-3 gap-6">
            {/* TABLE */}
            <div className="col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-3 top-2.5 text-gray-400"
                  />
                  <input
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm"
                    placeholder="Search supervisors by name"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {[
                      "Supervisor Name",
                      "Staff Assigned",
                      "Mobile Number",
                      "Email",
                      "Status",
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left px-6 py-4 text-sm font-semibold text-gray-600"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {filtered.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50 cursor-pointer">
                      <td className="px-6 py-4 font-semibold text-gray-800">
                        {s.name}
                      </td>
                      <td className="px-6 py-4 font-semibold">
                        {s.staffCount}
                      </td>
                      <td className="px-6 py-4">{s.mobile}</td>
                      <td className="px-6 py-4">{s.email}</td>
                      <td className="px-6 py-4">
                        <span
                          onClick={() => toggleStatus(s.id)}
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            s.status === "Active"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-sm text-gray-600">
                Showing {filtered.length} supervisors
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ADD SUPERVISOR MODAL */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[520px] rounded-2xl shadow-xl overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h2 className="text-[16px] font-semibold">Add Supervisor</h2>
              <X className="cursor-pointer" onClick={() => setShowAdd(false)} />
            </div>

            <div className="p-6 space-y-4 text-sm">
              <Input
                label="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <Input
                label="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <Input
                label="Phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
              <Input
                label="Assigned Bay"
                value={form.assignedBay}
                onChange={(e) =>
                  setForm({ ...form, assignedBay: e.target.value })
                }
              />
              <Input
                label="Password"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3">
              <button
                onClick={() => setShowAdd(false)}
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={createSupervisor}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg"
              >
                Create Supervisor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- UI HELPERS ---------------- */

function Input({ label, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-1">
        {label}
      </label>
      <input
        {...props}
        className="w-full px-3 py-2 border rounded-lg text-sm"
      />
    </div>
  );
}
