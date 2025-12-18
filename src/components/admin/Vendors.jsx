"use client";

import { useEffect, useState } from "react";
import { Search, Filter, Plus, Upload } from "lucide-react";

/* ---------------- PAGE ---------------- */
export default function VendorManagement() {
  const [vendors, setVendors] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  /* ---------------- FETCH VENDORS ---------------- */
  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      setLoading(true);

      /**
       * BACKEND API (to be implemented)
       *
       * GET /api/v1/vendors
       * Returns:
       * [
       *   {
       *     _id,
       *     company,
       *     contact,
       *     phone,
       *     vehicles,
       *     deliveries,
       *     status
       *   }
       * ]
       */

      // const res = await fetch("/api/v1/vendors");
      // const data = await res.json();
      // setVendors(data);
      // setSelected(data[0] || null);

      setVendors([]); // placeholder
      setSelected(null);

    } catch (err) {
      console.error("Failed to fetch vendors", err);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- FILTER ---------------- */
  const filtered = vendors.filter(
    (v) =>
      v.company?.toLowerCase().includes(search.toLowerCase()) ||
      v.contact?.toLowerCase().includes(search.toLowerCase()) ||
      v.phone?.includes(search)
  );

  /* ---------------- STATUS BADGE ---------------- */
  const badge = (status) =>
    status === "Active"
      ? "bg-green-100 text-green-700"
      : status === "Paused"
      ? "bg-yellow-100 text-yellow-700"
      : "bg-red-100 text-red-700";

  return (
    <div className="min-h-screen flex bg-[#f6f8fb] text-[14px] text-gray-700">
      <main className="flex-1 ml-4 p-6">
        {/* HEADER */}
        <div className="flex justify-between mb-5">
          <div>
            <h1 className="text-2xl font-semibold">Vendor Management</h1>
            <p className="text-gray-500">
              Manage vendor profiles, contacts, vehicles and delivery performance within the VMS.
            </p>
          </div>

          <div className="flex gap-2">
            <button className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-md">
              <Filter size={14} /> Filters
            </button>
            <button className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-md">
              <Plus size={14} /> Add Vendor
            </button>
          </div>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-3 gap-6">

          {/* TABLE */}
          <div className="col-span-2 bg-white rounded-xl shadow-sm p-4">

            <div className="flex items-center gap-2 bg-white rounded-xl shadow-sm p-4 px-3 py-2 mb-3">
              <Search size={14} className="text-gray-400" />
              <input
                className="outline-none w-full"
                placeholder="Search vendors by company, contact or phone"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                Status: All
              </span>
            </div>

            <table className="w-full">
              <thead>
                <tr className="border-b text-gray-500">
                  <th className="py-2 text-left">Company Name</th>
                  <th>Contact Person</th>
                  <th>Phone</th>
                  <th>Vehicles</th>
                  <th>Deliveries</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {filtered.length === 0 && !loading && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-gray-400">
                      No vendors found
                    </td>
                  </tr>
                )}

                {filtered.map((v) => (
                  <tr
                    key={v._id}
                    onClick={() => setSelected(v)}
                    className="border-b hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="py-2 font-medium">{v.company}</td>
                    <td>{v.contact}</td>
                    <td>{v.phone}</td>
                    <td>{v.vehicles}</td>
                    <td>{v.deliveries}</td>
                    <td>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${badge(v.status)}`}>
                        {v.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <p className="text-xs text-gray-400 mt-2">
              Showing {filtered.length} vendors
            </p>

            {/* CSV UPLOAD */}
            <div className="mt-4 border border-dashed rounded-lg p-4 text-center text-sm text-gray-400">

              <Upload className="mx-auto mb-2" size={18} />
              Drag & drop CSV here or click to browse
              <p className="mt-2 text-xs">
                Expected columns: company, contact, phone, vehicles, status
              </p>

              {/* Backend placeholder */}
              {/* POST /api/v1/vendors/bulk-upload */}
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="space-y-4">
            {!selected ? (
              <div className="bg-white border rounded-xl p-6 text-center text-gray-400">
                Select a vendor to view details
              </div>
            ) : (
              <>
                {/* DETAILS */}
                <div className="bg-white border rounded-xl p-4">
                  <div className="flex justify-between mb-2">
                    <h3 className="font-semibold">Vendor details</h3>
                    <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs">
                      {selected.status}
                    </span>
                  </div>

                  <p className="font-semibold">{selected.company}</p>
                  <p className="text-xs text-gray-500">
                    Primary contact: {selected.contact} · {selected.phone}
                  </p>

                  <div className="grid grid-cols-3 gap-2 mt-4">
                    <Metric title="Deliveries (30 days)" value="--" />
                    <Metric title="Avg. dwell time" value="--" />
                    <Metric title="On-time rate" value="--" />
                  </div>
                </div>

                {/* STAFF */}
                <div className="bg-white border rounded-xl p-4">
                  <h3 className="font-semibold mb-2">Vendor staff</h3>
                  <p className="text-sm text-gray-400">
                    Data will load from:
                    <br />
                    <code className="text-xs">
                      GET /api/v1/vendors/{selected._id}/staff
                    </code>
                  </p>
                </div>

                {/* VISITS */}
                <div className="bg-white border rounded-xl p-4">
                  <h3 className="font-semibold mb-2">Visit history</h3>
                  <p className="text-sm text-gray-400">
                    Data will load from:
                    <br />
                    <code className="text-xs">
                      GET /api/v1/vendors/{selected._id}/visits
                    </code>
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

/* ---------------- METRIC CARD ---------------- */
function Metric({ title, value }) {
  return (
    <div className="bg-green-50 rounded-md p-2">
      <p className="text-xs text-gray-400">{title}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}
