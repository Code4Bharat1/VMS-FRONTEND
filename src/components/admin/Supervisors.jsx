"use client";

import { useEffect, useState } from "react";
import { Search, Plus, X } from "lucide-react";
import api from "@/lib/axios";

export default function Supervisors() {
  const [supervisors, setSupervisors] = useState([]);
  const [search, setSearch] = useState("");
  const [bays, setBays] = useState([]);

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    assignedBay: "",
  });

  /* ---------------- FETCH ---------------- */
  const fetchSupervisors = async () => {
    const res = await api.get("/supervisors");
    console.log(res)
    setSupervisors(
      (res.data.supervisors || []).map((u) => ({
        id: u._id,
        name: u.name,
        staffCount: u.staffCount || 0,
        mobile: u.phone || "-",
        email: u.email,
        status: u.isActive ? "Active" : "Inactive",
        assignedBay: u.assignedBay || "-",
      }))
    );
  };

  const fetchBays = async () => {
    const res = await api.get("/bays");
    setBays(res.data.bays || res.data || []);
    console.log(res.data)
  };

  useEffect(() => {
    fetchSupervisors();
    fetchBays();
  }, []);

  const toggleStatus = async (id) => {
    await api.patch(`/supervisors/${id}/status`);
    fetchSupervisors();
  };

  const createSupervisor = async () => {
    await api.post("/supervisors", form);
    setShowAdd(false);
    setForm({
      name: "",
      email: "",
      phone: "",
      password: "",
      assignedBay: "",
    });
    fetchSupervisors();
  };

  const filtered = supervisors.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <div className="sticky top-0 z-40 bg-white shadow-sm px-4 sm:px-8 py-4 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Supervisor Management
          </h1>
          <p className="text-sm text-gray-500">
            Manage supervisors and assigned bays
          </p>
        </div>

        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700"
        >
          <Plus size={16} /> Add Supervisor
        </button>
      </div>

      {/* CONTENT */}
      <div className="p-4 sm:p-6">
        <div className="bg-white rounded-2xl shadow-md">
          {/* SEARCH */}
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
              <input
                className="w-full bg-gray-100 pl-9 pr-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Search supervisors"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* DESKTOP TABLE */}
          <div className="hidden md:block">
            <table className="w-full">
              <thead className="bg-gray-50/60">
                <tr>
                  {["Name", "Staff", "Mobile", "Email", "Bay", "Status"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-6 py-4 text-left text-sm font-semibold text-gray-600"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>

              <tbody>
                {filtered.map((s) => (
                  <tr
                    key={s.id}
                    className="hover:bg-emerald-50/40 transition"
                  >
                    <td className="px-6 py-4 font-semibold">{s.name}</td>
                    <td className="px-6 py-4">{s.staffCount}</td>
                    <td className="px-6 py-4">{s.mobile}</td>
                    <td className="px-6 py-4">{s.email}</td>
                    <td className="px-6 py-4">{s.assignedBay.bayName}</td>
                    <td className="px-6 py-4">
                      <span
                        onClick={() => toggleStatus(s.id)}
                        className={`cursor-pointer px-3 py-1 rounded-full text-xs font-medium ${
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
          </div>

          {/* MOBILE CARDS */}
          <div className="md:hidden space-y-3 p-4">
            {filtered.map((s) => (
              <div
                key={s.id}
                className="bg-gray-50 rounded-xl p-4 shadow-sm"
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-gray-900">{s.name}</h3>
                  <span
                    onClick={() => toggleStatus(s.id)}
                    className={`text-xs px-3 py-1 rounded-full ${
                      s.status === "Active"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {s.status}
                  </span>
                </div>

                <div className="mt-2 text-sm text-gray-600 space-y-1">
                  <p>📍 Bay: {s.assignedBay?.bayName}</p>
                  <p>👥 Staff: {s.staffCount}</p>
                  <p>📞 {s.mobile}</p>
                  <p>✉️ {s.email}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="px-4 py-3 text-sm text-gray-500 bg-gray-50 rounded-b-2xl">
            Showing {filtered.length} supervisors
          </div>
        </div>
      </div>

      {/* ADD MODAL */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl">
            <div className="flex justify-between items-center px-6 py-4 shadow-sm">
              <h2 className="font-semibold">Add Supervisor</h2>
              <X onClick={() => setShowAdd(false)} className="cursor-pointer" />
            </div>

            <div className="p-6 space-y-4">
              <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Input label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />

              <select
                className="w-full h-11 rounded-xl px-4 bg-gray-100 focus:ring-2 focus:ring-emerald-500"
                value={form.assignedBay}
                onChange={(e) => setForm({ ...form, assignedBay: e.target.value })}
              >
                <option value="">Select Bay</option>
                {bays.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.bayName}
                  </option>
                ))}
              </select>

              <Input label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>

            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm">
                Cancel
              </button>
              <button onClick={createSupervisor} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm">
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* INPUT */
function Input({ label, ...props }) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-600">{label}</label>
      <input
        {...props}
        className="w-full mt-1 px-3 py-2 rounded-xl bg-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />
    </div>
  );
}
