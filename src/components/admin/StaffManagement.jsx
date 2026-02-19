"use client";
import { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Filter,
  Users,
  Activity,
  X,
  Pencil,
  Trash2,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  MapPin,
  ShieldOff,
  ShieldCheck,
  ChevronDown,
  UserX,
} from "lucide-react";

export default function StaffManagement() {
  const [staff, setStaff] = useState([]);
  const [entries, setEntries] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [bays, setBays] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [nameFilter, setNameFilter] = useState("all");
  const [editId, setEditId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [activeTab, setActiveTab] = useState("all"); // "all" | "rejected"

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    assignedBay: "",
    password: "",
  });
  const [errors, setErrors] = useState({});

  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [staffRes, bayRes, entryRes, supRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/staff`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/bays`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/entries`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/supervisors`, { headers }),
      ]);

      const staffData = await staffRes.json();
      const bayData = await bayRes.json();
      const entryData = await entryRes.json();
      const supData = await supRes.json();

      setStaff(staffData.staff || []);
      setBays(bayData.bays || bayData || []);
      setEntries(entryData.entries || []);
      setSupervisors(supData.supervisors || []);
      setSelected(staffData.staff?.[0] || null);
    } catch (err) {
      console.error("Fetch data error:", err);
    }
  };

  const getBayName = (bay) => {
    if (!bay) return "-";
    if (typeof bay === "object") return bay.bayName || "-";
    const found = bays.find((b) => b._id === bay);
    return found ? found.bayName : "-";
  };

  const getSupervisorName = (assignedBay) => {
    if (!assignedBay) return "—";
    const bayId = String(
      typeof assignedBay === "object" ? assignedBay?._id : assignedBay
    );
    const supervisor = supervisors.find((sup) => {
      const managedBays = sup.managedBays || [];
      return managedBays.some((b) => {
        const bId = String(typeof b === "object" ? b?._id : b);
        return bId === bayId;
      });
    });
    return supervisor?.name || "—";
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = "Invalid email";
    if (!form.phone.trim()) newErrors.phone = "Phone is required";
    else if (!/^[0-9]{10}$/.test(form.phone))
      newErrors.phone = "Phone must be 10 digits";
    if (!form.assignedBay) newErrors.assignedBay = "Assigned bay is required";
    if (!editId && !form.password) newErrors.password = "Password is required";
    else if (!editId && form.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveStaff = async () => {
    if (!validateForm()) return;

    try {
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      if (editId) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/staff/${editId}`, {
          method: "PUT",
          headers,
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            phone: form.phone,
            assignedBay: form.assignedBay,
          }),
        });
        alert("Guard updated successfully");
      } else {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/staff`, {
          method: "POST",
          headers,
          body: JSON.stringify(form),
        });
        alert("Guard created successfully");
      }

      setShowAdd(false);
      setEditId(null);
      setErrors({});
      setForm({
        name: "",
        email: "",
        phone: "",
        assignedBay: "",
        password: "",
      });
      fetchData();
    } catch (err) {
      alert("Failed to save Guard");
    }
  };

  const toggleStaffStatus = async (id) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/staff/${id}/status`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchData();
    } catch (err) {
      console.error("Toggle Guard status error:", err);
    }
  };

  const deleteStaff = async () => {
    if (!selected) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/staff/${selected._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setConfirmDelete(false);
      setSelected(null);
      fetchData();
    } catch (err) {
      alert("Delete failed");
    }
  };

  const openDetail = (staffMember) => {
    const bayId =
      typeof staffMember.assignedBay === "object"
        ? staffMember.assignedBay?._id
        : staffMember.assignedBay;

    const supervisor = supervisors.find((sup) => {
      const managedBays = sup.managedBays || [];
      return managedBays.some((b) => {
        const bId = String(typeof b === "object" ? b?._id : b);
        return bId === String(bayId);
      });
    });

    const staffEntries = entries.filter((e) => {
      const entryStaffId =
        typeof e.createdBy === "object" ? e.createdBy?._id : e.createdBy;
      return entryStaffId === staffMember._id;
    });

    const totalEntriesRecorded = staffEntries.length;
    const todayEntries = staffEntries.filter((e) => {
      const entryDate = new Date(e.createdAt);
      const today = new Date();
      return entryDate.toDateString() === today.toDateString();
    }).length;

    const validEntries = staffEntries.filter((e) => e.processingTimeMs > 1000);
const avgMs = validEntries.length
  ? validEntries.reduce((sum, e) => sum + e.processingTimeMs, 0) / validEntries.length
  : 0;
const avgSec = Math.round(avgMs / 1000);
const avgProcessingTime = validEntries.length === 0
  ? "N/A"
  : avgSec < 60
  ? `${avgSec}s`
  : `${Math.floor(avgSec / 60)}m ${avgSec % 60}s`;

    const entryHistory = staffEntries
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map((e) => ({
        date: new Date(e.createdAt).toLocaleDateString("en-GB"),
        time: new Date(e.createdAt).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        visitor: e.visitorName || "N/A",
        vehicleNumber: e.vehicleNumber || "—",
        bay: getBayName(e.bayId),
        method: e.entryMethod || "Manual",
      }));

    const activities = staffEntries
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map((e) => {
        const isEntry = !e.outTime;
        const action = isEntry
          ? `Approved ${e.entryMethod || "manual"} entry for ${
              e.visitorName || e.vehicleNumber
            }`
          : `Completed exit for ${e.visitorName || e.vehicleNumber}`;

        return {
          time: new Date(e.createdAt).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          action,
          bay: getBayName(e.bayId),
        };
      });

    setDetailData({
      ...staffMember,
      supervisor: supervisor?.name || "—",
      totalEntriesRecorded,
      todayEntries,
      avgProcessingTime, // already formatted as string
      entryHistory,
      activities,
    });
    setShowDetail(true);
  };

  // Separate active/rejected staff
  const activeStaff = staff.filter((s) => s.approvalStatus !== "rejected");
  const rejectedStaff = staff.filter((s) => s.approvalStatus === "rejected");

  const sourceStaff = activeTab === "rejected" ? rejectedStaff : activeStaff;

  const filtered = sourceStaff.filter((s) => {
    const matchesSearch = s.name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && s.isActive) ||
      (statusFilter === "inactive" && !s.isActive);
    const matchesName = nameFilter === "all" || s.name === nameFilter;
    return matchesSearch && matchesStatus && matchesName;
  });

  return (
    <div className="min-h-screen bg-emerald-50/60">
      {/* HEADER */}
      <div className="sticky top-0 z-40 bg-white border-b border-emerald-100 shadow-sm px-4 sm:px-8 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-emerald-800">
              Guard Management
            </h1>
            <p className="text-sm text-emerald-600 mt-1">
              Manage security Guards and supervisors
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-auto">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400"
              />
              <input
                placeholder="Search Guards"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 h-10 w-full sm:w-64 rounded-lg border border-emerald-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              onClick={() => setShowFilters((p) => !p)}
              className={`flex items-center gap-2 px-4 h-10 rounded-lg border text-sm transition ${
                showFilters
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "border-emerald-200 bg-white hover:bg-emerald-50"
              }`}
            >
              <Filter size={16} />
              Filters
              <ChevronDown
                size={14}
                className={`transition-transform ${showFilters ? "rotate-180" : ""}`}
              />
            </button>

            {activeTab === "all" && (
              <button
                onClick={() => {
                  setEditId(null);
                  setErrors({});
                  setForm({
                    name: "",
                    email: "",
                    phone: "",
                    assignedBay: "",
                    password: "",
                  });
                  setShowAdd(true);
                }}
                className="flex items-center gap-2 px-4 h-10 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition shadow-sm hover:shadow-md"
              >
                <Plus size={16} />
                Add Guard
              </button>
            )}
          </div>
        </div>
      </div>

      {/* FILTER PANEL */}
      {showFilters && (
        <div className="bg-white border-b border-emerald-100 px-4 sm:px-8 py-4 flex flex-col sm:flex-row gap-4 text-sm">
          <div>
            <label className="block text-emerald-700 font-medium mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-emerald-200 rounded-lg px-3 py-2 w-full sm:w-40 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div>
            <label className="block text-emerald-700 font-medium mb-1">
              Guard Name
            </label>
            <select
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              className="border border-emerald-200 rounded-lg px-3 py-2 w-full sm:w-48 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All</option>
              {sourceStaff.map((s) => (
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-6">
          <Stat title="Total Guards" value={activeStaff.length} icon={Users} color="emerald" />
          <Stat
            title="Active Guards"
            value={activeStaff.filter((s) => s.isActive).length}
            icon={Activity}
            color="emerald"
          />
          <Stat
            title="Assigned Bays"
            value={
              new Set(
                activeStaff.map((s) => getBayName(s.assignedBay)).filter(Boolean)
              ).size
            }
            icon={MapPin}
            color="emerald"
          />
          <Stat
            title="Rejected Guards"
            value={rejectedStaff.length}
            icon={UserX}
            color="red"
          />
        </div>

        {/* TABS */}
        <div className="flex items-center gap-1 mb-5 bg-white rounded-xl border border-emerald-100 p-1 shadow-sm w-fit">
          <button
            onClick={() => {
              setActiveTab("all");
              setSearch("");
              setStatusFilter("all");
              setNameFilter("all");
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === "all"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-emerald-700 hover:bg-emerald-50"
            }`}
          >
            <ShieldCheck size={15} />
            All Guards
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                activeTab === "all"
                  ? "bg-white/20 text-white"
                  : "bg-emerald-100 text-emerald-700"
              }`}
            >
              {activeStaff.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab("rejected");
              setSearch("");
              setStatusFilter("all");
              setNameFilter("all");
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === "rejected"
                ? "bg-red-500 text-white shadow-sm"
                : "text-red-600 hover:bg-red-50"
            }`}
          >
            <ShieldOff size={15} />
            Rejected Guards
            {rejectedStaff.length > 0 && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                  activeTab === "rejected"
                    ? "bg-white/20 text-white"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {rejectedStaff.length}
              </span>
            )}
          </button>
        </div>

        {/* Rejected Banner */}
        {activeTab === "rejected" && (
          <div className="mb-5 bg-red-50 border border-red-200 rounded-xl px-5 py-3.5 flex items-start gap-3">
            <AlertCircle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-red-700">Rejected Guard Members</p>
              <p className="text-xs text-red-500 mt-0.5">
                These guard members have been rejected. You can view their full details but they cannot be assigned to bays.
              </p>
            </div>
          </div>
        )}

        {/* TABLE */}
        <div className="hidden md:block bg-white rounded-xl border border-emerald-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className={activeTab === "rejected" ? "bg-red-50" : "bg-emerald-50"}>
              <tr>
                {["Name", "Email", "Phone", "Bay", "Supervisor", "Status", ...(activeTab === "all" ? ["Action"] : ["Rejection Reason"])].map(
                  (h) => (
                    <th
                      key={h}
                      className={`px-6 py-4 text-sm font-semibold text-center ${
                        activeTab === "rejected" ? "text-red-700" : "text-emerald-700"
                      }`}
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-emerald-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-gray-400">
                      {activeTab === "rejected" ? (
                        <ShieldOff size={36} className="text-red-200" />
                      ) : (
                        <Users size={36} className="text-emerald-200" />
                      )}
                      <p className="text-sm font-medium">
                        {activeTab === "rejected"
                          ? "No rejected guards found"
                          : "No guards found"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr
                    key={s._id}
                    onClick={() => openDetail(s)}
                    className={`cursor-pointer text-center transition group ${
                      activeTab === "rejected"
                        ? "hover:bg-red-50/50"
                        : "hover:bg-emerald-50/70"
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                            activeTab === "rejected"
                              ? "bg-red-100 text-red-600"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {s.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <span className="font-medium text-emerald-800">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{s.email}</td>
                    <td className="px-6 py-4 text-gray-600">{s.phone}</td>
                    <td className="px-6 py-4 text-gray-600">{getBayName(s.assignedBay)}</td>
                    <td className="px-6 py-4 text-gray-600">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-700 flex-shrink-0">
                          {getSupervisorName(s.assignedBay).charAt(0).toUpperCase()}
                        </span>
                        {getSupervisorName(s.assignedBay)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {activeTab === "rejected" ? (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-600">
                          Rejected
                        </span>
                      ) : (
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleStaffStatus(s._id);
                          }}
                          className={`cursor-pointer px-3 py-1 rounded-full text-xs font-medium transition hover:opacity-80 ${
                            s.isActive
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {s.isActive ? "Active" : "Inactive"}
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      {activeTab === "rejected" ? (
                        <span className="text-sm text-red-500 italic">
                          {s.rejectionReason || "—"}
                        </span>
                      ) : (
                        <div className="flex justify-center gap-3">
                          <button
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-100 transition"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditId(s._id);
                              setForm({
                                name: s.name,
                                email: s.email,
                                phone: s.phone,
                                assignedBay:
                                  typeof s.assignedBay === "object"
                                    ? s.assignedBay?._id
                                    : s.assignedBay || "",
                                password: "",
                              });
                              setShowAdd(true);
                            }}
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-100 transition"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelected(s);
                              setConfirmDelete(true);
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div
            className={`px-5 py-3 text-sm flex items-center justify-between border-t ${
              activeTab === "rejected"
                ? "bg-red-50 border-red-100 text-red-600"
                : "bg-emerald-50 border-emerald-100 text-emerald-600"
            }`}
          >
            <span>
              Showing <span className="font-semibold">{filtered.length}</span>{" "}
              {activeTab === "rejected" ? "rejected " : ""}guard member{filtered.length !== 1 ? "s" : ""}
            </span>
            {activeTab === "rejected" && filtered.length > 0 && (
              <span className="text-xs text-red-400">Click on any row to view full details</span>
            )}
          </div>
        </div>

        {/* MOBILE STAFF LIST */}
        <div className="md:hidden space-y-3">
          {filtered.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-16 text-gray-400">
              {activeTab === "rejected" ? (
                <ShieldOff size={36} className="text-red-200" />
              ) : (
                <Users size={36} className="text-emerald-200" />
              )}
              <p className="text-sm">
                {activeTab === "rejected" ? "No rejected guards" : "No guards found"}
              </p>
            </div>
          )}

          {filtered.map((s) => (
            <div
              key={s._id}
              onClick={() => openDetail(s)}
              className={`bg-white rounded-xl border shadow-sm p-4 space-y-3 cursor-pointer transition ${
                activeTab === "rejected"
                  ? "border-red-100 hover:shadow-red-100"
                  : "border-emerald-100 hover:shadow-md"
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${
                      activeTab === "rejected" || s.approvalStatus === "rejected"
                        ? "bg-red-100 text-red-600"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {s.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-emerald-800">{s.name}</p>
                    <p className="text-xs text-gray-500">{s.email}</p>
                  </div>
                </div>

                {activeTab === "rejected" ? (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-600">
                    Rejected
                  </span>
                ) : (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleStaffStatus(s._id);
                    }}
                    className={`cursor-pointer px-3 py-1 rounded-full text-xs font-medium ${
                      s.isActive
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {s.isActive ? "Active" : "Inactive"}
                  </span>
                )}
              </div>

              {/* Info grid - 2 columns */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Phone</p>
                  <p className="text-gray-700 font-medium">{s.phone}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Bay</p>
                  <p className="text-gray-700 font-medium">{getBayName(s.assignedBay)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Supervisor</p>
                  <p className="text-gray-700 font-medium flex items-center gap-1">
                    {getSupervisorName(s.assignedBay) !== "—" && (
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        activeTab === "rejected" ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-700"
                      }`}>
                        {getSupervisorName(s.assignedBay).charAt(0).toUpperCase()}
                      </span>
                    )}
                    {getSupervisorName(s.assignedBay)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Email</p>
                  <p className="text-gray-700 font-medium truncate">{s.email}</p>
                </div>
              </div>

              {/* Rejection reason for rejected tab */}
              {activeTab === "rejected" && s.rejectionReason && (
                <div className="bg-red-50 rounded-lg px-3 py-2 border border-red-100">
                  <p className="text-xs text-red-400 font-medium uppercase tracking-wide mb-0.5">Rejection Reason</p>
                  <p className="text-sm text-red-600 italic">{s.rejectionReason}</p>
                </div>
              )}

              {activeTab === "all" && (
                <div className="flex justify-end gap-3 pt-1 border-t border-emerald-50">
                  <button
                    className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditId(s._id);
                      setForm({
                        name: s.name,
                        email: s.email,
                        phone: s.phone,
                        assignedBay:
                          typeof s.assignedBay === "object"
                            ? s.assignedBay?._id
                            : s.assignedBay || "",
                        password: "",
                      });
                      setShowAdd(true);
                    }}
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelected(s);
                      setConfirmDelete(true);
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* MODALS */}
      {showAdd && (
        <AddStaffModal
          editId={editId}
          form={form}
          setForm={setForm}
          errors={errors}
          bays={bays}
          onClose={() => {
            setShowAdd(false);
            setEditId(null);
            setErrors({});
            setForm({
              name: "",
              email: "",
              phone: "",
              assignedBay: "",
              password: "",
            });
          }}
          onSubmit={saveStaff}
        />
      )}

      {confirmDelete && (
        <ConfirmDelete
          onCancel={() => setConfirmDelete(false)}
          onDelete={deleteStaff}
        />
      )}

      {showDetail && detailData && (
        <DetailPopup
          data={detailData}
          onClose={() => setShowDetail(false)}
          getBayName={getBayName}
        />
      )}
    </div>
  );
}

/* ================= DETAIL POPUP ================= */
function DetailPopup({ data, onClose, getBayName }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl my-8">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-6 rounded-t-2xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full p-2 transition"
          >
            <X size={20} />
          </button>
          <div className="flex items-start gap-4">
            <div className="bg-white/20 p-3 rounded-full">
              <User size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{data.name}</h2>
              <p className="text-emerald-100 text-sm mt-1">
                {data.phone} • {data.email}
              </p>
              <p className="text-emerald-100 text-sm">
                Bay: {getBayName(data.assignedBay)}
              </p>
              <div className="flex gap-2 mt-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    data.approvalStatus === "rejected"
                      ? "bg-red-400 text-red-900"
                      : data.isActive
                      ? "bg-emerald-400 text-emerald-900"
                      : "bg-gray-400 text-gray-900"
                  }`}
                >
                  {data.approvalStatus === "rejected"
                      ? "Rejected"
                      : data.isActive
                      ? "Active"
                      : "Inactive"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Stats Grid */}
          <div>
            <h3 className="text-sm font-semibold text-emerald-800 mb-3">
              Guard details
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <InfoBox label="Mobile number" value={data.phone} />
              <InfoBox label="Access level" value="Security Guard" />
              <InfoBox label="Supervisor" value={data.supervisor} />
              <InfoBox
                label="Designation"
                value={data.designation || "Security Guard"}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <StatBox
                label="Total entries recorded"
                value={data.totalEntriesRecorded}
                color="bg-emerald-50"
              />
              <StatBox
                label="Avg. processing time"
                value={data.avgProcessingTime}
                color="bg-blue-50"
              />
              <StatBox
                label="Today's entries"
                value={data.todayEntries}
                color="bg-orange-50"
              />
            </div>
          </div>

          {/* Entry History */}
          <div>
            <h3 className="text-sm font-semibold text-emerald-800 mb-3">
              Entry history (recent)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-emerald-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-emerald-700">Date</th>
                    <th className="px-3 py-2 text-left text-emerald-700">Time</th>
                    <th className="px-3 py-2 text-left text-emerald-700">Visitor</th>
                    <th className="px-3 py-2 text-left text-emerald-700">Vehicle No.</th>
                    <th className="px-3 py-2 text-left text-emerald-700">Bay</th>
                    <th className="px-3 py-2 text-left text-emerald-700">Entry method</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-100">
                  {data.entryHistory.length > 0 ? (
                    data.entryHistory.map((entry, idx) => (
                      <tr key={idx} className="hover:bg-emerald-50">
                        <td className="px-3 py-2">{entry.date}</td>
                        <td className="px-3 py-2">{entry.time}</td>
                        <td className="px-3 py-2">{entry.visitor}</td>
                        <td className="px-3 py-2 font-mono">{entry.vehicleNumber}</td>
                        <td className="px-3 py-2">{entry.bay}</td>
                        <td className="px-3 py-2">{entry.method}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-3 py-4 text-center text-gray-500">
                        No entries recorded
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              {data.entryHistory.length > 0 && (
                <p className="text-xs text-gray-500 mt-2 px-3">
                  History is based on Entry Capture logs linked to this guard account.
                </p>
              )}
            </div>
          </div>

          {/* My Activities Overview */}
          <div>
            <h3 className="text-sm font-semibold text-emerald-800 mb-3">
              My activities overview
            </h3>
            <p className="text-xs text-gray-500 mb-3">
              Summary of recent bay activities such as approvals, exits and manual entries.
            </p>
            <div className="space-y-2">
              {data.activities.length > 0 ? (
                data.activities.map((activity, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 bg-gray-50 p-3 rounded-lg"
                  >
                    <Clock className="text-emerald-600 mt-0.5 flex-shrink-0" size={16} />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className="text-sm text-gray-900">{activity.action}</p>
                        <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                          {activity.time}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">at {activity.bay}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No recent activities</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoBox({ label, value }) {
  return (
    <div className="bg-gray-50 p-3 rounded-lg">
      <p className="text-xs text-gray-600 mb-1">{label}</p>
      <p className="font-semibold text-emerald-800">{value}</p>
    </div>
  );
}

function StatBox({ label, value, color }) {
  return (
    <div className={`${color} p-4 rounded-lg text-center`}>
      <p className="text-2xl font-bold text-emerald-800">{value}</p>
      <p className="text-xs text-emerald-600 mt-1">{label}</p>
    </div>
  );
}

/* ================= OTHER COMPONENTS ================= */
function Stat({ title, value, icon: Icon, color = "emerald" }) {
  const colorMap = {
    emerald: {
      bg: "bg-white",
      border: "border-emerald-100",
      label: "text-emerald-600",
      icon: "text-emerald-500",
      value: "text-emerald-800",
    },
    red: {
      bg: "bg-white",
      border: "border-red-100",
      label: "text-red-500",
      icon: "text-red-400",
      value: "text-red-700",
    },
  };
  const c = colorMap[color];
  return (
    <div className={`${c.bg} border ${c.border} rounded-xl shadow-sm p-4 sm:p-5`}>
      <div className="flex justify-between mb-2">
        <p className={`text-sm ${c.label}`}>{title}</p>
        <Icon size={18} className={c.icon} />
      </div>
      <p className={`text-3xl font-bold ${c.value}`}>{value}</p>
    </div>
  );
}

function AddStaffModal({
  editId,
  form,
  setForm,
  errors,
  bays,
  onClose,
  onSubmit,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-xl overflow-hidden">
        <div className="flex justify-between px-6 py-4 border-b border-emerald-100 bg-emerald-50/50">
          <h2 className="font-semibold text-emerald-800">
            {editId ? "Edit Guard" : "Add New Guard"}
          </h2>
          <button
            onClick={onClose}
            className="text-emerald-600 hover:bg-emerald-100 p-1 rounded-lg transition"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4 text-sm">
          <Field
            label="Full Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            error={errors.name}
          />
          <Field
            label="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            error={errors.email}
          />
          <Field
            label="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            error={errors.phone}
          />
          {!editId && (
            <Field
              type="password"
              label="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              error={errors.password}
            />
          )}

          <div>
            <label className="block mb-1 font-medium text-emerald-700">
              Assigned Bay
            </label>
            <select
              value={form.assignedBay}
              onChange={(e) => setForm({ ...form, assignedBay: e.target.value })}
              className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
                errors.assignedBay
                  ? "border-red-500 focus:ring-red-500"
                  : "border-emerald-200 focus:ring-emerald-500"
              }`}
            >
              <option value="">Select Bay</option>
              {bays.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.bayName}
                </option>
              ))}
            </select>
            {errors.assignedBay && (
              <p className="text-red-600 text-xs mt-1">{errors.assignedBay}</p>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-emerald-100 flex justify-end gap-3 bg-gray-50/50">
          <button
            onClick={onClose}
            className="text-emerald-600 hover:bg-emerald-50 px-4 py-2 rounded-lg transition border border-emerald-200"
          >
            Cancel
          </button>

          <button
            onClick={onSubmit}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition shadow-sm"
          >
            {editId ? "Update Guard" : "Add Guard"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, error, ...props }) {
  return (
    <div>
      <label className="block mb-1 font-medium text-emerald-700">{label}</label>
      <input
        {...props}
        className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
          error
            ? "border-red-500 focus:ring-red-500"
            : "border-emerald-200 focus:ring-emerald-500"
        }`}
      />
      {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
    </div>
  );
}

function ConfirmDelete({ onCancel, onDelete }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <Trash2 size={18} className="text-red-600" />
          </div>
          <h3 className="font-semibold text-emerald-800">Delete Guard Member?</h3>
        </div>
        <p className="text-sm text-gray-500 mb-5">
          This action cannot be undone. All data associated with this guard member will be permanently removed.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="text-emerald-600 hover:bg-emerald-50 px-4 py-2 rounded-lg transition border border-emerald-200 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={onDelete}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition cursor-pointer text-sm font-medium"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}