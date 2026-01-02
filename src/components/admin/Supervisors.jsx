"use client";

import { useEffect, useState } from "react";
import { Search, Plus, X, Pencil, Trash2 } from "lucide-react";
import api from "@/lib/axios";

export default function Supervisors() {
  const [supervisors, setSupervisors] = useState([]);
  const [staff, setStaff] = useState([]);
  const [search, setSearch] = useState("");
  const [bays, setBays] = useState([]);
  const [editId, setEditId] = useState(null);
  const [errors, setErrors] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [selected, setSelected] = useState(null);
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

    if (!form.name.trim()) newErrors.name = "Name is required";
    else if (form.name.length < 3)
      newErrors.name = "Name must be at least 3 characters";

    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = "Invalid email address";

    if (!form.phone.trim()) newErrors.phone = "Phone number is required";
    else if (!/^[0-9]{10}$/.test(form.phone))
      newErrors.phone = "Phone must be 10 digits";

    if (!form.assignedBay) newErrors.assignedBay = "Please select a bay";

    if (!editId) {
      if (!form.password) newErrors.password = "Password is required";
      else if (form.password.length < 6)
        newErrors.password = "Password must be at least 6 characters";
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
      const message = err.response?.data?.message || "Something went wrong";

      alert(message); // or toast if you use one
      console.error("Save supervisor error:", err);
    }
  };

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
  const uniqueBayStaffMap = {};

supervisors.forEach((s) => {
  const bayId =
    typeof s.assignedBay === "object"
      ? s.assignedBay?._id
      : s.assignedBay;

  // take staff count only once per bay
  if (bayId && !uniqueBayStaffMap[bayId]) {
    uniqueBayStaffMap[bayId] = s.staffCount;
  }
});

const totalStaff = Object.values(uniqueBayStaffMap).reduce(
  (sum, count) => sum + count,
  0
);


  const deleteSupervisor = async () => {
    if (!selected) return;
    try {
      await api.delete(`/supervisors/${selected.id}`);
      setConfirmDelete(false);
      setSelected(null);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
      console.error("Delete supervisor error:", err);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-emerald-50/60">
      {/* HEADER */}
      <div className="sticky top-0 z-40 bg-white border-b border-emerald-100 px-4 sm:px-8 py-4 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-emerald-800">
            Supervisor Management
          </h1>
          <p className="text-sm text-emerald-600">
            Manage supervisors and assigned bays
          </p>
        </div>

        <button
          onClick={() => {
            setEditId(null);
            setShowAdd(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition"
        >
          <Plus size={16} /> Add Supervisor
        </button>
      </div>

      {/* STATS */}
      <div className="px-4 sm:px-8 mt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Supervisors" value={totalSupervisors} />
          <StatCard title="Active Supervisors" value={activeSupervisors} />
          <StatCard title="Inactive Supervisors" value={inactiveSupervisors} />
          <StatCard title="Total Staff" value={totalStaff} />
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-4 sm:p-6">
        <div className="bg-white rounded-xl border border-emerald-100 shadow-sm">
          {/* SEARCH */}
          <div className="p-4">
            <div className="relative">
              <Search
                className="absolute left-3 top-2.5 text-emerald-400"
                size={16}
              />
              <input
                className="w-full bg-white border border-emerald-200 pl-9 pr-3 py-2 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Search supervisors"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* TABLE */}
          <div className="hidden md:block">
            <table className="w-full">
              <thead className="bg-emerald-100">
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
                      className="px-6 py-4 text-sm font-semibold text-emerald-700 text-center"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-emerald-100">
                {filtered.map((s) => (
                  <tr
                    key={s.id}
                    className="hover:bg-emerald-50 text-center transition"
                  >
                    <td className="px-6 py-4 font-medium text-emerald-800">
                      {s.name}
                    </td>
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
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-4">
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
                          className="text-emerald-600 hover:scale-110 transition cursor-pointer"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => {
                            setSelected(s);
                            setShowAdd(false);
                            setConfirmDelete(true);
                          }}
                          className="text-red-600 hover:scale-110 transition cursor-pointer"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
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
                className="bg-white rounded-xs shadow p-4 space-y-2"
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
                <div className="flex justify-end gap-4 pt-2">
                  <Pencil
                    className="text-emerald-600 cursor-pointer"
                    size={18}
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
                  />

                  <Trash2
                    className="text-red-600 cursor-pointer"
                    size={18}
                    onClick={() => {
                      setSelected(s);
                      setConfirmDelete(true);
                    }}
                  />
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="text-center text-sm text-gray-400">
                No supervisors found
              </p>
            )}
          </div>

          <div className="px-4 py-3 text-sm text-emerald-600 bg-emerald-50 rounded-b-xl">
            Showing {filtered.length} supervisors
          </div>
        </div>
      </div>

      {/* MODAL */}
      {showAdd && (
        <Modal
          editId={editId}
          form={form}
          setForm={setForm}
          errors={errors}
          bays={bays}
          onClose={() => setShowAdd(false)}
          onSubmit={saveSupervisor}
        />
      )}

      {confirmDelete && (
        <ConfirmDelete
          onCancel={() => setConfirmDelete(false)}
          onDelete={deleteSupervisor}
        />
      )}
    </div>
  );
}

/* ================= COMPONENTS ================= */

function StatCard({ title, value }) {
  return (
    <div className="bg-white border border-emerald-100 rounded-xl shadow-sm p-5">
      <p className="text-sm text-emerald-600">{title}</p>
      <p className="text-3xl font-bold text-emerald-800 mt-1">{value}</p>
    </div>
  );
}

function Modal({ editId, form, setForm, errors, bays, onClose, onSubmit }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-md rounded-xl shadow-xl">
        <div className="flex justify-between items-center px-6 py-4 border-b border-emerald-100">
          <h2 className="font-semibold text-emerald-800">
            {editId ? "Edit Supervisor" : "Add Supervisor"}
          </h2>
          <X
            onClick={() => {
              setForm({
                name: "",
                email: "",
                phone: "",
                password: "",
                assignedBay: "",
              });
              onClose();
            }}
            className="cursor-pointer text-emerald-600"
          />
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
            className={`w-full h-11 rounded-lg px-4 bg-white border border-emerald-200
              ${
                errors.assignedBay
                  ? "ring-2 ring-red-500"
                  : "focus:ring-emerald-500"
              }`}
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
          {errors.assignedBay && (
            <p className="text-xs text-red-500 mt-1">{errors.assignedBay}</p>
          )}
          {!editId && (
            <Input
              label="Password"
              type="password"
              value={form.password}
              error={errors.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          )}
        </div>

        <div className="px-6 py-4 border-t border-emerald-100 flex justify-end gap-3">
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
          ></button>
          <button
            onClick={() => {
              setForm({
                name: "",
                email: "",
                phone: "",
                password: "",
                assignedBay: "",
              });
              onClose();
            }}
            className="text-emerald-600"
          >
            Cancel
          </button>

          <button
            onClick={onSubmit}
            className="px-4 cursor-pointer py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition"
          >
            {editId ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Input({ label, error, ...props }) {
  return (
    <div>
      <label className="text-sm font-medium text-emerald-700">{label}</label>
      <input
        {...props}
        className={`w-full mt-1 px-3 py-2 rounded-lg border border-emerald-200
          focus:outline-none focus:ring-2
          ${error ? "ring-red-500" : "focus:ring-emerald-500"}`}
      />
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}

const ConfirmDelete = ({ onCancel, onDelete }) => (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl p-6 w-80">
      <h3 className="font-semibold text-emerald-800 mb-2">
        Delete Supervisor?
      </h3>
      <p className="text-sm text-emerald-600 mb-4">
        This action cannot be undone.
      </p>
      <div className="flex justify-end gap-3">
        <button onClick={onCancel} className="text-emerald-600">
          Cancel
        </button>
        <button
          onClick={onDelete}
          className="bg-red-600 cursor-pointer hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
);
