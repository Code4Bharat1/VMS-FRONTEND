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
        alert("Staff updated successfully");
      } else {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/staff`, {
          method: "POST",
          headers,
          body: JSON.stringify(form),
        });
        alert("Staff created successfully");
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
      alert("Failed to save staff");
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
      console.error("Toggle staff status error:", err);
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

    // Find supervisor for this bay
    const supervisor = supervisors.find((sup) => {
      const supBayId =
        typeof sup.assignedBay === "object"
          ? sup.assignedBay?._id
          : sup.assignedBay;
      return bayId && supBayId === bayId;
    });

    // Get all entries for this staff member
    const staffEntries = entries.filter((e) => {
      const entryStaffId =
        typeof e.createdBy === "object" ? e.createdBy?._id : e.createdBy;

      return entryStaffId === staffMember._id;
    });

    // Calculate metrics
    const totalEntriesRecorded = staffEntries.length;
    const todayEntries = staffEntries.filter((e) => {
      const entryDate = new Date(e.createdAt);
      const today = new Date();
      return entryDate.toDateString() === today.toDateString();
    }).length;

    // Calculate average processing time (for completed entries)
    const completedEntries = staffEntries.filter((e) => e.outTime);
    const avgProcessingTime = staffEntries.length
      ? staffEntries.reduce((sum, e) => sum + (e.processingTimeMs || 0), 0) /
        staffEntries.length
      : 0;

    // Entry history (last 5)
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

    // Activity overview (last 5 activities)
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
      avgProcessingTime: Math.round(avgProcessingTime),
      entryHistory,
      activities,
    });
    setShowDetail(true);
  };

  const filtered = staff.filter((s) => {
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
              Staff Management
            </h1>
            <p className="text-sm text-emerald-600 mt-1">
              Manage security staff and supervisors
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-auto">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400"
              />
              <input
                placeholder="Search staff"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 h-10 w-full sm:w-64 rounded-lg border border-emerald-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              onClick={() => setShowFilters((p) => !p)}
              className="flex items-center gap-2 px-4 h-10 rounded-lg border border-emerald-200 bg-white text-sm hover:bg-emerald-50 transition"
            >
              <Filter size={16} />
              Filters
            </button>

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
              className="flex items-center gap-2 px-4 h-10 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition"
            >
              <Plus size={16} />
              Add Staff
            </button>
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
              Staff Name
            </label>
            <select
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              className="border border-emerald-200 rounded-lg px-3 py-2 w-full sm:w-48 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
      )}

      {/* CONTENT */}
      <div className="px-4 sm:px-8 py-6">
        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <Stat title="Total Staff" value={staff.length} icon={Users} />
          <Stat
            title="Active Staff"
            value={staff.filter((s) => s.isActive).length}
            icon={Activity}
          />
          <Stat
            title="Assigned Bays"
            value={
              new Set(
                staff.map((s) => getBayName(s.assignedBay)).filter(Boolean)
              ).size
            }
            icon={MapPin}
          />
        </div>

        {/* TABLE */}
        <div className="hidden md:block bg-white rounded-xl border border-emerald-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-emerald-100">
              <tr>
                {["Name", "Email", "Phone", "Bay", "Status", "Action"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-6 py-4 text-sm font-semibold text-center text-emerald-700"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-emerald-100">
              {filtered.map((s) => (
                <tr
                  key={s._id}
                  onClick={() => openDetail(s)}
                  className="hover:bg-emerald-50 cursor-pointer text-center transition"
                >
                  <td className="px-6 py-4 font-medium text-emerald-800">
                    {s.name}
                  </td>
                  <td className="px-6 py-4">{s.email}</td>
                  <td className="px-6 py-4">{s.phone}</td>
                  <td className="px-6 py-4">{getBayName(s.assignedBay)}</td>
                  <td className="px-6 py-4">
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStaffStatus(s._id);
                      }}
                      className={`cursor-pointer px-3 py-1 rounded-full text-xs font-medium ${
                        s.isActive
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {s.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-4">
                      <Pencil
                        size={18}
                        className="text-emerald-600 hover:scale-110 cursor-pointer transition"
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
                      />

                      <Trash2
                        size={18}
                        className="text-red-600 hover:scale-110 cursor-pointer transition"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelected(s);
                          setConfirmDelete(true);
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="px-4 py-3 text-sm text-emerald-600 bg-emerald-50">
            Showing {filtered.length} staff members
          </div>
        </div>

        {/* MOBILE STAFF LIST */}
        <div className="md:hidden space-y-4">
          {filtered.map((s) => (
            <div
              key={s._id}
              onClick={() => openDetail(s)}
              className="bg-white rounded-lg border border-emerald-100 shadow-sm p-4 space-y-3 cursor-pointer hover:shadow-md transition"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-emerald-800">{s.name}</p>
                  <p className="text-xs text-emerald-600">{s.email}</p>
                </div>

                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleStaffStatus(s._id);
                  }}
                  className={`cursor-pointer px-3 py-1 rounded-full text-xs font-medium ${
                    s.isActive
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {s.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="text-sm text-gray-700 space-y-1">
                <p>
                  <span className="font-medium">Phone:</span> {s.phone}
                </p>
                <p>
                  <span className="font-medium">Bay:</span>{" "}
                  {getBayName(s.assignedBay)}
                </p>
              </div>

              <div className="flex justify-end gap-4 pt-2">
                <Pencil
                  size={18}
                  className="text-emerald-600"
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
                />

                <Trash2
                  size={18}
                  className="text-red-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelected(s);
                    setConfirmDelete(true);
                  }}
                />
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <p className="text-center text-sm text-gray-400">No staff found</p>
          )}
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
                    data.isActive
                      ? "bg-emerald-400 text-emerald-900"
                      : "bg-red-400 text-red-900"
                  }`}
                >
                  {data.isActive ? "Active" : "Inactive"}
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
              Staff details
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
                value={`${data.avgProcessingTime} min`}
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
                    <th className="px-3 py-2 text-left text-emerald-700">
                      Date
                    </th>
                    <th className="px-3 py-2 text-left text-emerald-700">
                      Time
                    </th>
                    <th className="px-3 py-2 text-left text-emerald-700">
                      Visitor
                    </th>
                    <th className="px-3 py-2 text-left text-emerald-700">
                      Vehicle No.
                    </th>
                    <th className="px-3 py-2 text-left text-emerald-700">
                      Bay
                    </th>
                    <th className="px-3 py-2 text-left text-emerald-700">
                      Entry method
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-100">
                  {data.entryHistory.length > 0 ? (
                    data.entryHistory.map((entry, idx) => (
                      <tr key={idx} className="hover:bg-emerald-50">
                        <td className="px-3 py-2">{entry.date}</td>
                        <td className="px-3 py-2">{entry.time}</td>
                        <td className="px-3 py-2">{entry.visitor}</td>
                        <td className="px-3 py-2 font-mono">
                          {entry.vehicleNumber}
                        </td>
                        <td className="px-3 py-2">{entry.bay}</td>
                        <td className="px-3 py-2">{entry.method}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-3 py-4 text-center text-gray-500"
                      >
                        No entries recorded
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              {data.entryHistory.length > 0 && (
                <p className="text-xs text-gray-500 mt-2 px-3">
                  History is based on Entry Capture logs linked to this staff
                  account.
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
              Summary of recent bay activities such as approvals, exits and
              manual entries.
            </p>
            <div className="space-y-2">
              {data.activities.length > 0 ? (
                data.activities.map((activity, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 bg-gray-50 p-3 rounded-lg"
                  >
                    <Clock
                      className="text-emerald-600 mt-0.5 flex-shrink-0"
                      size={16}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className="text-sm text-gray-900">
                          {activity.action}
                        </p>
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
function Stat({ title, value, icon: Icon }) {
  return (
    <div className="bg-white border border-emerald-100 rounded-xl shadow-sm p-4 sm:p-6">
      <div className="flex justify-between mb-2">
        <p className="text-sm text-emerald-600">{title}</p>
        <Icon size={20} className="text-emerald-600" />
      </div>
      <p className="text-3xl font-bold text-emerald-800">{value}</p>
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
        <div className="flex justify-between px-6 py-4 border-b border-emerald-100">
          <h2 className="font-semibold text-emerald-800">
            {editId ? "Edit Staff" : "Add New Staff"}
          </h2>
          <X
            onClick={onClose}
            className="cursor-pointer text-emerald-600 hover:bg-emerald-50 p-1 rounded-lg transition"
          />
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
              onChange={(e) =>
                setForm({ ...form, assignedBay: e.target.value })
              }
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

        <div className="px-6 py-4 border-t border-emerald-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="text-emerald-600 hover:bg-emerald-50 px-4 py-2 rounded-lg transition"
          >
            Cancel
          </button>

          <button
            onClick={onSubmit}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition"
          >
            {editId ? "Update Staff" : "Add Staff"}
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
        <h3 className="font-semibold text-emerald-800 mb-2">
          Delete Staff Member?
        </h3>
        <p className="text-sm text-emerald-600 mb-4">
          This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="text-emerald-600 hover:bg-emerald-50 px-4 py-2 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            onClick={onDelete}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
