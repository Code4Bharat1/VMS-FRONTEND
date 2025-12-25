"use client";
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import {
  TrendingUp,
  Clock,
  Building2,
  AlertCircle,
  ChevronRight,
  Users,
  UserCheck,
  UserX,
  Shield,
  Activity,
} from "lucide-react";

export default function Dashboard() {
  const [activeView, setActiveView] = useState("daily");
  const [dashboard, setDashboard] = useState(null);
  const [staff, setStaff] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [bays, setBays] = useState([]);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const intervalRef = useRef(null);

  useEffect(() => {
    fetchDashboard();
    intervalRef.current = setInterval(fetchDashboard, 15000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const headers = { Authorization: `Bearer ${token}` };

      const [staffRes, vendorRes, bayRes, entryRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/staff`, { headers }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/vendors`, { headers }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/bays`, { headers }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/entries`, { headers }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/supervisors`, { headers }),
      ]);

      const staffData = staffRes.data.staff || [];
      const vendorData = vendorRes.data.vendors || [];
      const bayData = bayRes.data.bays || [];
      const entryData = entryRes.data.entries || [];

      setStaff(staffData);
      setVendors(vendorData);
      setBays(bayData);
      setEntries(entryData);

      const bayMap = {};
      bayData.forEach((b) => (bayMap[b._id] = b.bayName));

      // Vehicles per bay
      const bayUsage = {};
      entryData.forEach((e) => {
        if (!e.bayId) return;
        const id = typeof e.bayId === "object" ? e.bayId._id : e.bayId;
        bayUsage[id] = (bayUsage[id] || 0) + 1;
      });

      const busiestBays = Object.entries(bayUsage)
        .map(([id, count]) => ({
          bayName: bayMap[id] || "Unknown",
          count,
        }))
        .sort((a, b) => b.count - a.count);

      // Staff by bay
      const staffByBayMap = {};
      staffData.forEach((s) => {
        if (!s.assignedBay) return;
        const bayId =
          typeof s.assignedBay === "object"
            ? s.assignedBay._id
            : s.assignedBay;

        if (!staffByBayMap[bayId]) {
          staffByBayMap[bayId] = {
            bayName: bayMap[bayId] || "Unknown",
            staff: [],
          };
        }
        staffByBayMap[bayId].staff.push({
          _id: s._id,
          name: s.name,
        });
      });

      setDashboard({
        busiestBays,
        staffByBay: Object.values(staffByBayMap),
      });

      setLoading(false);
    } catch (err) {
      console.error("Dashboard fetch failed", err);
      setLoading(false);
    }
  };

  /* ================= DERIVED METRICS ================= */
  const totalStaff = staff.length;
  const activeStaff = staff.filter((s) => s.isActive).length;
  const inactiveStaff = totalStaff - activeStaff;

  const supervisors = staff.filter((s) => s.role === "supervisor");
  const activeSupervisors = supervisors.filter((s) => s.isActive).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto" />
          <p className="mt-4 text-gray-600">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-auto mx-auto space-y-6">

        {/* HEADER */}
        <div className="bg-white shadow-sm px-6 py-4">
          <div className="flex flex-col lg:flex-row justify-between gap-4">
            <div>
              <h1 className="text-[22px] font-semibold text-gray-800">
                Admin Dashboard
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Today’s deliveries, bay utilization and staff performance
              </p>
            </div>


          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-2 p-4 lg:grid-cols-4 gap-6">
          <Stat title="Total Staff" value={totalStaff} icon={Users} />
          <Stat title="Active Staff" value={activeStaff} icon={UserCheck} />
          <Stat title="Inactive Staff" value={inactiveStaff} icon={UserX} />
          <Stat
            title="Supervisors"
            value={`${activeSupervisors}/${supervisors.length}`}
            icon={Shield}
          />
        </div>


        {/* DONUT + BAR */}
        <div className="grid grid-cols-1 lg:grid-cols-3 p-5 gap-6">
          <DonutChart label="Staff Active" value={activeStaff} total={totalStaff} />
          <DonutChart label="Supervisors Active" value={activeSupervisors} total={supervisors.length} />
          <BarChart data={dashboard?.busiestBays || []} />
        </div>

        {/* TABLES */}
        <div className="grid grid-cols-1 p-5 lg:grid-cols-2 gap-6">
          <BusiestBays data={dashboard?.busiestBays || []} />
          <StaffByBay data={dashboard?.staffByBay || []} />
        </div>
      </div>
    </div>
  );
}

/* ================= UI COMPONENTS ================= */

const Stat = ({ title, value, icon: Icon }) => (
  <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 p-6">
    <div className="flex justify-between mb-2">
      <Icon className="text-emerald-600" />
      <span className="text-xs text-emerald-600">Live</span>
    </div>
    <p className="text-gray-600 text-sm">{title}</p>
    <p className="text-3xl font-bold text-gray-800">{value}</p>
  </div>
);

const DonutChart = ({ label, value, total }) => {
  const r = 38;
  const c = 2 * Math.PI * r;
  const p = total ? (value / total) * c : 0;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 p-6">
      <p className="font-semibold mb-4">{label}</p>
      <svg width="100" height="100" className="-rotate-90 mx-auto">
        <circle cx="50" cy="50" r={r} stroke="#e5e7eb" strokeWidth="8" fill="none" />
        <circle
          cx="50"
          cy="50"
          r={r}
          stroke="#10b981"
          strokeWidth="8"
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={c - p}
          strokeLinecap="round"
        />
      </svg>
      <p className="text-center mt-3 font-bold">{value}/{total}</p>
    </div>
  );
};

const BarChart = ({ data }) => {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 p-6">
      <p className="font-semibold mb-4">Bay Utilization</p>
      {data.map((d) => (
        <div key={d.bayName} className="mb-3">
          <div className="flex justify-between text-sm">
            <span>{d.bayName}</span>
            <span>{d.count}</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full">
            <div
              className="h-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full"
              style={{ width: `${(d.count / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

const BusiestBays = ({ data }) => (
  <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 p-6">
    <h3 className="font-bold mb-4">Busiest Bays</h3>
    {data.map((b, i) => (
      <div key={i} className="flex justify-between py-2 border-b">
        <span>{b.bayName}</span>
        <span className="font-bold">{b.count}</span>
      </div>
    ))}
  </div>
);

const StaffByBay = ({ data }) => (
  <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 p-6">
    <h3 className="font-bold mb-4">Staff by Bay</h3>
    {data.map((b, i) => (
      <div key={i} className="mb-3">
        <p className="font-semibold">{b.bayName}</p>
        <div className="flex flex-wrap gap-2 mt-2">
          {b.staff.map((s) => (
            <span
              key={s._id}
              className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-sm"
            >
              {s.name}
            </span>
          ))}
        </div>
      </div>
    ))}
  </div>
);
