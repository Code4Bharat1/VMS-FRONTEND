"use client";

import { useEffect, useState } from "react";
import { Search, Plus, X } from "lucide-react";
import api from "@/lib/axios";

export default function Supervisors() {
  const [supervisors, setSupervisors] = useState([]);
  const [search, setSearch] = useState("");
  const [bays, setBays] = useState([]);
  const [editId, setEditId] = useState(null);
  const [errors, setErrors] = useState({});

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

  const validate = () => {
    const newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "Name is required";
    } else if (form.name.length < 3) {
      newErrors.name = "Name must be at least 3 characters";
    }

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Invalid email address";
    }

    if (!form.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[0-9]{10}$/.test(form.phone)) {
      newErrors.phone = "Phone must be 10 digits";
    }

    if (!form.assignedBay) {
      newErrors.assignedBay = "Please select a bay";
    }

    if (!editId) {
      if (!form.password) {
        newErrors.password = "Password is required";
      } else if (form.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
    if (!validate()) return;

    try {
      if (editId) {
        await api.put(`/supervisors/${editId}`, {
          name: form.name,
          email: form.email,
          phone: form.phone,
          assignedBay: form.assignedBay,
        });
      } else {
        await api.post("/supervisors", form);
      }

      setShowAdd(false);
      setEditId(null);
      setErrors({});
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
  const totalStaff = supervisors.reduce((sum, s) => sum + s.staffCount, 0);

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-teal-50">
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
              <Search
                className="absolute left-3 top-2.5 text-gray-400"
                size={16}
              />
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
                  {[
                    "Name",
                    "Staff",
                    "Mobile",
                    "Email",
                    "Bay",
                    "Status",
                    "Action",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-4 text-sm font-semibold text-center text-gray-600"
                    >
                      {h}
                    </th>
                  ))}
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
          {/* ================= MOBILE VIEW ================= */}
          <div className="md:hidden space-y-4 px-4 pb-4">
            {filtered.map((s) => (
              <div
                key={s.id}
                className="bg-white rounded-2xl shadow p-4 space-y-2"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-900">{s.name}</p>
                    <p className="text-xs text-gray-500">{s.email}</p>
                  </div>

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
                </div>

                <div className="text-sm text-gray-700">
                  <p>
                    <span className="font-medium">Mobile:</span> {s.mobile}
                  </p>
                  <p>
                    <span className="font-medium">Bay:</span>{" "}
                    {s.assignedBay?.bayName || "-"}
                  </p>
                  <p>
                    <span className="font-medium">Staff Count:</span>{" "}
                    {s.staffCount}
                  </p>
                </div>

                <div className="pt-2">
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
                    className="text-sm text-emerald-600 font-medium"
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <p className="text-center text-sm text-gray-400">
                No supervisors found
              </p>
            )}
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
              <Input
                label="Name"
                value={form.name}
                error={errors.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <Input
                label="Email"
                value={form.email}
                error={errors.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <Input
                label="Phone"
                value={form.phone}
                error={errors.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />

              <select
                className={`w-full h-11 rounded-xl px-4 bg-gray-100
    ${errors.assignedBay ? "ring-2 ring-red-500" : ""}`}
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
              {errors.assignedBay && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.assignedBay}
                </p>
              )}
              {!editId && (
                <Input
                  label="Password"
                  type="password"
                  value={form.password}
                  error={errors.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                />
              )}
            </div>

            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => {
                  setForm({
                    name: "",
                    email: "",
                    phone: "",
                    password: "",
                    assignedBay: "",
                  });
                  setErrors({});
                  setEditId(null);
                  setShowAdd(false);
                }}
              >
                Cancel
              </button>
              <button
                onClick={saveSupervisor}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm disabled:opacity-50"
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
function Input({ label, error, ...props }) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-600">{label}</label>
      <input
        {...props}
        className={`w-full mt-1 px-3 py-2 rounded-xl bg-gray-100 text-sm
          focus:outline-none focus:ring-2
          ${error ? "ring-red-500" : "focus:ring-emerald-500"}`}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div
      className={
        "rounded-2xl p-5 text-green-900 shadow-md border border-green bg-teal-50 "
      }
    >
      <p className="text-sm opacity-90">{title}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
  );
}
