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
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

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
        { headers: { Authorization: `Bearer ${token}` } }
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
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex-1 overflow-x-hidden">
        {/* ================= HEADER ================= */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-[18px] sm:text-[22px] font-semibold text-gray-800">
                Vendor Management
              </h1>
              <p className="text-[13px] sm:text-[14px] text-gray-500 mt-1">
                Manage vendor profiles and registered vehicles
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* SEARCH */}
              <div className="relative w-full sm:w-auto">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  className="pl-10 pr-4 h-[40px] w-full sm:w-64 rounded-lg border border-gray-300
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
            </div>
          </div>
        </div>

        {/* ================= FILTER PANEL ================= */}
        {showFilters && (
          <div className="px-4 sm:px-6 lg:px-8 py-4 bg-white border-b border-gray-200
                          flex flex-col sm:flex-row gap-4 text-[14px]">
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

        {/* ================= CONTENT ================= */}
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          {/* STATS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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

          {/* TABLE + DETAILS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* TABLE */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm overflow-x-auto">
              <table className="min-w-[700px] w-full">
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
                      <td colSpan={5} className="py-8 text-center text-gray-400">
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
                      <td className="px-6 py-4 font-medium">{v.companyName}</td>
                      <td className="px-6 py-4">{v.contactPerson}</td>
                      <td className="px-6 py-4">{v.mobile}</td>
                      <td className="px-6 py-4">
                        {v.registeredVehicles?.length || 0}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full bg-green-50 text-green-700 text-[13px]">
                          {v.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="m-6 border border-dashed rounded-xl p-6 text-center text-gray-400 text-[14px]">
                <Upload className="mx-auto mb-2" size={18} />
                CSV upload coming soon
              </div>
            </div>

            {/* DETAILS */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              {!selected ? (
                <p className="text-gray-400 text-center">
                  Select a vendor to view details
                </p>
              ) : (
                <div className="space-y-4 text-[14px]">
                  <h3 className="text-[16px] font-semibold">
                    {selected.companyName}
                  </h3>

                  <Detail label="Contact" value={selected.contactPerson} />
                  <Detail label="Mobile" value={selected.mobile} />

                  <div>
                    <p className="text-gray-500 mb-1">Registered Vehicles</p>
                    <div className="flex flex-wrap gap-2">
                      {selected.registeredVehicles?.length ? (
                        selected.registeredVehicles.map((v, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 bg-gray-100 rounded-lg text-[13px]"
                          >
                            {v}
                          </span>
                        ))
                      ) : (
                        <p className="text-gray-400">No vehicles</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ================= ADD MODAL ================= */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-[520px] rounded-2xl shadow-xl overflow-hidden">
            <div className="flex justify-between px-6 py-4 border-b">
              <h2 className="font-semibold">Add Vendor</h2>
              <X onClick={() => setShowAdd(false)} className="cursor-pointer" />
            </div>

            <div className="p-6 space-y-4">
              <Field
                label="Company Name"
                value={form.companyName}
                onChange={(e) =>
                  setForm({ ...form, companyName: e.target.value })
                }
              />
              <Field
                label="Contact Person"
                value={form.contactPerson}
                onChange={(e) =>
                  setForm({ ...form, contactPerson: e.target.value })
                }
              />
              <Field
                label="Mobile"
                value={form.mobile}
                onChange={(e) => setForm({ ...form, mobile: e.target.value })}
              />
              <Field
                label="Registered Vehicles"
                value={form.registeredVehicles}
                onChange={(e) =>
                  setForm({ ...form, registeredVehicles: e.target.value })
                }
              />
            </div>

            <div className="px-6 py-4 border-t flex justify-end gap-3 bg-gray-50">
              <button onClick={() => setShowAdd(false)}>Cancel</button>
              <button
                onClick={submitVendor}
                className="px-5 py-2 bg-emerald-600 text-white rounded-lg"
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

/* ================= SMALL COMPONENTS ================= */

const Stat = ({ title, value, icon: Icon }) => (
  <div className="bg-white rounded-2xl shadow-sm p-6">
    <div className="flex justify-between mb-2">
      <p className="text-gray-500">{title}</p>
      <Icon size={18} className="text-emerald-600" />
    </div>
    <p className="text-[26px] font-semibold">{value}</p>
  </div>
);

const Field = ({ label, ...props }) => (
  <div>
    <label className="block text-gray-600 mb-1">{label}</label>
    <input
      {...props}
      className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500"
    />
  </div>
);

const Select = ({ label, children, ...props }) => (
  <div>
    <label className="block text-gray-500 mb-1">{label}</label>
    <select {...props} className="border rounded-lg px-3 py-2">
      {children}
    </select>
  </div>
);

const Detail = ({ label, value }) => (
  <div>
    <p className="text-gray-500">{label}</p>
    <p className="font-medium">{value}</p>
  </div>
);
