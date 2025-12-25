"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Filter,
  Plus,
  X,
  Users,
  Activity,
  Trash2,
  Pencil,
} from "lucide-react";
import axios from "axios";

export default function VendorManagement() {
  const [vendors, setVendors] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [editId, setEditId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [showAdd, setShowAdd] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showMobilePopup, setShowMobilePopup] = useState(false);

  const [filters, setFilters] = useState({ status: "all" });

  const [form, setForm] = useState({
    companyName: "",
    contactPerson: "",
    mobile: "",
  });

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("accessToken")
      : null;

  /* ================= FETCH ================= */
  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      setLoading(true);

      const query = new URLSearchParams({
        search,
        status: filters.status !== "all" ? filters.status : "",
      });

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/vendors?${query.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setVendors(res.data.vendors || []);
      setSelected(null);
    } catch (err) {
      console.error("Failed to fetch vendors", err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= CREATE ================= */
  const submitVendor = async () => {
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/vendors`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setVendors((prev) => [res.data.vendor, ...prev]);
      closeModal();
    } catch (err) {
      console.error("Add vendor failed", err);
    }
  };

  /* ================= UPDATE ================= */
  const updateVendor = async () => {
    try {
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/vendors/${editId}`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setVendors((prev) =>
        prev.map((v) => (v._id === editId ? res.data.updated : v))
      );

      closeModal();
    } catch (err) {
      console.error("Update vendor failed", err);
    }
  };

  /* ================= STATUS ================= */
  const toggleVendorStatus = async (id) => {
    try {
      const res = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/vendors/${id}/status`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setVendors((prev) =>
        prev.map((v) =>
          v._id === id ? { ...v, status: res.data.status } : v
        )
      );
    } catch (err) {
      console.error("Toggle status failed", err);
    }
  };

  /* ================= DELETE ================= */
  const deleteVendor = async () => {
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/vendors/${selected._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setVendors((prev) =>
        prev.filter((v) => v._id !== selected._id)
      );

      setConfirmDelete(false);
      setSelected(null);
    } catch (err) {
      console.error("Delete vendor failed", err);
    }
  };

  const closeModal = () => {
    setShowAdd(false);
    setEditId(null);
    setForm({ companyName: "", contactPerson: "", mobile: "" });
  };

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <div className="bg-white shadow-sm px-6 py-4 flex justify-between">
        <div>
          <h1 className="text-xl font-semibold">Vendor Management</h1>
          <p className="text-sm text-gray-500">Manage vendor profiles</p>
        </div>

        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={16} />
            <input
              className="pl-9 pr-4 h-10 border border-gray-400 rounded-lg"
              placeholder="Search vendor"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyUp={fetchVendors}
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 h-10 border border-gray-400 rounded-lg"
          >
            <Filter size={16} />
          </button>

          <button
            onClick={() => {
              setEditId(null);
              setShowAdd(true);
            }}
            className="px-4 h-10 bg-emerald-600 text-white rounded-lg flex items-center gap-2"
          >
            <Plus size={16} /> Add Vendor
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className="px-6 py-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Stat title="Total Vendors" value={vendors.length} icon={Users} />
        <Stat
          title="Active Vendors"
          value={vendors.filter((v) => v.status === "active").length}
          icon={Activity}
        />
      </div>

      {/* TABLE */}
      <div className="px-6">
        <div className="bg-white rounded-2xl shadow overflow-x-auto">
          <table className="min-w-[720px] w-full">
            <thead className="bg-green-100">
              <tr>
                {["Company", "Contact", "Mobile", "Status", "Actions"].map(
                  (h) => (
                    <th key={h} className="px-6 py-4 text-center text-sm">
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>

            <tbody className="text-center">
              {vendors.map((v) => (
                <tr
                  key={v._id}
                  onClick={() => {
                    setSelected(v);
                    setShowMobilePopup(true);
                  }}
                  className="shadow-sm hover:bg-green-50 cursor-pointer"
                >
                  <td className="px-6 py-4 font-medium">
                    {v.companyName}
                  </td>
                  <td className="px-6 py-4">{v.contactPerson}</td>
                  <td className="px-6 py-4">{v.mobile}</td>

                  <td className="px-6 py-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleVendorStatus(v._id);
                      }}
                      className={`px-3 py-1 rounded-full text-xs ${
                        v.status === "active"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {v.status}
                    </button>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditId(v._id);
                          setForm({
                            companyName: v.companyName,
                            contactPerson: v.contactPerson,
                            mobile: v.mobile,
                          });
                          setShowAdd(true);
                        }}
                        className="text-emerald-600 hover:text-emerald-800"
                      >
                        <Pencil size={18} />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelected(v);
                          setConfirmDelete(true);
                        }}
                        className="text-red-600 hover:text-red-800"
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
      </div>

      {/* ADD / EDIT MODAL */}
      {showAdd && (
        <Modal
          title={editId ? "Edit Vendor" : "Add Vendor"}
          onClose={closeModal}
          onSubmit={editId ? updateVendor : submitVendor}
          form={form}
          setForm={setForm}
        />
      )}

      {/* DELETE CONFIRM */}
      {confirmDelete && (
        <ConfirmDelete
          onCancel={() => setConfirmDelete(false)}
          onDelete={deleteVendor}
        />
      )}
    </div>
  );
}

/* ================= COMPONENTS ================= */

const Stat = ({ title, value, icon: Icon }) => (
  <div className="bg-teal-50 border border-green-600 rounded-2xl shadow p-6">
    <div className="flex justify-between mb-2">
      <p className="text-gray-500">{title}</p>
      <Icon size={18} className="text-emerald-600" />
    </div>
    <p className="text-2xl font-semibold">{value}</p>
  </div>
);

const Modal = ({ title, onClose, onSubmit, form, setForm }) => (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl w-full max-w-md">
      <div className="px-6 py-4 border-b flex justify-between">
        <h2 className="font-semibold">{title}</h2>
        <X onClick={onClose} className="cursor-pointer" />
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
          onChange={(e) =>
            setForm({ ...form, mobile: e.target.value })
          }
        />
      </div>

      <div className="px-6 py-4 border-t flex justify-end gap-3">
        <button onClick={onClose}>Cancel</button>
        <button
          onClick={onSubmit}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg"
        >
          Save
        </button>
      </div>
    </div>
  </div>
);

const ConfirmDelete = ({ onCancel, onDelete }) => (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl p-6 w-80">
      <h3 className="font-semibold mb-2">Delete Vendor?</h3>
      <p className="text-sm text-gray-500 mb-4">
        This action cannot be undone.
      </p>

      <div className="flex justify-end gap-3">
        <button onClick={onCancel}>Cancel</button>
        <button
          onClick={onDelete}
          className="bg-red-600 text-white px-4 py-2 rounded-lg"
        >
          Delete
        </button>
      </div>
    </div>
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
