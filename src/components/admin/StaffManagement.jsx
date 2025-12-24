"use client";

import { useEffect, useState } from "react";
import { Search, Plus, Filter, Users, Activity, X } from "lucide-react";
import axios from "axios";

export default function StaffManagement() {
  const [staff, setStaff] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [bays, setBays] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [nameFilter, setNameFilter] = useState("all");

  const [showAdd, setShowAdd] = useState(false);
  const [showMobilePopup, setShowMobilePopup] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    assignedBay: "",
    password: "",
  });

  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

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

    // populated object
    if (typeof bay === "object") return bay.bayName || "-";

    // string ID
    const found = bays.find((b) => b._id === bay);
    return found ? found.bayName : "-";
  };

  /* ================= ADD STAFF ================= */
  const submitStaff = async () => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/staff`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setShowAdd(false);
      setForm({
        name: "",
        email: "",
        phone: "",
        assignedBay: "",
        password: "",
      });

      fetchStaff();
    } catch (err) {
      console.error("Add staff error:", err);
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
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex-1 overflow-auto">
        {/* HEADER */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-8 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-[18px] sm:text-[22px] font-semibold text-gray-800">
                Staff Management
              </h1>
              <p className="text-[13px] sm:text-[14px] text-gray-500 mt-1">
                Manage security staff and supervisors
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-full sm:w-auto">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  placeholder="Search staff"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 pr-4 h-[40px] w-full sm:w-64 rounded-lg
                             border border-gray-300 text-[14px]
                             focus:outline-none focus:ring-2
                             focus:ring-emerald-500"
                />
              </div>

              <button
                onClick={() => setShowFilters((p) => !p)}
                className="flex items-center gap-2 px-4 h-[40px]
                           rounded-lg border border-gray-300 bg-white text-[14px]"
              >
                <Filter size={16} />
                Filters
              </button>

              <button
                onClick={() => setShowAdd(true)}
                className="flex items-center gap-2 px-4 h-[40px]
                           rounded-lg bg-emerald-600 text-white text-[14px]"
              >
                <Plus size={16} />
                Add Staff
              </button>
            </div>
          </div>
        </div>

        {/* FILTER PANEL */}
        {showFilters && (
          <div className="bg-white border-b border-gray-200 px-4 sm:px-8 py-4 flex flex-col sm:flex-row gap-4 text-[14px]">
            <div>
              <label className="block text-gray-500 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 w-full sm:w-40"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-500 mb-1">Staff Name</label>
              <select
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 w-full sm:w-48"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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

          {/* TABLE + DETAILS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm overflow-x-auto">
              <table className="min-w-[720px] w-full">
                <thead className="bg-green-100 border-b-2 border-gray-200">
                  <tr>
                    {["Name", "Email", "Phone", "Bay", "Status"].map((h) => (
                      <th
                        key={h}
                        className="px-6 py-4 text-[14px] font-medium text-center text-gray-600"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {filtered.map((s) => (
                    <tr
                      key={s._id}
                      onClick={() => {
                        setSelected(s);
                        setShowMobilePopup(true);
                      }}
                      className="hover:bg-green-50 cursor-pointer text-center"
                    >
                      <td className="px-6 py-4 font-medium">{s.name}</td>
                      <td className="px-6 py-4">{s.email}</td>
                      <td className="px-6 py-4">{s.phone}</td>
                      <td className="px-6 py-4">{getBayName(s.assignedBay)}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-[13px] ${
                            s.isActive
                              ? "bg-green-50 text-green-700"
                              : "bg-gray-100"
                          }`}
                        >
                          {s.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* DESKTOP DETAILS */}
            <div className="hidden lg:block bg-white rounded-2xl shadow-sm p-6">
              {!selected ? (
                <p className="text-gray-400 text-center">
                  Select a staff member to view details
                </p>
              ) : (
                <StaffDetails selected={selected} getBayName={getBayName} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE DETAILS POPUP */}
      {showMobilePopup && selected && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center lg:hidden"
          onClick={() => setShowMobilePopup(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-sm p-6 w-[92%] max-w-sm relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowMobilePopup(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700"
            >
              ✕
            </button>
            <StaffDetails selected={selected} getBayName={getBayName} />
          </div>
        </div>
      )}

      {/* ADD STAFF MODAL (UNCHANGED) */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden">
            <div className="flex justify-between px-6 py-4 border-b">
              <h2 className="font-semibold">Add New Staff</h2>
              <X onClick={() => setShowAdd(false)} className="cursor-pointer" />
            </div>

            <div className="px-6 py-5 space-y-4 text-sm">
              <Field
                label="Full Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <Field
                label="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <Field
                label="Phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
              <Field
                type="password"
                label="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />

              <div>
                <label className="block mb-1 font-medium text-gray-600">
                  Assigned Bay
                </label>
                <select
                  value={form.assignedBay}
                  onChange={(e) =>
                    setForm({ ...form, assignedBay: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2
                             focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select Bay</option>
                  {bays.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.bayName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="px-6 py-4 border-t flex justify-end gap-3">
              <button onClick={() => setShowAdd(false)}>Cancel</button>
              <button
                onClick={submitStaff}
                className="px-5 py-2 bg-emerald-600 text-white rounded-lg"
              >
                Add Staff
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= SMALL COMPONENTS ================= */

const StaffDetails = ({ selected, getBayName }) => (
  <div className="space-y-3 text-[14px]">
    <h3 className="text-[16px] font-semibold">{selected.name}</h3>
    <Detail label="Email" value={selected.email} />
    <Detail label="Phone" value={selected.phone} />
    <Detail label="Bay" value={getBayName(selected.assignedBay)} />
    <Detail label="Role" value={selected.role} />
    <Detail label="Status" value={selected.isActive ? "Active" : "Inactive"} />
  </div>
);

const Stat = ({ title, value, icon: Icon }) => (
  <div className="bg-white rounded-2xl shadow-sm p-6">
    <div className="flex justify-between mb-2">
      <p className="text-gray-500">{title}</p>
      <Icon size={18} className="text-emerald-600" />
    </div>
    <p className="text-[26px] font-semibold">{value}</p>
  </div>
);

const Detail = ({ label, value }) => (
  <div>
    <p className="text-gray-500">{label}</p>
    <p className="font-medium">{value}</p>
  </div>
);

const Field = ({ label, ...props }) => (
  <div>
    <label className="block mb-1 font-medium text-gray-600">{label}</label>
    <input
      {...props}
      className="w-full border border-gray-300 rounded-md px-3 py-2
                 focus:outline-none focus:ring-2 focus:ring-emerald-500"
    />
  </div>
);
