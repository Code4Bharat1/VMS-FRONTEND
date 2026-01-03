"use client";
import toast from "react-hot-toast";

import * as yup from "yup";
import { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Filter,
  Users,
  Activity,
  X,
  Pencil,
  Trash2,
} from "lucide-react";

import axios from "axios";

export default function StaffManagement() {
  const [staff, setStaff] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [bays, setBays] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [nameFilter, setNameFilter] = useState("all");
  const [editId, setEditId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [showAdd, setShowAdd] = useState(false);
  const [showMobilePopup, setShowMobilePopup] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    assignedBay: "",
    password: "",
  });
  const [errors, setErrors] = useState({});

  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  /* ================= YUP VALIDATION ================= */
  const staffSchema = yup.object().shape({
    name: yup
      .string()
      .matches(/^[A-Za-z ]+$/, "Only alphabets are allowed")
      .required("Name is required"),

    email: yup
      .string()
      .email("Invalid email format")
      .required("Email is required"),

    phone: yup
      .string()
      .matches(/^[0-9]{10}$/, "Phone must be exactly 10 digits")
      .required("Phone is required"),

    assignedBay: yup.string().required("Assigned bay is required"),

    password: editId
      ? yup.string()
      : yup
          .string()
          .min(6, "Password must be at least 6 characters")
          .required("Password is required"),
  });

  /* ================= FETCH ================= */
  useEffect(() => {
    fetchStaff();
    fetchBays();
  }, []);

  const fetchStaff = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/staff`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setStaff(res.data.staff || []);
      setSelected(res.data.staff?.[0] || null);
    } catch (err) {
      console.error("Fetch staff error:", err);
    }
  };

  const fetchBays = async () => {
    const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/bays`);
    setBays(res.data.bays || res.data || []);
  };

  /* ================= BAY NAME RESOLVER (FIX) ================= */
  const getBayName = (bay) => {
    if (!bay) return "-";
    if (typeof bay === "object") return bay.bayName || "-";
    const found = bays.find((b) => b._id === bay);
    return found ? found.bayName : "-";
  };

  const validateForm = async () => {
    try {
      await staffSchema.validate(form, { abortEarly: false });
      setErrors({});
      return true;
    } catch (err) {
      const newErrors = {};
      err.inner.forEach((e) => {
        newErrors[e.path] = e.message;
      });
      setErrors(newErrors);
      return false;
    }
  };

  /* ================= ADD STAFF ================= */
  const saveStaff = async () => {
    const isValid = await validateForm();
    if (!isValid) return;

    try {
      if (editId) {
        await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL}/staff/${editId}`,
          {
            name: form.name,
            email: form.email,
            phone: form.phone,
            assignedBay: form.assignedBay,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        toast.success("Staff updated successfully");
      } else {
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/staff`,
          form,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // 👇 backend already sends different messages for admin/supervisor
        toast.success(res.data.message);
      }

      setShowAdd(false);
      setEditId(null);
      setErrors({});
      setForm({
        name: "",
        email: "",
        phone: "",
        assignedBay: "",
        password: "",
      });

      fetchStaff();
    } catch (err) {
      const message = err.response?.data?.message || "Failed to save staff";
      toast.error(message); // ❌ Email already exists, etc.
    }
  };

  const toggleStaffStatus = async (id) => {
    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/staff/${id}/status`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchStaff();
    } catch (err) {
      console.error("Toggle staff status error:", err);
    }
  };

  const deleteStaff = async () => {
    if (!selected) return;

    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/staff/${selected._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setConfirmDelete(false);
      setSelected(null);
      fetchStaff();
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
      console.error("Delete staff error:", err);
    }
  };

  /* ================= FILTER ================= */
  const filtered = staff.filter((s) => {
    const matchesSearch = s.name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && s.isActive) ||
      (statusFilter === "inactive" && !s.isActive);
    const matchesName = nameFilter === "all" || s.name === nameFilter;
    return matchesSearch && matchesStatus && matchesName;
  });

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-emerald-50/60">
      {/* HEADER */}
      <div className="sticky top-0 z-40 bg-white border-b border-emerald-100 shadow-sm px-4 sm:px-8 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-emerald-800">
              Staff Management
            </h1>
            <p className="text-sm text-emerald-600 mt-1">
              Manage security staff and supervisors
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-auto">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400"
              />
              <input
                placeholder="Search staff"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 h-10 w-full sm:w-64 rounded-lg
                           border border-emerald-200 text-sm
                           focus:outline-none focus:ring-2
                           focus:ring-emerald-500"
              />
            </div>

            <button
              onClick={() => setShowFilters((p) => !p)}
              className="flex items-center gap-2 px-4 h-10
                         rounded-lg border border-emerald-200 bg-white text-sm hover:bg-emerald-50 transition"
            >
              <Filter size={16} />
              Filters
            </button>

            <button
              onClick={() => {
                setEditId(null);
                setErrors({});
                setForm({
                  name: "",
                  email: "",
                  phone: "",
                  assignedBay: "",
                  password: "",
                });
                setShowAdd(true);
              }}
              className="flex items-center gap-2 px-4 h-10
             rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition"
            >
              <Plus size={16} />
              Add Staff
            </button>
          </div>
        </div>
      </div>

      {/* FILTER PANEL */}
      {showFilters && (
        <div className="bg-white border-b border-emerald-100 px-4 sm:px-8 py-4 flex flex-col sm:flex-row gap-4 text-sm">
          <div>
            <label className="block text-emerald-700 font-medium mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-emerald-200 rounded-lg px-3 py-2 w-full sm:w-40 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div>
            <label className="block text-emerald-700 font-medium mb-1">
              Staff Name
            </label>
            <select
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              className="border border-emerald-200 rounded-lg px-3 py-2 w-full sm:w-48 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All</option>
              {staff.map((s) => (
                <option key={s._id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* CONTENT */}
      <div className="px-4 sm:px-8 py-6">
        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <Stat title="Total Staff" value={staff.length} icon={Users} />
          <Stat
            title="Active Staff"
            value={staff.filter((s) => s.isActive).length}
            icon={Activity}
          />
          <Stat
            title="Assigned Bays"
            value={
              new Set(
                staff.map((s) => getBayName(s.assignedBay)).filter(Boolean)
              ).size
            }
            icon={Users}
          />
        </div>

        {/* TABLE */}
        <div className="hidden md:block bg-white rounded-xl border border-emerald-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-emerald-100">
              <tr>
                {["Name", "Email", "Phone", "Bay", "Status", "Action"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-6 py-4 text-sm font-semibold text-center text-emerald-700"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-emerald-100">
              {filtered.map((s) => (
                <tr
                  key={s._id}
                  onClick={() => {
                    setSelected(s);
                    setShowMobilePopup(true);
                  }}
                  className="hover:bg-emerald-50 cursor-pointer text-center transition"
                >
                  <td className="px-6 py-4 font-medium text-emerald-800">
                    {s.name}
                  </td>
                  <td className="px-6 py-4">{s.email}</td>
                  <td className="px-6 py-4">{s.phone}</td>
                  <td className="px-6 py-4">{getBayName(s.assignedBay)}</td>
                  <td className="px-6 py-4">
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStaffStatus(s._id);
                      }}
                      className={`cursor-pointer px-3 py-1 rounded-full text-xs font-medium ${
                        s.isActive
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {s.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-4">
                      <Pencil
                        size={18}
                        className="text-emerald-600 hover:scale-110 cursor-pointer transition"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditId(s._id);
                          setForm({
                            name: s.name,
                            email: s.email,
                            phone: s.phone,
                            assignedBay:
                              typeof s.assignedBay === "object"
                                ? s.assignedBay?._id
                                : s.assignedBay || "",
                            password: "",
                          });
                          setShowAdd(true);
                        }}
                      />

                      <Trash2
                        size={18}
                        className="text-red-600 hover:scale-110 cursor-pointer transition"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelected(s);
                          setConfirmDelete(true);
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="px-4 py-3 text-sm text-emerald-600 bg-emerald-50">
            Showing {filtered.length} staff members
          </div>
        </div>

        {/* MOBILE STAFF LIST */}
        <div className="md:hidden space-y-4">
          {filtered.map((s) => (
            <div
              key={s._id}
              className="bg-white rounded-lg border border-emerald-100 shadow-sm p-4 space-y-3"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-emerald-800">{s.name}</p>
                  <p className="text-xs text-emerald-600">{s.email}</p>
                </div>

                <span
                  onClick={() => toggleStaffStatus(s._id)}
                  className={`cursor-pointer px-3 py-1 rounded-full text-xs font-medium ${
                    s.isActive
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {s.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="text-sm text-gray-700 space-y-1">
                <p>
                  <span className="font-medium">Phone:</span> {s.phone}
                </p>
                <p>
                  <span className="font-medium">Bay:</span>{" "}
                  {getBayName(s.assignedBay)}
                </p>
              </div>

              <div className="flex justify-end gap-4 pt-2">
                <Pencil
                  size={18}
                  className="text-emerald-600 cursor-pointer"
                  onClick={() => {
                    setEditId(s._id);
                    setForm({
                      name: s.name,
                      email: s.email,
                      phone: s.phone,
                      assignedBay:
                        typeof s.assignedBay === "object"
                          ? s.assignedBay?._id
                          : s.assignedBay || "",
                      password: "",
                    });
                    setShowAdd(true);
                  }}
                />

                <Trash2
                  size={18}
                  className="text-red-600 cursor-pointer"
                  onClick={() => {
                    setSelected(s);
                    setConfirmDelete(true);
                  }}
                />
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <p className="text-center text-sm text-gray-400">No staff found</p>
          )}
        </div>
      </div>

      {/* MOBILE DETAILS POPUP */}
      {showMobilePopup && selected && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center md:hidden p-4"
          onClick={() => setShowMobilePopup(false)}
        >
          <div
            className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowMobilePopup(false)}
              className="absolute top-3 right-3 text-emerald-600 hover:bg-emerald-50 p-1 rounded-lg"
            >
              <X size={20} />
            </button>
            <StaffDetails selected={selected} getBayName={getBayName} />
          </div>
        </div>
      )}

      {/* ADD STAFF MODAL */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-xl overflow-hidden">
            <div className="flex justify-between px-6 py-4 border-b border-emerald-100">
              <h2 className="font-semibold text-emerald-800">
                {editId ? "Edit Staff" : "Add New Staff"}
              </h2>
              <X
                onClick={() => {
                  setForm({
                    name: "",
                    email: "",
                    phone: "",
                    assignedBay: "",
                    password: "",
                  });
                  setErrors({});
                  setEditId(null);
                  setShowAdd(false);
                }}
                className="cursor-pointer text-emerald-600 hover:bg-emerald-50 p-1 rounded-lg transition"
              />
            </div>

            <div className="px-6 py-5 space-y-4 text-sm">
              <Field
                label="Full Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                error={errors.name}
              />

              <Field
                label="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                error={errors.email}
              />
              <Field
                label="Phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                error={errors.phone}
              />
              {!editId && (
                <Field
                  type="password"
                  label="Password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  error={errors.password}
                />
              )}

              <div>
                <label className="block mb-1 font-medium text-emerald-700">
                  Assigned Bay
                </label>
                <select
                  value={form.assignedBay}
                  onChange={(e) =>
                    setForm({ ...form, assignedBay: e.target.value })
                  }
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
                    errors.assignedBay
                      ? "border-red-500 focus:ring-red-500"
                      : "border-emerald-200 focus:ring-emerald-500"
                  }`}
                >
                  <option value="">Select Bay</option>
                  {bays.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.bayName}
                    </option>
                  ))}
                </select>
                {errors.assignedBay && (
                  <p className="text-red-600 text-xs mt-1">
                    {errors.assignedBay}
                  </p>
                )}
              </div>
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
                className="text-emerald-600 hover:bg-emerald-50 px-4 py-2 rounded-lg transition"
              >
                Cancel
              </button>

              <button
                onClick={saveStaff}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition"
              >
                {editId ? "Update Staff" : "Add Staff"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE */}
      {confirmDelete && (
        <ConfirmDelete
          onCancel={() => setConfirmDelete(false)}
          onDelete={deleteStaff}
        />
      )}
    </div>
  );
}

/* ================= SMALL COMPONENTS ================= */

const StaffDetails = ({ selected, getBayName }) => (
  <div className="space-y-5 text-sm">
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold text-emerald-800">
        {selected.name}
      </h3>

      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${
          selected.isActive
            ? "bg-emerald-100 text-emerald-700"
            : "bg-red-100 text-red-600"
        }`}
      >
        {selected.isActive ? "Active" : "Inactive"}
      </span>
    </div>

    <div className="h-px bg-emerald-200" />

    <div className="space-y-3">
      <Detail label="Email" value={selected.email} />
      <Detail label="Phone" value={selected.phone} />
      <Detail label="Assigned Bay" value={getBayName(selected.assignedBay)} />
      <Detail label="Role" value={selected.role} />
    </div>
  </div>
);

const Stat = ({ title, value, icon: Icon }) => (
  <div className="bg-white border border-emerald-100 rounded-xl shadow-sm p-4 sm:p-6">
    <div className="flex justify-between mb-2">
      <p className="text-sm text-emerald-600">{title}</p>
      <Icon size={20} className="text-emerald-600" />
    </div>
    <p className="text-3xl font-bold text-emerald-800">{value}</p>
  </div>
);

const Detail = ({ label, value }) => (
  <div>
    <p className="text-emerald-600 text-xs">{label}</p>
    <p className="font-medium text-emerald-800">{value}</p>
  </div>
);

const Field = ({ label, error, ...props }) => (
  <div>
    <label className="block mb-1 font-medium text-emerald-700">{label}</label>
    <input
      {...props}
      className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
        error
          ? "border-red-500 focus:ring-red-500"
          : "border-emerald-200 focus:ring-emerald-500"
      }`}
    />
    {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
  </div>
);

const ConfirmDelete = ({ onCancel, onDelete }) => (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
      <h3 className="font-semibold text-emerald-800 mb-2">
        Delete Staff Member?
      </h3>
      <p className="text-sm text-emerald-600 mb-4">
        This action cannot be undone.
      </p>
      <div className="flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="text-emerald-600 hover:bg-emerald-50 px-4 py-2 rounded-lg transition"
        >
          Cancel
        </button>
        <button
          onClick={onDelete}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition cursor-pointer"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
);
