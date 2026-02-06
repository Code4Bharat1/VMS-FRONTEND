
"use client";
import { useEffect, useState } from "react";
import { Search, Plus, X, Pencil, Trash2, User, Users, CheckCircle, AlertCircle, TrendingUp, Clock } from "lucide-react";

export default function Supervisors() {
  const [supervisors, setSupervisors] = useState([]);
  const [staff, setStaff] = useState([]);
  const [entries, setEntries] = useState([]);
  const [search, setSearch] = useState("");
  const [bays, setBays] = useState([]);
  const [editId, setEditId] = useState(null);
  const [errors, setErrors] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    assignedBay: "",
  });

  /* ================= LOAD DATA ================= */
  const loadData = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const headers = { Authorization: `Bearer ${token}` };

      const [supRes, staffRes, bayRes, entryRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/supervisors`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/staff`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/bays`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/entries`, { headers }),
      ]);

      const supData = await supRes.json();
      const staffData = await staffRes.json();
      const bayData = await bayRes.json();
      const entryData = await entryRes.json();

      const supervisorsData = supData.supervisors || [];
      const staffList = staffData.staff || [];
      const baysData = bayData.bays || bayData || [];
      const entriesData = entryData.entries || [];

      setBays(baysData);
      setStaff(staffList);
      setEntries(entriesData);

      const mapped = supervisorsData.map((u) => {
        const supervisorBayId =
          typeof u.assignedBay === "object" ? u.assignedBay?._id : u.assignedBay;

        const staffCount = staffList.filter((s) => {
          const staffBayId =
            typeof s.assignedBay === "object" ? s.assignedBay?._id : s.assignedBay;
          return supervisorBayId && staffBayId === supervisorBayId;
        }).length;

        return {
          id: u._id,
          name: u.name,
          staffCount,
          mobile: u.phone || "-",
          email: u.email,
          status: u.isActive ? "Active" : "Inactive",
          assignedBay: u.assignedBay || null,
          isActive: u.isActive,
        };
      });

      setSupervisors(mapped);
    } catch (err) {
      console.error("Load supervisors error:", err);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    else if (form.name.length < 3) newErrors.name = "Name must be at least 3 characters";
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = "Invalid email address";
    if (!form.phone.trim()) newErrors.phone = "Phone number is required";
    else if (!/^[0-9]{10}$/.test(form.phone)) newErrors.phone = "Phone must be 10 digits";
    if (!form.assignedBay) newErrors.assignedBay = "Please select a bay";
    if (!editId) {
      if (!form.password) newErrors.password = "Password is required";
      else if (form.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    loadData();
  }, []);

  /* ================= ACTIONS ================= */
  const toggleStatus = async (id) => {
    try {
      const token = localStorage.getItem("accessToken");
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/supervisors/${id}/status`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      loadData();
    } catch (err) {
      console.error("Toggle status error", err);
    }
  };

  const saveSupervisor = async () => {
    if (!validate()) return;

    try {
      const token = localStorage.getItem("accessToken");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      if (editId) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/supervisors/${editId}`, {
          method: "PUT",
          headers,
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            phone: form.phone,
            assignedBay: form.assignedBay,
          }),
        });
        alert("Supervisor updated successfully");
      } else {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/supervisors`, {
          method: "POST",
          headers,
          body: JSON.stringify(form),
        });
        alert("Supervisor created successfully");
      }

      setShowAdd(false);
      setEditId(null);
      setErrors({});
      setForm({ name: "", email: "", phone: "", password: "", assignedBay: "" });
      loadData();
    } catch (err) {
      alert(err.message || "Something went wrong");
    }
  };

  const deleteSupervisor = async () => {
    if (!selected) return;
    try {
      const token = localStorage.getItem("accessToken");
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/supervisors/${selected.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setConfirmDelete(false);
      setSelected(null);
      loadData();
    } catch (err) {
      alert("Delete failed");
    }
  };

  const openDetail = (supervisor) => {
    const bayId = typeof supervisor.assignedBay === "object" 
      ? supervisor.assignedBay?._id 
      : supervisor.assignedBay;

    const bayStaff = staff.filter((s) => {
      const staffBayId = typeof s.assignedBay === "object" 
        ? s.assignedBay?._id 
        : s.assignedBay;
      return bayId && staffBayId === bayId;
    });

    const bayEntries = entries.filter((e) => {
      const entryBayId = typeof e.bayId === "object" ? e.bayId?._id : e.bayId;
      return bayId && entryBayId === bayId;
    });

    const completedChecks = bayEntries.filter(e => e.outTime !== null).length;
    const incidentsCount = bayEntries.filter(e => {
      const duration = e.outTime 
        ? (new Date(e.outTime) - new Date(e.inTime)) / 60000 
        : (Date.now() - new Date(e.inTime)) / 60000;
      return duration > 60;
    }).length;

    const onTimeShifts = bayStaff.filter(s => s.isActive).length;
    const patrolRounds = Math.floor(bayEntries.length / 5);
    const complianceRate = bayEntries.length > 0 
      ? Math.round((completedChecks / bayEntries.length) * 100) 
      : 100;

    const recentActivities = bayEntries
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 4)
      .map(e => ({
        action: e.outTime ? "Completed vehicle exit" : "Approved vehicle entry",
        time: new Date(e.createdAt).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        vehicle: e.vehicleNumber,
        bay: typeof e.bayId === "object" ? e.bayId?.bayName : "Bay",
      }));

    setDetailData({
      ...supervisor,
      bayStaff,
      staffAssigned: bayStaff.length,
      checksCompleted: completedChecks,
      incidents: incidentsCount,
      onTimeShifts,
      patrolRounds,
      complianceRate,
      recentActivities,
    });
    setShowDetail(true);
  };

  const filtered = supervisors.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalSupervisors = supervisors.length;
  const activeSupervisors = supervisors.filter((s) => s.status === "Active").length;
  const inactiveSupervisors = supervisors.filter((s) => s.status === "Inactive").length;
  const uniqueBayStaffMap = {};

  supervisors.forEach((s) => {
    const bayId = typeof s.assignedBay === "object" ? s.assignedBay?._id : s.assignedBay;
    if (bayId && !uniqueBayStaffMap[bayId]) {
      uniqueBayStaffMap[bayId] = s.staffCount;
    }
  });

  const totalStaff = Object.values(uniqueBayStaffMap).reduce((sum, count) => sum + count, 0);

  return (
    <div className="min-h-screen bg-emerald-50/60">
      {/* HEADER */}
      <div className="sticky top-0 z-40 bg-white border-b border-emerald-100 px-4 sm:px-8 py-4 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-emerald-800">Supervisor Management</h1>
          <p className="text-sm text-emerald-600">Manage supervisors and assigned bays</p>
        </div>
        <button
          onClick={() => {
            setEditId(null);
            setShowAdd(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition"
        >
          <Plus size={16} /> Add Supervisor
        </button>
      </div>

      {/* STATS */}
      <div className="px-4 sm:px-8 mt-4">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Supervisors" value={totalSupervisors} />
          <StatCard title="Active Supervisors" value={activeSupervisors} />
          <StatCard title="Inactive Supervisors" value={inactiveSupervisors} />
          <StatCard title="Total Staff" value={totalStaff} />
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-4 sm:p-6">
        <div className="bg-white rounded-xl border border-emerald-100 shadow-sm">
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-emerald-400" size={16} />
              <input
                className="w-full bg-white border border-emerald-200 pl-9 pr-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Search supervisors"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* TABLE */}
          <div className="hidden md:block">
            <table className="w-full">
              <thead className="bg-emerald-100">
                <tr>
                  {["Name", "Staff", "Mobile", "Email", "Bay", "Status", "Action"].map((h) => (
                    <th key={h} className="px-6 py-4 text-sm font-semibold text-emerald-700 text-center">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-100">
                {filtered.map((s) => (
                  <tr
                    key={s.id}
                    onClick={() => openDetail(s)}
                    className="hover:bg-emerald-50 text-center transition cursor-pointer"
                  >
                    <td className="px-6 py-4 font-medium text-emerald-800">{s.name}</td>
                    <td className="px-6 py-4">{s.staffCount}</td>
                    <td className="px-6 py-4">{s.mobile}</td>
                    <td className="px-6 py-4">{s.email}</td>
                    <td className="px-6 py-4">{s.assignedBay?.bayName || "-"}</td>
                    <td className="px-6 py-4">
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStatus(s.id);
                        }}
                        className={`cursor-pointer px-3 py-1 rounded-full text-xs font-medium ${
                          s.status === "Active"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditId(s.id);
                            setForm({
                              name: s.name,
                              email: s.email,
                              phone: s.mobile,
                              assignedBay: s.assignedBay?._id || "",
                              password: "",
                            });
                            setShowAdd(true);
                          }}
                          className="text-emerald-600 hover:scale-110 transition"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelected(s);
                            setConfirmDelete(true);
                          }}
                          className="text-red-600 hover:scale-110 transition"
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

          {/* MOBILE VIEW */}
          <div className="md:hidden space-y-4 px-4 pb-4">
            {filtered.map((s) => (
              <div
                key={s.id}
                onClick={() => openDetail(s)}
                className="bg-white rounded-lg shadow p-4 space-y-2 cursor-pointer hover:shadow-md transition"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-900">{s.name}</p>
                    <p className="text-xs text-gray-500">{s.email}</p>
                  </div>
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleStatus(s.id);
                    }}
                    className={`cursor-pointer px-3 py-1 rounded-full text-xs font-medium ${
                      s.status === "Active"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {s.status}
                  </span>
                </div>
                <div className="text-sm text-gray-700">
                  <p><span className="font-medium">Mobile:</span> {s.mobile}</p>
                  <p><span className="font-medium">Bay:</span> {s.assignedBay?.bayName || "-"}</p>
                  <p><span className="font-medium">Staff Count:</span> {s.staffCount}</p>
                </div>
                <div className="flex justify-end gap-4 pt-2">
                  <Pencil
                    className="text-emerald-600"
                    size={18}
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditId(s.id);
                      setForm({
                        name: s.name,
                        email: s.email,
                        phone: s.mobile,
                        assignedBay: s.assignedBay?._id || "",
                        password: "",
                      });
                      setShowAdd(true);
                    }}
                  />
                  <Trash2
                    className="text-red-600"
                    size={18}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelected(s);
                      setConfirmDelete(true);
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="px-4 py-3 text-sm text-emerald-600 bg-emerald-50 rounded-b-xl">
            Showing {filtered.length} supervisors
          </div>
        </div>
      </div>

      {/* MODALS */}
      {showAdd && (
        <Modal
          editId={editId}
          form={form}
          setForm={setForm}
          errors={errors}
          bays={bays}
          onClose={() => setShowAdd(false)}
          onSubmit={saveSupervisor}
        />
      )}

      {confirmDelete && (
        <ConfirmDelete onCancel={() => setConfirmDelete(false)} onDelete={deleteSupervisor} />
      )}

      {showDetail && detailData && (
        <DetailPopup data={detailData} onClose={() => setShowDetail(false)} />
      )}
    </div>
  );
}

/* ================= DETAIL POPUP ================= */
function DetailPopup({ data, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl my-8">
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
                {data.mobile} • {data.email}
              </p>
              <p className="text-emerald-100 text-sm">Bay: {data.assignedBay?.bayName || "N/A"}</p>
              <span
                className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                  data.isActive ? "bg-emerald-400 text-emerald-900" : "bg-red-400 text-red-900"
                }`}
              >
                {data.status}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Stats Grid */}
          <div>
            <h3 className="text-sm font-semibold text-emerald-800 mb-3">Staff assigned</h3>
            <div className="grid grid-cols-3 gap-4">
              <StatBox label="Staff assigned" value={data.staffAssigned} color="bg-emerald-50" />
              <StatBox label="Checks completed" value={data.checksCompleted} color="bg-blue-50" />
              <StatBox label="Incidents in last 7 days" value={data.incidents} color="bg-orange-50" />
            </div>
          </div>

          {/* Assigned Security Staff */}
          <div>
            <h3 className="text-sm font-semibold text-emerald-800 mb-3">
              Assigned security staff
              <span className="text-xs text-gray-500 ml-2">Team members reporting to this supervisor</span>
            </h3>
            <div className="space-y-2">
              {data.bayStaff.length > 0 ? (
                data.bayStaff.map((s) => (
                  <div key={s._id} className="flex justify-between items-center bg-emerald-50 p-3 rounded-lg">
                    <div>
                      <p className="font-medium text-emerald-800">{s.name}</p>
                      <p className="text-xs text-emerald-600">
                        {s.designation || "Security Guard"} • Bay {s.assignedBay?.bayName || "N/A"}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-medium ${
                        s.isActive ? "bg-emerald-200 text-emerald-800" : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {s.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No staff assigned</p>
              )}
            </div>
          </div>

          {/* Performance Metrics */}
          <div>
            <h3 className="text-sm font-semibold text-emerald-800 mb-3">Performance metrics</h3>
            <div className="grid grid-cols-3 gap-4">
              <MetricCard label="On-time shift starts" value={`${data.onTimeShifts}%`} progress={data.onTimeShifts} />
              <MetricCard label="Patrol rounds completed" value={data.patrolRounds} progress={Math.min(data.patrolRounds * 10, 100)} />
              <MetricCard label="Bay compliance rate" value={`${data.complianceRate}%`} progress={data.complianceRate} />
            </div>
          </div>

          {/* Recent Activities */}
          <div>
            <h3 className="text-sm font-semibold text-emerald-800 mb-3">Recent activities</h3>
            <div className="space-y-2">
              {data.recentActivities.length > 0 ? (
                data.recentActivities.map((activity, idx) => (
                  <div key={idx} className="flex items-start gap-3 bg-gray-50 p-3 rounded-lg">
                    <Clock className="text-emerald-600 mt-0.5 flex-shrink-0" size={16} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.action} {activity.vehicle && `for ${activity.vehicle}`}</p>
                      <p className="text-xs text-gray-500">at {activity.bay} • {activity.time}</p>
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

function StatBox({ label, value, color }) {
  return (
    <div className={`${color} p-4 rounded-lg text-center`}>
      <p className="text-2xl font-bold text-emerald-800">{value}</p>
      <p className="text-xs text-emerald-600 mt-1">{label}</p>
    </div>
  );
}

function MetricCard({ label, value, progress }) {
  return (
    <div className="bg-emerald-50 p-4 rounded-lg">
      <p className="text-sm text-emerald-600 mb-2">{label}</p>
      <p className="text-2xl font-bold text-emerald-800 mb-2">{value}</p>
      <div className="h-2 bg-emerald-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-600 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

/* ================= OTHER COMPONENTS ================= */
function StatCard({ title, value }) {
  return (
    <div className="bg-white border border-emerald-100 rounded-xl shadow-sm p-5">
      <p className="text-sm text-emerald-600">{title}</p>
      <p className="text-3xl font-bold text-emerald-800 mt-1">{value}</p>
    </div>
  );
}

function Modal({ editId, form, setForm, errors, bays, onClose, onSubmit }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-md rounded-xl shadow-xl">
        <div className="flex justify-between items-center px-6 py-4 border-b border-emerald-100">
          <h2 className="font-semibold text-emerald-800">{editId ? "Edit Supervisor" : "Add Supervisor"}</h2>
          <X onClick={onClose} className="cursor-pointer text-emerald-600" />
        </div>
        <div className="p-6 space-y-4">
          <Input label="Name" value={form.name} error={errors.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Email" value={form.email} error={errors.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input label="Phone" value={form.phone} error={errors.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <div>
            <label className="text-sm font-medium text-emerald-700">Assigned Bay</label>
            <select
              className={`w-full mt-1 px-3 py-2 rounded-lg border border-emerald-200 focus:outline-none focus:ring-2 ${
                errors.assignedBay ? "ring-red-500" : "focus:ring-emerald-500"
              }`}
              value={form.assignedBay}
              onChange={(e) => setForm({ ...form, assignedBay: e.target.value })}
            >
              <option value="">Select Bay</option>
              {bays.map((b) => (
                <option key={b._id} value={b._id}>{b.bayName}</option>
              ))}
            </select>
            {errors.assignedBay && <p className="text-xs text-red-600 mt-1">{errors.assignedBay}</p>}
          </div>
          {!editId && <Input label="Password" type="password" value={form.password} error={errors.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />}
        </div>
        <div className="px-6 py-4 border-t border-emerald-100 flex justify-end gap-3">
          <button onClick={onClose} className="text-emerald-600">Cancel</button>
          <button onClick={onSubmit} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition">
            {editId ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Input({ label, error, ...props }) {
  return (
    <div>
      <label className="text-sm font-medium text-emerald-700">{label}</label>
      <input
        {...props}
        className={`w-full mt-1 px-3 py-2 rounded-lg border border-emerald-200
          focus:outline-none focus:ring-2
          ${error ? "ring-red-500" : "focus:ring-emerald-500"}`}
      />
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}

const ConfirmDelete = ({ onCancel, onDelete }) => (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl p-6 w-80">
      <h3 className="font-semibold text-emerald-800 mb-2">
        Delete Supervisor?
      </h3>
      <p className="text-sm text-emerald-600 mb-4">
        This action cannot be undone.
      </p>
      <div className="flex justify-end gap-3">
        <button onClick={onCancel} className="text-emerald-600">
          Cancel
        </button>
        <button
          onClick={onDelete}
          className="bg-red-600 cursor-pointer hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
);
