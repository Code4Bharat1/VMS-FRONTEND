"use client";

import { useEffect, useState } from "react";
import { Search, Plus, X } from "lucide-react";
import api from "@/lib/axios";

export default function Supervisors() {
  const [supervisors, setSupervisors] = useState([]);
  const [search, setSearch] = useState("");
  const [bays, setBays] = useState([]);
  const [editId, setEditId] = useState(null);

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    assignedBay: "",
  });

  /* ================= LOAD DATA ================= */
  const loadData = async () => {
    try {
      const [supRes, staffRes, bayRes] = await Promise.all([
        api.get("/supervisors"),
        api.get("/staff"),
        api.get("/bays"),
      ]);

      const supervisorsData = supRes.data.supervisors || [];
      const staffData = staffRes.data.staff || [];
      const baysData = bayRes.data.bays || bayRes.data || [];

      setBays(baysData);

      const mapped = supervisorsData.map((u) => {
        const supervisorBayId =
          typeof u.assignedBay === "object"
            ? u.assignedBay?._id
            : u.assignedBay;

        const staffCount = staffData.filter((s) => {
          const staffBayId =
            typeof s.assignedBay === "object"
              ? s.assignedBay?._id
              : s.assignedBay;

          return supervisorBayId && staffBayId === supervisorBayId;
        }).length;

        return {
          id: u._id,
          name: u.name,
          staffCount,
          mobile: u.phone || "-",
          email: u.email,
          status: u.isActive ? "Active" : "Inactive",
          assignedBay: u.assignedBay || null,
        };
      });

      setSupervisors(mapped);
    } catch (err) {
      console.error("Load supervisors error:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /* ================= ACTIONS ================= */
  const toggleStatus = async (id) => {
    try {
      await api.patch(`/supervisors/${id}/status`);
      loadData();
    } catch (err) {
      console.error("Toggle status error", err);
    }
  };

  const saveSupervisor = async () => {
    try {
      if (editId) {
        // UPDATE
        await api.put(`/supervisors/${editId}`, {
          name: form.name,
          email: form.email,
          phone: form.phone,
          assignedBay: form.assignedBay,
        });
      } else {
        // CREATE
        await api.post("/supervisors", form);
      }

      setShowAdd(false);
      setEditId(null);
      setForm({
        name: "",
        email: "",
        phone: "",
        password: "",
        assignedBay: "",
      });

      loadData();
    } catch (err) {
      console.error("Save supervisor error:", err);
    }
  };

  /* ================= FILTER ================= */
  const filtered = supervisors.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalSupervisors = supervisors.length;
const activeSupervisors = supervisors.filter(
  (s) => s.status === "Active"
).length;
const inactiveSupervisors = supervisors.filter(
  (s) => s.status === "Inactive"
).length;
const totalStaff = supervisors.reduce(
  (sum, s) => sum + s.staffCount,
  0
);

  /* ================= UI ================= */
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
          onClick={() => {
            setEditId(null);
            setShowAdd(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700"
        >
          <Plus size={16} /> Add Supervisor
        </button>
      </div>
{/* STATS CARDS */}
<div className="px-4 sm:px-8 mt-4 ">
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ">
    <StatCard title="Total Supervisors" value={totalSupervisors} />
    <StatCard title="Active Supervisors" value={activeSupervisors} />
    <StatCard title="Inactive Supervisors" value={inactiveSupervisors} />
    <StatCard title="Total Staff" value={totalStaff} />
  </div>
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

          {/* TABLE */}
          <div className="hidden md:block">
            <table className="w-full">
              <thead className="bg-green-100 border-b-2 border-gray-200">
                <tr>
                  {["Name", "Staff", "Mobile", "Email", "Bay", "Status", "Action"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-6 py-4 text-sm font-semibold text-center text-gray-600"
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
                    className="hover:bg-green-50 text-center border-b border-gray-200"
                  >
                    <td className="px-6 py-4 font-semibold">{s.name}</td>
                    <td className="px-6 py-4">{s.staffCount}</td>
                    <td className="px-6 py-4">{s.mobile}</td>
                    <td className="px-6 py-4">{s.email}</td>
                    <td className="px-6 py-4">
                      {s.assignedBay?.bayName || "-"}
                    </td>
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
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          setEditId(s.id);
                          setForm({
                            name: s.name,
                            email: s.email,
                            phone: s.mobile,
                            assignedBay: s.assignedBay?._id || "",
                            password: "",
                          });
                          setShowAdd(true);
                        }}
                        className="text-sm text-emerald-600 hover:underline"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-3 text-sm text-gray-500 bg-gray-50 rounded-b-2xl">
            Showing {filtered.length} supervisors
          </div>
        </div>
      </div>

      {/* MODAL */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl">
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h2 className="font-semibold">
                {editId ? "Edit Supervisor" : "Add Supervisor"}
              </h2>
              <X onClick={() => setShowAdd(false)} className="cursor-pointer" />
            </div>

            <div className="p-6 space-y-4">
              <Input label="Name" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} />

              <Input label="Email" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} />

              <Input label="Phone" value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })} />

              <select
                className="w-full h-11 rounded-xl px-4 bg-gray-100"
                value={form.assignedBay}
                onChange={(e) =>
                  setForm({ ...form, assignedBay: e.target.value })
                }
              >
                <option value="">Select Bay</option>
                {bays.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.bayName}
                  </option>
                ))}
              </select>

              {!editId && (
                <Input
                  label="Password"
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                />
              )}
            </div>

            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
              <button onClick={() => setShowAdd(false)}>Cancel</button>
              <button
                onClick={saveSupervisor}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm"
              >
                {editId ? "Update" : "Create"}
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
function StatCard({ title, value }) {
  return (
    <div
      className={"rounded-2xl p-5 text-green-900 shadow-md border border-green bg-teal-50 "}
    >
      <p className="text-sm opacity-90">{title}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
  );
}
