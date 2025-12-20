"use client";

import { useEffect, useState } from "react";
import { Search, Plus, Filter, Users, Activity, X } from "lucide-react";
import axios from "axios";

export default function StaffManagement() {
  const [staff, setStaff] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");

  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [nameFilter, setNameFilter] = useState("all");

  /* ===== ADD STAFF (NEW – MINIMAL) ===== */
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    assignedBay: "",
    password: "",
  });

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  /* ================= FETCH STAFF ================= */
  useEffect(() => {
    fetchStaff();
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

  /* ================= ADD STAFF (NEW) ================= */
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

  /* ================= FILTER LOGIC ================= */
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
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 overflow-auto">
        {/* ===== NAVBAR ===== */}
        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <div className="flex items-center justify-between">
            {/* LEFT */}
            <div>
              <h1 className="text-[22px] font-semibold text-gray-800">
                Staff Management
              </h1>
              <p className="text-[14px] text-gray-500 mt-1">
                Manage security staff and supervisors
              </p>
            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-3">
              {/* SEARCH */}
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search staff"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 pr-4 h-[40px] w-64 rounded-lg
                             border border-gray-300 text-[14px]
                             focus:outline-none focus:ring-2
                             focus:ring-emerald-500"
                />
              </div>

              {/* FILTER */}
              <button
                onClick={() => setShowFilters((p) => !p)}
                className="flex items-center gap-2 px-4 h-[40px]
                           rounded-lg border border-gray-300
                           bg-white text-[14px]"
              >
                <Filter size={16} />
                Filters
              </button>

              {/* ADD STAFF (ONLY onClick ADDED) */}
              <button
                onClick={() => setShowAdd(true)}
                className="flex items-center gap-2 px-4 h-[40px]
                           rounded-lg bg-emerald-600
                           text-white text-[14px]"
              >
                <Plus size={16} />
                Add Staff
              </button>

              {/* USER */}
              <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                <div
                  className="w-10 h-10 rounded-full bg-gray-200
                                flex items-center justify-center
                                text-gray-700 font-semibold text-[14px]"
                >
                  AT
                </div>
                <div className="leading-tight">
                  <p className="text-[14px] font-medium text-gray-800">
                    Alex Tan
                  </p>
                  <p className="text-[12px] text-gray-500">
                    Operations Manager
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== FILTER PANEL ===== */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out
            ${showFilters ? "max-h-[140px] opacity-100" : "max-h-0 opacity-0"}`}
        >
          <div className="bg-white border-b border-gray-200 px-8 py-4 flex gap-8 text-[14px]">
            <div>
              <label className="block text-gray-500 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 w-40"
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
                className="border border-gray-300 rounded-lg px-3 py-2 w-48"
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
        </div>

        {/* ===== CONTENT ===== */}
        <div className="px-8 py-6">
          {/* STATS */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <Stat title="Total Staff" value={staff.length} icon={Users} />
            <Stat
              title="Active Staff"
              value={staff.filter((s) => s.isActive).length}
              icon={Activity}
            />
            <Stat
              title="Assigned Bays"
              value={
                new Set(staff.map((s) => s.assignedBay?.bayName).filter(Boolean)).size
              }
              icon={Users}
            />
          </div>

          {/* TABLE + DETAILS */}
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 bg-white rounded-2xl shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="border-b border-gray-200">
                  <tr>
                    {["Name", "Email", "Phone", "Bay", "Status"].map((h) => (
                      <th
                        key={h}
                        className="px-6 py-4 text-left text-[14px] font-medium text-gray-600"
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
                      onClick={() => setSelected(s)}
                      className="hover:bg-gray-50 cursor-pointer"
                    >
                      <td className="px-6 py-4 font-medium">{s.name}</td>
                      <td className="px-6 py-4">{s.email}</td>
                      <td className="px-6 py-4">{s.phone}</td>
                      <td className="px-6 py-4">{s.assignedBay?.bayName || "-"}</td>
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

            <div className="bg-white rounded-2xl shadow-sm p-6">
              {!selected ? (
                <p className="text-[14px] text-gray-400 text-center">
                  Select a staff member to view details
                </p>
              ) : (
                <div className="space-y-3 text-[14px]">
                  <h3 className="text-[16px] font-semibold">{selected.name}</h3>
                  <Detail label="Email" value={selected.email} />
                  <Detail label="Phone" value={selected.phone} />
                  <Detail label="Bay" value={selected.assignedBay?.bayName || "—"} />
                  <Detail label="Role" value={selected.role} />
                  <Detail
                    label="Status"
                    value={selected.isActive ? "Active" : "Inactive"}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ADD STAFF MODAL */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[520px] rounded-2xl shadow-xl overflow-hidden">
            {/* HEADER */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
              <div>
                <h2 className="text-[16px] font-semibold text-gray-800">
                  Add Staff
                </h2>
                <p className="text-[13px] text-gray-500 mt-0.5">
                  Enter staff details and assignment
                </p>
              </div>
              <X
                className="cursor-pointer text-gray-400 hover:text-gray-700"
                onClick={() => setShowAdd(false)}
              />
            </div>

            {/* BODY */}
            <div className="p-6 space-y-6 text-[14px]">
              {/* BASIC INFO */}
              <div>
                <p className="text-[13px] font-medium text-gray-500 mb-3">
                  Staff Information
                </p>

                <div className="space-y-4">
                  <Field
                    label="Full Name"
                    placeholder="e.g. Neha Sharma"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />

                  <Field
                    label="Email Address"
                    placeholder="e.g. neha@test.com"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* CONTACT */}
              <div>
                <p className="text-[13px] font-medium text-gray-500 mb-3">
                  Contact Details
                </p>

                <Field
                  label="Mobile Number"
                  placeholder="+974 55xxxxxx"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>

              {/* ASSIGNMENT */}
              <div>
                <p className="text-[13px] font-medium text-gray-500 mb-3">
                  Assignment
                </p>

                <Field
                  label="Assigned Bay"
                  placeholder="e.g. Bay A"
                  value={form.assignedBay?.bayName}
                  onChange={(e) =>
                    setForm({ ...form, assignedBay: e.target.value })
                  }
                />
              </div>

              {/* SECURITY */}
              <div>
                <p className="text-[13px] font-medium text-gray-500 mb-3">
                  Login Credentials
                </p>

                <Field
                  type="password"
                  label="Password"
                  placeholder="Enter password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                />
              </div>
            </div>

            {/* FOOTER */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
              <button
                onClick={() => setShowAdd(false)}
                className="text-[14px] text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>

              <button
                onClick={submitStaff}
                className="px-6 py-2 rounded-lg bg-emerald-600
                     text-white text-[14px] font-medium
                     hover:bg-emerald-700 transition"
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

/* ===== SMALL COMPONENTS ===== */

const Stat = ({ title, value, icon: Icon }) => (
  <div className="bg-white rounded-2xl shadow-sm p-6">
    <div className="flex justify-between mb-2">
      <p className="text-[14px] text-gray-500">{title}</p>
      <Icon size={18} className="text-emerald-600" />
    </div>
    <p className="text-[28px] font-semibold text-gray-900">{value}</p>
  </div>
);

const Detail = ({ label, value }) => (
  <div>
    <p className="text-gray-500 mb-1">{label}</p>
    <p className="font-medium text-gray-800">{value}</p>
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
