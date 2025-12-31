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
import * as yup from "yup";

/* ================= YUP VALIDATION ================= */
const vendorSchema = yup.object().shape({
  companyName: yup
    .string()
    .matches(/^[A-Za-z ]+$/, "Only alphabets allowed")
    .required("Company name is required"),
  contactPerson: yup
    .string()
    .matches(/^[A-Za-z ]+$/, "Only alphabets allowed")
    .required("Contact person is required"),
  mobile: yup
    .string()
    .matches(/^[0-9]{10,15}$/, "Only numbers (10–15 digits)")
    .required("Mobile number is required"),
  shopId: yup
    .string()
    .matches(/^[A-Za-z0-9]+$/, "Only letters & numbers allowed")
    .required("Shop ID is required"),
  floorNo: yup
    .string()
    .matches(/^[0-9]+$/, "Only numbers allowed")
    .required("Floor number is required"),
  crNo: yup
    .string()
    .matches(/^[A-Za-z0-9]+$/, "Only letters & numbers allowed")
    .required("Registration number is required"),
});

export default function VendorManagement() {
  const [vendors, setVendors] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [editId, setEditId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  const [filters, setFilters] = useState({ status: "all" });

  const [form, setForm] = useState({
    companyName: "",
    contactPerson: "",
    mobile: "",
    shopId: "",
    floorNo: "",
    crNo: "",
  });

  const [errors, setErrors] = useState({});

  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  /* ================= FETCH ================= */
  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/vendors`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setVendors(res.data.vendors || []);
    } catch (err) {
      console.error("Fetch failed", err);
    } finally {
      setLoading(false);
    }
  };
  /* ================= SEARCH (THIS WAS MISSING) ================= */
  const filteredVendors = vendors.filter((v) =>
    [
      v.companyName,
      v.contactPerson,
      v.mobile,
      v.shopId,
      v.crNo,
    ]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );
  /* ================= VALIDATION ================= */
  const validateForm = async () => {
    try {
      await vendorSchema.validate(form, { abortEarly: false });
      setErrors({});
      return true;
    } catch (err) {
      const e = {};
      err.inner.forEach((i) => (e[i.path] = i.message));
      setErrors(e);
      return false;
    }
  };

  /* ================= CREATE / UPDATE ================= */
  const submitVendor = async () => {
    if (!(await validateForm())) return;
    await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/vendors`, form, {
      headers: { Authorization: `Bearer ${token}` },
    });
    closeModal();
    fetchVendors();
  };

  const updateVendor = async () => {
    if (!(await validateForm())) return;
    await axios.put(
      `${process.env.NEXT_PUBLIC_API_URL}/vendors/${editId}`,
      form,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    closeModal();
    fetchVendors();
  };

  const toggleVendorStatus = async (id) => {
    await axios.patch(
      `${process.env.NEXT_PUBLIC_API_URL}/vendors/${id}/status`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchVendors();
  };

  const deleteVendor = async () => {
    await axios.delete(
      `${process.env.NEXT_PUBLIC_API_URL}/vendors/${selected._id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setConfirmDelete(false);
    fetchVendors();
  };

  const closeModal = () => {
    setShowAdd(false);
    setEditId(null);
    setErrors({});
    setForm({
      companyName: "",
      contactPerson: "",
      mobile: "",
      shopId: "",
      floorNo: "",
      crNo: "",
    });
  };

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-teal-50">
      {/* HEADER */}
      <div
        className="bg-white shadow-sm px-4 sm:px-6 py-4
                      flex flex-col sm:flex-row gap-4 sm:justify-between"
      >
        <div>
          <h1 className="text-xl font-semibold">Vendor Management</h1>
          <p className="text-sm text-gray-500">Manage vendor profiles</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative w-full sm:w-72">
            <Search
              className="absolute left-3 top-2.5 text-gray-400"
              size={16}
            />
            <input
              className="w-full bg-gray-100 pl-9 pr-3 py-2 rounded-xl text-sm
               focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Search vendors"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <button
            onClick={() => setShowAdd(true)}
            className="px-4 h-10 bg-emerald-600 text-white rounded-lg
                       flex items-center justify-center gap-2"
          >
            <Plus size={16} /> Add Vendor
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className="px-4 sm:px-6 py-6 grid grid-cols-1  sm:grid-cols-2 gap-6">
        <Stat title="Total Vendors" value={vendors.length} icon={Users} />
        <Stat
          title="Active Vendors"
          value={vendors.filter((v) => v.status === "active").length}
          icon={Activity}
        />
      </div>

      {/* DESKTOP TABLE */}
      <div className="hidden sm:block px-6">
        <div className="bg-white rounded-2xl shadow overflow-x-auto">
          <table className="min-w-[720px] w-full">
            <thead className="bg-green-100">
              <tr>
                {[
                  "Registration No",
                  "ShopId",
                  "FloorNo",
                  "Company",
                  "Contact",
                  "Mobile",
                  "Status",
                  "Actions",
                ].map((h) => (
                  <th key={h} className="px-6 py-4 text-center text-[16px]]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="text-center">
              {filteredVendors.map((v) => (
                <tr key={v._id} className="shadow-sm hover:bg-green-50">
                  <td className="px-6 py-4">{v.crNo}</td>
                  <td className="px-6 py-4">{v.shopId}</td>
                  <td className="px-6 py-4">{v.floorNo}</td>
                  <td className="px-6 py-4">{v.companyName}</td>
                  <td className="px-6 py-4">{v.contactPerson}</td>
                  <td className="px-6 py-4">{v.mobile}</td>

                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleVendorStatus(v._id)}
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
                        onClick={() => {
                          setEditId(v._id);
                          setForm({
                            crNo: v.crNo,
                            companyName: v.companyName,
                            contactPerson: v.contactPerson,
                            mobile: v.mobile,
                            shopId: v.shopId,
                            floorNo: v.floorNo,
                          });
                          setShowAdd(true);
                        }}
                        className="text-emerald-600"
                      >
                        <Pencil size={18} />
                      </button>

                      <button
                        onClick={() => {
                          setSelected(v);
                          setConfirmDelete(true);
                        }}
                        className="text-red-600"
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

      {/* MOBILE CARDS */}
      <div className="sm:hidden px-4 space-y-4">
        {filteredVendors.map((v) => (
          <div key={v._id} className="bg-white p-4 rounded-xl shadow space-y-2">
            <div className="flex justify-between">
              <h3 className="font-medium">{v.companyName}</h3>
              <button
                onClick={() => toggleVendorStatus(v._id)}
                className={`text-xs px-3 py-1 rounded-full ${
                  v.status === "active"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-gray-200"
                }`}
              >
                {v.status}
              </button>
            </div>

            <p className="text-sm">
              <b>Reg:</b> {v.crNo}
            </p>
            <p className="text-sm">
              <b>Shop:</b> {v.shopId} | <b>Floor:</b> {v.floorNo}
            </p>
            <p className="text-sm">
              <b>Contact:</b> {v.contactPerson}
            </p>
            <p className="text-sm">
              <b>Mobile:</b> {v.mobile}
            </p>

            <div className="flex justify-end gap-4 pt-2">
              <Pencil
                className="text-emerald-600"
                onClick={() => {
                  setEditId(v._id);
                  setForm(v);
                  setShowAdd(true);
                }}
              />
              <Trash2
                className="text-red-600"
                onClick={() => {
                  setSelected(v);
                  setConfirmDelete(true);
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* MODALS */}
      {showAdd && (
        <Modal
          title={editId ? "Edit Vendor" : "Add Vendor"}
          onClose={closeModal}
          onSubmit={editId ? updateVendor : submitVendor}
          form={form}
          setForm={setForm}
          errors={errors}
        />
      )}

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
  <div className="bg-teal-50 border border-green-600 rounded-2xl shadow-md p-6">
    <div className="flex justify-between mb-2">
      <p className="text-gray-500">{title}</p>
      <Icon size={18} className="text-emerald-600" />
    </div>
    <p className="text-2xl font-semibold">{value}</p>
  </div>
);

const Modal = ({ title, onClose, onSubmit, form, setForm, errors }) => (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl w-full max-w-md">
      <div className="px-6 py-4 border-b flex justify-between">
        <h2 className="font-semibold">{title}</h2>
        <X onClick={onClose} className="cursor-pointer" />
      </div>

      <div className="p-6 space-y-4">
        {[
          "companyName",
          "crNo",
          "contactPerson",
          "mobile",
          "shopId",
          "floorNo",
        ].map((f) => (
          <Field
            key={f}
            label={f}
            name={f}
            form={form}
            setForm={setForm}
            error={errors[f]}
          />
        ))}
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

const Field = ({ label, name, form, setForm, error }) => (
  <div>
    <label className="block text-gray-600 mb-1">{label}</label>
    <input
      value={form[name] || ""}
      onChange={(e) => setForm({ ...form, [name]: e.target.value })}
      className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500"
    />
    {error && (
      <p className="text-red-500 text-xs mt-1">{error}</p>
    )}
  </div>
);
