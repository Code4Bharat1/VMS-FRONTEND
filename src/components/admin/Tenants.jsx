"use client";

import React, { useState } from "react";
import { Search, Filter, Plus, Users, MapPin, Truck } from "lucide-react";

/* ---------------- DATA ---------------- */
const tenantsData = [
  {
    id: 1,
    name: "City Center Hypermarket",
    contact: "Ravi Kumar",
    phone: "+974 5551 2040",
    staffCount: 45,
    activeVisitors: 8,
    status: "Active",
    metrics: { staff: 45, visitors: 8, deliveries: 32 },
    staff: [
      { name: "Ravi Kumar", role: "Store Manager", type: "Manager" },
      { name: "Anu Mathew", role: "Supervisor", type: "Supervisor" },
      { name: "Imran Ali", role: "Sales Associate", type: "Staff" },
    ],
    bays: [
      { name: "Bay A", desc: "Primary delivery bay", status: "Active" },
      { name: "Bay B", desc: "Overflow / peak hours", status: "On demand" },
    ],
  },
];

/* ---------------- PAGE ---------------- */
export default function TenantManagement() {
  const [tenants, setTenants] = useState(tenantsData);
  const [selected, setSelected] = useState(tenantsData[0]);
  const [search, setSearch] = useState("");

  const filtered = tenants.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 overflow-auto">

        {/* HEADER (MATCHED) */}
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Tenant Management
              </h1>
              <p className="text-gray-500 mt-1">
                Manage mall tenants, their staff, bays, and visitor activity.
              </p>
            </div>

            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium
                text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Filter size={16} />
                Filters
              </button>
              <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium
                text-white bg-emerald-600 rounded-lg hover:bg-emerald-700">
                <Plus size={16} />
                Add Tenant
              </button>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="px-8 py-6">

          {/* GRID */}
          <div className="grid grid-cols-3 gap-6">

            {/* TABLE */}
            <div className="col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">

              {/* SEARCH */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-3 top-2.5 text-gray-400"
                  />
                  <input
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md
                      text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="Search tenants"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* TABLE */}
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {[
                      "Tenant Name",
                      "Contact",
                      "Phone",
                      "Staff",
                      "Visitors",
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
                  {filtered.map((t) => (
                    <tr
                      key={t.id}
                      onClick={() => setSelected(t)}
                      className="hover:bg-gray-50 cursor-pointer"
                    >
                      <td className="px-6 py-4 font-medium text-gray-800">
                        {t.name}
                      </td>
                      <td className="px-6 py-4 text-gray-600">{t.contact}</td>
                      <td className="px-6 py-4 text-gray-600">{t.phone}</td>
                      <td className="px-6 py-4 font-semibold text-gray-800">
                        {t.staffCount}
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-800">
                        {t.activeVisitors}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            t.status === "Active"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-sm text-gray-600">
                Showing {filtered.length} tenants
              </div>
            </div>

            {/* RIGHT PANEL */}
            {selected && (
              <div className="space-y-4">

                {/* DETAILS */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    Tenant Details
                  </h3>
                  <p className="font-semibold text-gray-800">{selected.name}</p>
                  <p className="text-sm text-gray-500">
                    {selected.contact} · {selected.phone}
                  </p>

                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <Metric title="Staff" value={selected.metrics.staff} />
                    <Metric title="Visitors" value={selected.metrics.visitors} />
                    <Metric title="Deliveries" value={selected.metrics.deliveries} />
                  </div>
                </div>

                {/* SHORTCUTS */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">
                    Tenant Actions
                  </h3>

                  <div className="flex gap-3 flex-wrap">
                    <Shortcut icon={<Users size={16} />} label="Manage Staff" />
                    <Shortcut icon={<MapPin size={16} />} label="Assign Bays" />
                    <Shortcut icon={<Truck size={16} />} label="Delivery Trends" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- COMPONENTS ---------------- */

function Metric({ title, value }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  );
}

function Shortcut({ icon, label }) {
  return (
    <button className="flex items-center gap-2 px-4 py-2
      text-sm font-medium text-gray-700
      border border-gray-300 rounded-lg hover:bg-gray-50">
      {icon}
      {label}
    </button>
  );
}
