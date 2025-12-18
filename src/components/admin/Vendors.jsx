"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Filter,
  Plus,
  Upload,
  X,
  Users,
  Activity,
  TrendingUp,
} from "lucide-react";

export default function VendorManagement() {
  const [vendors, setVendors] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [showAdd, setShowAdd] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    status: "all",
    hasVehicles: "all",
  });

  const [form, setForm] = useState({
    companyName: "",
    contactPerson: "",
    mobile: "",
    registeredVehicles: "",
  });

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      setLoading(true);

      const query = new URLSearchParams({
        search,
        status: filters.status !== "all" ? filters.status : "",
        hasVehicles: filters.hasVehicles !== "all" ? filters.hasVehicles : "",
      });

      const res = await fetch(
        `http://localhost:5000/api/v1/vendors?${query.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      setVendors(data.vendors || []);
      setSelected(null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const submitVendor = async () => {
    await fetch("http://localhost:5000/api/v1/vendors", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...form,
        registeredVehicles: form.registeredVehicles
          .split(",")
          .map((v) => v.trim()),
      }),
    });

    setShowAdd(false);
    setForm({
      companyName: "",
      contactPerson: "",
      mobile: "",
      registeredVehicles: "",
    });
    fetchVendors();
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 overflow-auto">
        {/* ===== HEADER (ONLY CHANGE) ===== */}
        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <div className="flex items-center justify-between">
            {/* LEFT */}
            <div>
              <h1 className="text-[22px] font-semibold text-gray-800">
                Vendor Management
              </h1>
              <p className="text-[14px] text-gray-500 mt-1">
                Manage vendor profiles and registered vehicles
              </p>
            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-3">
              {/* SEARCH */}
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  className="pl-10 pr-4 h-[40px] w-64 rounded-lg border border-gray-300
                             text-[14px] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Search vendor"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyUp={fetchVendors}
                />
              </div>

              {/* FILTER */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 h-[40px]
                           rounded-lg border border-gray-300 bg-white text-[14px]"
              >
                <Filter size={16} />
                Filters
              </button>

              {/* ADD */}
              <button
                onClick={() => setShowAdd(true)}
                className="flex items-center gap-2 px-4 h-[40px]
                           rounded-lg bg-emerald-600 text-white text-[14px]"
              >
                <Plus size={16} />
                Add Vendor
              </button>

              {/* USER */}
              <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-semibold text-[14px]">
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

        {/* FILTER PANEL (UNCHANGED) */}
        {showFilters && (
          <div className="px-8 py-4 bg-white border-b border-gray-200 flex gap-6 text-[14px]">
            <Select
              label="Status"
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Select>

            <Select
              label="Registered Vehicles"
              value={filters.hasVehicles}
              onChange={(e) =>
                setFilters({ ...filters, hasVehicles: e.target.value })
              }
            >
              <option value="all">All</option>
              <option value="yes">Has Vehicles</option>
              <option value="no">No Vehicles</option>
            </Select>

            <button
              onClick={fetchVendors}
              className="self-end px-4 h-[40px] rounded-lg bg-emerald-600 text-white text-[14px]"
            >
              Apply
            </button>
          </div>
        )}

        {/* ===== CONTENT (TABLE + PANEL – UNTOUCHED) ===== */}
        <div className="px-8 py-6">
          {/* STATS */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <Stat title="Total Vendors" value={vendors.length} icon={Users} />
            <Stat
              title="Active Vendors"
              value={vendors.filter((v) => v.status === "active").length}
              icon={Activity}
            />
            <Stat
              title="Registered Vehicles"
              value={vendors.reduce(
                (a, v) => a + (v.registeredVehicles?.length || 0),
                0
              )}
              icon={TrendingUp}
            />
          </div>

          {/* TABLE + RIGHT PANEL */}
          <div className="grid grid-cols-3 gap-6">
            {/* TABLE (NO BORDER, SHADOW ONLY) */}
            <div className="col-span-2 bg-white rounded-2xl shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="border-b border-gray-200">
                  <tr>
                    {["Company", "Contact", "Mobile", "Vehicles", "Status"].map(
                      (h) => (
                        <th
                          key={h}
                          className="px-6 py-4 text-left text-[14px] font-medium text-gray-600"
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {!loading && vendors.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-8 text-center text-gray-400 text-[14px]"
                      >
                        No vendors found
                      </td>
                    </tr>
                  )}

                  {vendors.map((v) => (
                    <tr
                      key={v._id}
                      onClick={() => setSelected(v)}
                      className="hover:bg-emerald-50 cursor-pointer"
                    >
                      <td className="px-6 py-4 text-[14px] font-medium text-gray-800">
                        {v.companyName}
                      </td>
                      <td className="px-6 py-4 text-[14px] text-gray-700">
                        {v.contactPerson}
                      </td>
                      <td className="px-6 py-4 text-[14px] text-gray-700">
                        {v.mobile}
                      </td>
                      <td className="px-6 py-4 text-[14px] text-gray-700">
                        {v.registeredVehicles?.length || 0}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full bg-green-50 text-green-700 text-[13px] font-medium">
                          {v.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="m-6 border border-dashed border-gray-300 rounded-xl p-6 text-center text-gray-400 text-[14px]">
                <Upload className="mx-auto mb-2" size={18} />
                CSV upload coming soon
              </div>
            </div>

            {/* RIGHT PANEL (MATCHED) */}
            {/* RIGHT PANEL */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              {!selected ? (
                <p className="text-[14px] text-gray-400 text-center">
                  Select a vendor to view details
                </p>
              ) : (
                <div className="space-y-4 text-[14px]">
                  <div>
                    <h3 className="text-[16px] font-semibold text-gray-800">
                      {selected.companyName}
                    </h3>
                    <p className="text-gray-500">
                      Contact: {selected.contactPerson}
                    </p>
                  </div>

                  <Detail label="Mobile Number" value={selected.mobile} />
                  <Detail label="Status">
                    <span
                      className={`px-3 py-1 rounded-full text-[13px] font-medium ${
                        selected.status === "active"
                          ? "bg-green-50 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {selected.status}
                    </span>
                  </Detail>

                  <div>
                    <p className="text-gray-500 mb-1">Registered Vehicles</p>
                    {selected.registeredVehicles?.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selected.registeredVehicles.map((v, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 rounded-lg bg-gray-100 text-gray-700 text-[13px]"
                          >
                            {v}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400">No vehicles registered</p>
                    )}
                  </div>

                  <div className="pt-4 border-t border-gray-200 space-y-2">
                    <Detail
                      label="Created On"
                      value={new Date(selected.createdAt).toLocaleDateString()}
                    />
                    <Detail
                      label="Last Updated"
                      value={new Date(selected.updatedAt).toLocaleDateString()}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ADD MODAL */}
      {/* ADD MODAL */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[520px] rounded-2xl shadow-xl overflow-hidden">
            {/* HEADER */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
              <div>
                <h2 className="text-[16px] font-semibold text-gray-800">
                  Add Vendor
                </h2>
                <p className="text-[13px] text-gray-500 mt-0.5">
                  Enter vendor details and registered vehicles
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
                  Vendor Information
                </p>

                <div className="space-y-4">
                  <Field
                    label="Company Name"
                    name="companyName"
                    placeholder="e.g. Nexcore Supplies"
                    value={form.companyName}
                    onChange={(e) =>
                      setForm({ ...form, companyName: e.target.value })
                    }
                  />

                  <Field
                    label="Contact Person"
                    name="contactPerson"
                    placeholder="e.g. Ahmed Khan"
                    value={form.contactPerson}
                    onChange={(e) =>
                      setForm({ ...form, contactPerson: e.target.value })
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
                  name="mobile"
                  placeholder="+974 55xxxxxx"
                  value={form.mobile}
                  onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                />
              </div>

              {/* VEHICLES */}
              <div>
                <p className="text-[13px] font-medium text-gray-500 mb-3">
                  Vehicle Information
                </p>

                <Field
                  label="Registered Vehicles"
                  name="registeredVehicles"
                  placeholder="QAT 44129, QAT 99231"
                  value={form.registeredVehicles}
                  onChange={(e) =>
                    setForm({ ...form, registeredVehicles: e.target.value })
                  }
                />
                <p className="text-[12px] text-gray-400 mt-1">
                  Separate multiple vehicles using commas
                </p>
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
                onClick={submitVendor}
                className="px-6 py-2 rounded-lg bg-emerald-600
                     text-white text-[14px] font-medium
                     hover:bg-emerald-700 transition"
              >
                Add Vendor
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
    <div className="flex items-center justify-between mb-2">
      <p className="text-[14px] text-gray-500">{title}</p>
      <Icon size={18} className="text-emerald-600" />
    </div>
    <p className="text-[28px] font-semibold text-gray-900">{value}</p>
  </div>
);

const Field = ({ label, ...props }) => (
  <div>
    <label className="block text-[14px] font-medium text-gray-600 mb-1">
      {label}
    </label>
    <input
      {...props}
      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-emerald-500"
    />
  </div>
);

const Select = ({ label, children, ...props }) => (
  <div>
    <label className="block text-[14px] text-gray-500 mb-1">{label}</label>
    <select
      {...props}
      className="rounded-lg border border-gray-300 px-3 py-2 text-[14px]"
    >
      {children}
    </select>
  </div>
);

const Detail = ({ label, value, children }) => (
  <div>
    <p className="text-gray-500 mb-1">{label}</p>
    {children || <p className="text-gray-800 font-medium">{value}</p>}
  </div>
);
