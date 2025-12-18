"use client";

import { useState } from "react";
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
    email: "ravi.kumar@citycenter.qa",
    metrics: {
      staff: 45,
      visitors: 8,
      deliveries: 32,
    },
    staff: [
      { name: "Ravi Kumar", role: "Store Manager", type: "Manager" },
      { name: "Anu Mathew", role: "Supervisor", type: "Supervisor" },
      { name: "Imran Ali", role: "Sales Associate", type: "Staff" },
    ],
    bays: [
      { name: "Bay A", desc: "Primary delivery bay", status: "Active" },
      { name: "Bay B", desc: "Overflow / peak hours", status: "On demand" },
      { name: "Retail Zone", desc: "Ground floor · Unit G-12", status: "Assigned" },
    ],
    visits: [
      { date: "06 Sep 2025", time: "09:42", type: "Delivery vendor", bay: "Bay A" },
      { date: "05 Sep 2025", time: "14:15", type: "Tenant staff", bay: "Bay B" },
      { date: "04 Sep 2025", time: "11:03", type: "Maintenance", bay: "Bay A" },
    ],
  },
  {
    id: 2,
    name: "Fresh Bites Food Court",
    contact: "Lamia Hassan",
    phone: "+974 5523 7789",
    staffCount: 26,
    activeVisitors: 3,
    status: "Active",
  },
  {
    id: 3,
    name: "ElectroWorld",
    contact: "Mohammed Ali",
    phone: "+974 5578 9900",
    staffCount: 18,
    activeVisitors: 1,
    status: "Active",
  },
  {
    id: 4,
    name: "Kids Planet",
    contact: "Sarah Johnson",
    phone: "+974 5590 1212",
    staffCount: 12,
    activeVisitors: 0,
    status: "Inactive",
  },
  {
    id: 5,
    name: "Café Oasis",
    contact: "Ahmed Youssef",
    phone: "+974 5519 3344",
    staffCount: 9,
    activeVisitors: 2,
    status: "Active",
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

  const toggleStatus = (id) => {
    setTenants((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: t.status === "Active" ? "Inactive" : "Active" }
          : t
      )
    );
  };

  return (
    <div className="min-h-screen flex bg-[#f6f8fb] text-[14px] text-gray-700">
      

      <main className="flex-1 ml-4 p-6 space-y-6">
        {/* HEADER */}
        <div className="flex justify-between mb-5">
          <div>
            <h1 className="text-2xl font-semibold">Tenant Management</h1>
            <p className="text-gray-500">
              Manage mall tenants, their staff, allocated bays and visitor activity in the VMS.
            </p>
          </div>

          <div className="flex gap-2">
            <button className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-md">
              <Filter size={14} /> Filters
            </button>
            <button className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-md">
              <Plus size={14} /> Add Tenant
            </button>
          </div>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-3 gap-6">

          {/* TABLE */}
          <div className="col-span-2 bg-white border rounded-xl p-4">
            <div className="flex items-center gap-2 border rounded-md px-3 py-2 mb-3">
              <Search size={14} className="text-gray-400" />
              <input
                className="outline-none w-full"
                placeholder="Search tenants by name, contact or phone"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <table className="w-full">
              <thead>
                <tr className="border-b text-gray-500">
                  <th className="py-2 text-left">Tenant Name</th>
                  <th className="text-left">Contact Person</th>
                  <th className="text-left">Phone</th>
                  <th className="text-left">Number of Staff</th>
                  <th className="text-left">Active Visitors</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((t) => (
                  <tr
                    key={t.id}
                    onClick={() => setSelected(t)}
                    className="border-b hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="py-2 font-medium">{t.name}</td>
                    <td>{t.contact}</td>
                    <td>{t.phone}</td>
                    <td>{t.staffCount}</td>
                    <td>{t.activeVisitors}</td>
                    <td>
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStatus(t.id);
                        }}
                        className={`px-2 py-0.5 rounded-full text-xs ${
                          t.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <p className="text-xs text-gray-400 mt-2">
              Showing 1–5 of 36 tenants
            </p>

            {/* SHORTCUTS */}
            <div className="mt-4 bg-green-50 rounded-lg p-3">
              <p className="font-medium mb-2">Tenant tools & shortcuts</p>
              <div className="flex gap-3 flex-wrap">
                <Shortcut icon={<Users size={14} />} label="Manage tenant staff" />
                <Shortcut icon={<MapPin size={14} />} label="Assign / update bays" />
                <Shortcut icon={<Truck size={14} />} label="View delivery patterns" />
              </div>
            </div>
          </div>

          {/* RIGHT PANEL */}
          {selected && (
            <div className="space-y-4">

              {/* DETAILS */}
              <div className="bg-white border rounded-xl p-4">
                <div className="flex justify-between mb-2">
                  <h3 className="font-semibold">Tenant details</h3>
                  <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs">
                    Active tenant
                  </span>
                </div>

                <p className="font-semibold">{selected.name}</p>
                <p className="text-xs text-gray-500">
                  Primary contact: {selected.contact} · {selected.phone}
                </p>

                <div className="grid grid-cols-3 gap-2 mt-4">
                  <Metric title="Staff registered" value={selected.metrics?.staff} />
                  <Metric title="Active visitors now" value={selected.metrics?.visitors} />
                  <Metric title="Deliveries (7 days)" value={selected.metrics?.deliveries} />
                </div>
              </div>

              {/* STAFF */}
              <div className="bg-white border rounded-xl p-4">
                <h3 className="font-semibold mb-2">Tenant staff</h3>
                {selected.staff?.map((s, i) => (
                  <div key={i} className="bg-green-50 rounded-md p-2 mb-2 flex justify-between">
                    <div>
                      <p className="font-medium">{s.name}</p>
                      <p className="text-xs text-gray-500">{s.role}</p>
                    </div>
                    <span className="text-xs text-gray-600">{s.type}</span>
                  </div>
                ))}
              </div>

              {/* BAYS */}
              <div className="bg-white border rounded-xl p-4">
                <h3 className="font-semibold mb-2">Assigned bays & locations</h3>
                {selected.bays?.map((b, i) => (
                  <div key={i} className="bg-green-50 rounded-md p-2 mb-2 flex justify-between">
                    <div>
                      <p className="font-medium">{b.name}</p>
                      <p className="text-xs text-gray-500">{b.desc}</p>
                    </div>
                    <span className="text-xs text-gray-600">{b.status}</span>
                  </div>
                ))}
              </div>

              {/* VISITS */}
              <div className="bg-white border rounded-xl p-4">
                <h3 className="font-semibold mb-2">Visit history</h3>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b text-gray-500">
                      <th>Date</th>
                      <th>Time</th>
                      <th>Visitor type</th>
                      <th>Bay</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selected.visits?.map((v, i) => (
                      <tr key={i} className="border-b">
                        <td>{v.date}</td>
                        <td>{v.time}</td>
                        <td>{v.type}</td>
                        <td>{v.bay}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}
        </div>
      </main>
    </div>
  );
}

/* ---------------- COMPONENTS ---------------- */

function Metric({ title, value }) {
  return (
    <div className="bg-green-50 rounded-md p-2">
      <p className="text-xs text-gray-400">{title}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}

function Shortcut({ icon, label }) {
  return (
    <button className="flex items-center gap-2 bg-white border rounded-md px-3 py-2 text-sm hover:bg-gray-50">
      {icon}
      {label}
    </button>
  );
}
