"use client";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import {
  Search, Plus, Users, Activity, Trash2, Pencil, X,
  Building2, Tag, Phone, Hash, Layers, ChevronDown,
  MapPin, Filter
} from "lucide-react";
import axios from "axios";
import * as yup from "yup";

/* ================= YUP VALIDATION (UNCHANGED) ================= */
const vendorSchema = yup.object().shape({
  companyName: yup.string().matches(/^[A-Za-z ]+$/, "Only alphabets allowed").required("Company name is required"),
  contactPerson: yup.string().matches(/^[A-Za-z ]+$/, "Only alphabets allowed").required("Contact person is required"),
  mobile: yup.string().matches(/^[0-9]{10,15}$/, "Only numbers (10–15 digits)").required("Mobile number is required"),
  shopId: yup.string().matches(/^[A-Za-z0-9]+$/, "Only letters & numbers allowed").required("Shop ID is required"),
  Category: yup.string().required("Category is required"),
  floorNo: yup.string().matches(/^[0-9]+$/, "Only numbers allowed").required("Floor number is required"),
  crNo: yup.string().matches(/^[A-Za-z0-9]+$/, "Only letters & numbers allowed").required("Registration number is required"),
});

export default function VendorManagement() {
  const [vendors, setVendors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categorySearch, setCategorySearch] = useState("");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [form, setForm] = useState({
    companyName: "", contactPerson: "", mobile: "",
    shopId: "", Category: "", floorNo: "", crNo: "",
  });
  const [errors, setErrors] = useState({});

  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  /* ================= FETCH (UNCHANGED) ================= */
  useEffect(() => { fetchVendors(); fetchCategories(); }, []);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/vendors`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVendors(res.data.vendors || []);
    } catch (err) { console.error("Fetch failed", err); }
    finally { setLoading(false); }
  };

  const fetchCategories = async () => {
    const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/vendors/categories/list`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setCategories(res.data.categories || []);
  };

  /* ================= FILTER ================= */
  const filteredVendors = vendors.filter((v) => {
    const matchSearch = [v.companyName, v.contactPerson, v.mobile, v.shopId, v.crNo]
      .join(" ").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || v.status === statusFilter;
    const matchCat = categoryFilter === "all" || v.Category === categoryFilter;
    return matchSearch && matchStatus && matchCat;
  });

  /* ================= VALIDATION (UNCHANGED) ================= */
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

  /* ================= CRUD (UNCHANGED) ================= */
  const submitVendor = async () => {
    if (!(await validateForm())) return;
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/vendors`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Tenant created successfully");
      closeModal(); fetchVendors();
    } catch (err) {
      if (err.response?.status === 400) toast.error(err.response.data.message);
      else toast.error("Failed to create Tenant");
    }
  };

  const updateVendor = async () => {
    if (!(await validateForm())) return;
    await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/vendors/${editId}`, form, {
      headers: { Authorization: `Bearer ${token}` },
    });
    closeModal(); fetchVendors();
  };

  const toggleVendorStatus = async (id) => {
    await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/vendors/${id}/status`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchVendors();
  };

  const deleteVendor = async () => {
    await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/vendors/${selected._id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setConfirmDelete(false); fetchVendors();
  };

  const closeModal = () => {
    setShowAdd(false); setEditId(null); setErrors({});
    setCategorySearch(""); setShowCategoryDropdown(false);
    setForm({ companyName: "", Category: "", contactPerson: "", mobile: "", shopId: "", floorNo: "", crNo: "" });
  };

  /* ================= STATS ================= */
  const totalTenants = vendors.length;
  const activeTenants = vendors.filter(v => v.status === "active").length;
  const uniqueCategories = [...new Set(vendors.map(v => v.Category).filter(Boolean))].length;
  const uniqueFloors = [...new Set(vendors.map(v => v.floorNo).filter(Boolean))].length;

  return (
    <div className="min-h-screen bg-emerald-50/60">

      {/* ── HEADER ── */}
      <div className="bg-white border-b border-emerald-100 px-4 sm:px-8 py-5 shadow-sm sticky top-0 z-30">
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-emerald-800">Tenant Management</h1>
            <p className="text-sm text-emerald-500 mt-0.5">Manage and monitor all registered tenants</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" size={15} />
              <input
                className="w-full sm:w-64 bg-white border border-emerald-200 pl-9 pr-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                placeholder="Search tenants..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium text-sm transition shadow-sm hover:shadow-md"
            >
              <Plus size={16} /> Add Tenant
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-8 py-6 space-y-6">

        {/* ── STATS ROW ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Tenants" value={totalTenants} icon={Users} sub="Registered tenants" />
          <StatCard title="Active Tenants" value={activeTenants} icon={Activity} sub={`${totalTenants - activeTenants} inactive`} accent={totalTenants - activeTenants > 0 ? "orange" : "emerald"} />
          <StatCard title="Categories" value={uniqueCategories} icon={Tag} sub="Unique categories" />
          <StatCard title="Floors Covered" value={uniqueFloors} icon={Layers} sub="Unique floor levels" />
        </div>

        {/* ── FILTERS BAR ── */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
            <Filter size={13} /> Filters:
          </div>

          {/* Status filter */}
          <div className="flex gap-1.5">
            {["all", "active", "inactive"].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition capitalize ${
                  statusFilter === s
                    ? "bg-emerald-600 text-white"
                    : "bg-white text-emerald-600 border border-emerald-200 hover:bg-emerald-50"
                }`}
              >
                {s === "all" ? "All Status" : s}
              </button>
            ))}
          </div>

          {/* Category filter */}
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="bg-white border border-emerald-200 text-sm text-emerald-700 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Categories</option>
            {categories.map(c => (
              <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>

          {(statusFilter !== "all" || categoryFilter !== "all" || search) && (
            <button
              onClick={() => { setStatusFilter("all"); setCategoryFilter("all"); setSearch(""); }}
              className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1 underline"
            >
              <X size={11} /> Clear filters
            </button>
          )}

          <span className="ml-auto text-xs text-emerald-500">
            {filteredVendors.length} of {totalTenants} tenants
          </span>
        </div>

        {/* ── DESKTOP TABLE ── */}
        <div className="hidden sm:block bg-white rounded-xl border border-emerald-100 shadow-sm overflow-hidden">
          <table className="min-w-[800px] w-full">
            <thead>
              <tr className="bg-emerald-50 border-b border-emerald-100">
                {["Reg. No", "Shop ID", "Floor", "Company", "Category", "Contact Person", "Mobile", "Status", "Actions"].map(h => (
                  <th key={h} className="px-5 py-3.5 text-center text-xs font-semibold text-emerald-700 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-50">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="animate-spin w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full" />
                      <p className="text-xs text-emerald-500">Loading tenants...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredVendors.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <Building2 size={32} className="text-emerald-200" />
                      <p className="text-sm">No tenants found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredVendors.map((v) => (
                  <tr key={v._id} className="hover:bg-emerald-50/60 transition group text-center">
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-100">
                        {v.crNo}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-xs font-semibold text-emerald-800">{v.shopId}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                        <MapPin size={11} /> {v.floorNo}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-700 flex-shrink-0">
                          {v.companyName?.charAt(0)?.toUpperCase()}
                        </div>
                        <span className="font-medium text-emerald-800 text-sm">{v.companyName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100 capitalize">
                        {v.Category}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">{v.contactPerson}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">{v.mobile}</td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => toggleVendorStatus(v._id)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition hover:opacity-80 ${
                          v.status === "active"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {v.status}
                      </button>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-center gap-2 opacity-70 group-hover:opacity-100 transition">
                        <button
                          onClick={() => {
                            setEditId(v._id);
                            setForm({ crNo: v.crNo, companyName: v.companyName, Category: v.Category, contactPerson: v.contactPerson, mobile: v.mobile, shopId: v.shopId, floorNo: v.floorNo });
                            setCategorySearch(v.Category);
                            setShowAdd(true);
                          }}
                          className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-100 transition"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => { setSelected(v); setConfirmDelete(true); }}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {!loading && filteredVendors.length > 0 && (
            <div className="px-5 py-3 bg-emerald-50/50 border-t border-emerald-100 text-xs text-emerald-500">
              Showing {filteredVendors.length} tenant{filteredVendors.length !== 1 ? "s" : ""}
            </div>
          )}
        </div>

        {/* ── MOBILE CARDS ── */}
        <div className="sm:hidden space-y-3">
          {filteredVendors.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Building2 size={32} className="mx-auto mb-2 text-emerald-200" />
              <p className="text-sm">No tenants found</p>
            </div>
          )}
          {filteredVendors.map((v) => (
            <div key={v._id} className="bg-white rounded-xl border border-emerald-100 shadow-sm p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-sm font-bold text-emerald-700">
                    {v.companyName?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-emerald-800">{v.companyName}</p>
                    <span className="text-xs text-emerald-500 capitalize">{v.Category}</span>
                  </div>
                </div>
                <button
                  onClick={() => toggleVendorStatus(v._id)}
                  className={`text-xs px-3 py-1 rounded-full font-medium ${
                    v.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"
                  }`}
                >
                  {v.status}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                <div>
                  <p className="text-xs text-gray-400 font-medium">Reg No</p>
                  <p className="font-mono text-xs text-emerald-700">{v.crNo}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">Shop ID</p>
                  <p className="font-mono text-emerald-700 font-semibold">{v.shopId}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">Floor</p>
                  <p className="text-gray-700">{v.floorNo}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">Mobile</p>
                  <p className="text-gray-700">{v.mobile}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-400 font-medium">Contact Person</p>
                  <p className="text-gray-700">{v.contactPerson}</p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1 border-t border-emerald-50">
                <button
                  onClick={() => {
                    setEditId(v._id);
                    setForm({ crNo: v.crNo, companyName: v.companyName, Category: v.Category, contactPerson: v.contactPerson, mobile: v.mobile, shopId: v.shopId, floorNo: v.floorNo });
                    setCategorySearch(v.Category);
                    setShowAdd(true);
                  }}
                  className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => { setSelected(v); setConfirmDelete(true); }}
                  className="p-2 rounded-lg text-red-500 hover:bg-red-50"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* ── MODALS ── */}
      {showAdd && (
        <Modal
          title={editId ? "Edit Tenant" : "Add New Tenant"}
          onClose={closeModal}
          onSubmit={editId ? updateVendor : submitVendor}
          form={form} setForm={setForm} errors={errors}
          categories={categories}
          categorySearch={categorySearch} setCategorySearch={setCategorySearch}
          showCategoryDropdown={showCategoryDropdown} setShowCategoryDropdown={setShowCategoryDropdown}
        />
      )}

      {confirmDelete && (
        <ConfirmDelete onCancel={() => setConfirmDelete(false)} onDelete={deleteVendor} />
      )}
    </div>
  );
}

/* ================= STAT CARD ================= */
const StatCard = ({ title, value, icon: Icon, sub, accent = "emerald" }) => (
  <div className={`bg-white rounded-xl border shadow-sm p-5 hover:shadow-md transition-shadow ${
    accent === "orange" ? "border-orange-100" : "border-emerald-100"
  }`}>
    <div className="flex justify-between items-start mb-3">
      <div className={`p-2 rounded-lg ${accent === "orange" ? "bg-orange-50" : "bg-emerald-50"}`}>
        <Icon className={`w-4 h-4 ${accent === "orange" ? "text-orange-500" : "text-emerald-600"}`} />
      </div>
    </div>
    <p className={`text-2xl font-bold mb-0.5 ${accent === "orange" ? "text-orange-700" : "text-emerald-800"}`}>
      {value}
    </p>
    <p className={`text-sm font-medium ${accent === "orange" ? "text-orange-500" : "text-emerald-600"}`}>{title}</p>
    {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
  </div>
);

/* ================= ADD/EDIT MODAL ================= */
const Modal = ({ title, onClose, onSubmit, form, setForm, errors, categories, categorySearch, setCategorySearch, showCategoryDropdown, setShowCategoryDropdown }) => (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
      {/* Modal Header */}
      <div className="flex justify-between items-center px-6 py-4 border-b border-emerald-100 bg-emerald-50/50">
        <div>
          <h2 className="font-bold text-emerald-800">{title}</h2>
          <p className="text-xs text-emerald-500 mt-0.5">Fill in all required fields</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-emerald-100 rounded-lg transition text-emerald-600">
          <X size={18} />
        </button>
      </div>

      {/* Modal Body */}
      <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Company Name" name="companyName" form={form} setForm={setForm} error={errors.companyName} icon={<Building2 size={13} />} />
          <Field label="Registration No" name="crNo" form={form} setForm={setForm} error={errors.crNo} icon={<Hash size={13} />} />
          <Field label="Contact Person" name="contactPerson" form={form} setForm={setForm} error={errors.contactPerson} icon={<Users size={13} />} />
          <Field label="Mobile" name="mobile" form={form} setForm={setForm} error={errors.mobile} icon={<Phone size={13} />} />
          <Field label="Shop ID" name="shopId" form={form} setForm={setForm} error={errors.shopId} icon={<Hash size={13} />} />
          <Field label="Floor No" name="floorNo" form={form} setForm={setForm} error={errors.floorNo} icon={<Layers size={13} />} />
        </div>

        {/* Category dropdown — full width */}
        <div className="relative">
          <label className="block text-sm font-medium text-emerald-700 mb-1.5 flex items-center gap-1">
            <Tag size={13} /> Category
          </label>
          <div className="relative">
            <input
              type="text"
              value={categorySearch}
              onFocus={() => setShowCategoryDropdown(true)}
              onChange={(e) => { setCategorySearch(e.target.value); setForm({ ...form, Category: e.target.value }); setShowCategoryDropdown(true); }}
              placeholder="Select or type a category..."
              className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:outline-none transition pr-9 ${
                errors.Category ? "border-red-400 focus:ring-red-400" : "border-emerald-200 focus:ring-emerald-500"
              }`}
            />
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400 pointer-events-none" />
          </div>

          {showCategoryDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-emerald-100 rounded-lg shadow-xl max-h-48 overflow-auto z-50">
              {categories.filter(c => c.toLowerCase().includes(categorySearch.toLowerCase())).map(c => (
                <div
                  key={c}
                  onClick={() => { setForm({ ...form, Category: c }); setCategorySearch(c); setShowCategoryDropdown(false); }}
                  className="px-4 py-2.5 hover:bg-emerald-50 cursor-pointer text-sm text-emerald-700 capitalize border-b border-emerald-50 last:border-0 transition"
                >
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </div>
              ))}
              {categorySearch && !categories.some(c => c.toLowerCase() === categorySearch.toLowerCase()) && (
                <div
                  onClick={() => { const nc = categorySearch.trim().toLowerCase(); setForm({ ...form, Category: nc }); setCategorySearch(nc); setShowCategoryDropdown(false); }}
                  className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 cursor-pointer text-sm text-emerald-700 font-medium transition"
                >
                  ➕ Add "{categorySearch}" as new category
                </div>
              )}
            </div>
          )}
          {errors.Category && <p className="text-red-500 text-xs mt-1">{errors.Category}</p>}
        </div>
      </div>

      {/* Modal Footer */}
      <div className="px-6 py-4 border-t border-emerald-100 bg-gray-50/50 flex justify-end gap-3">
        <button onClick={onClose} className="px-4 py-2 rounded-lg text-emerald-600 hover:bg-emerald-50 border border-emerald-200 text-sm font-medium transition">
          Cancel
        </button>
        <button onClick={onSubmit} className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition shadow-sm">
          {/* label changes based on context set by parent */}
          Save Tenant
        </button>
      </div>
    </div>
  </div>
);

/* ================= CONFIRM DELETE ================= */
const ConfirmDelete = ({ onCancel, onDelete }) => (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
          <Trash2 size={18} className="text-red-600" />
        </div>
        <h3 className="font-bold text-emerald-800">Delete Tenant?</h3>
      </div>
      <p className="text-sm text-gray-500 mb-5">This action cannot be undone. All data for this tenant will be permanently removed.</p>
      <div className="flex justify-end gap-3">
        <button onClick={onCancel} className="px-4 py-2 rounded-lg text-emerald-600 border border-emerald-200 hover:bg-emerald-50 text-sm transition">Cancel</button>
        <button onClick={onDelete} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition">Delete</button>
      </div>
    </div>
  </div>
);

/* ================= FIELD ================= */
const Field = ({ label, name, form, setForm, error, icon }) => (
  <div>
    <label className="block text-sm font-medium text-emerald-700 mb-1.5 flex items-center gap-1">
      {icon && <span className="text-emerald-400">{icon}</span>}
      {label}
    </label>
    <input
      value={form[name] || ""}
      onChange={(e) => setForm({ ...form, [name]: e.target.value })}
      className={`w-full border rounded-lg px-3 py-2.5 text-sm transition focus:outline-none focus:ring-2 ${
        error ? "border-red-400 focus:ring-red-400" : "border-emerald-200 focus:ring-emerald-500"
      }`}
    />
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);