"use client";
import React, { useEffect, useState } from "react";
import {
  Building2,
  Users,
  Clock,
  TrendingUp,
  X,
  AlertCircle,
  Activity,
} from "lucide-react";
import Sidebar from "./sidebar";

const MyBays = () => {
  const [selectedBay, setSelectedBay] = useState(null);
  const [activeView, setActiveView] = useState("today");
  const [supervisor, setSupervisor] = useState(null);
  const [baysData, setBaysData] = useState([]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setSupervisor(JSON.parse(storedUser));
  }, []);

  useEffect(() => {
    const fetchBays = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bays`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      const data = await res.json();
      setBaysData(data.bays || []);
    };
    fetchBays();
  }, []);

  return (
    <div className="flex h-screen bg-emerald-50/60">
      <Sidebar activeItem="overview" />

      <div className="flex-1 overflow-auto">
        {/* HEADER */}
        <div className="sticky top-0 z-40 bg-white border-b border-emerald-100 px-4 sm:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-emerald-800">
                My Bays
              </h1>
              <p className="text-emerald-600 mt-1 text-sm">
                Monitor live bay status, traffic, and alerts.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold">
                {(supervisor?.name || "")
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-semibold text-emerald-800">
                  {supervisor?.name || "Supervisor"}
                </h2>
                <p className="text-xs text-emerald-600">
                  {supervisor?.role || "Supervisor"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="px-4 sm:px-8 py-4 sm:py-6">
          {/* STATS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
            <Stat
              title="Total Bays Assigned"
              value={baysData.length}
              icon={Building2}
              desc="Bay A, Bay B, Bay C"
            />
            <Stat
              title="Active Bays Now"
              value={baysData.filter((b) => b.status === "active").length}
              icon={Activity}
              desc="Receiving vehicles"
            />
            <Stat
              title="Avg Processing Time / Bay"
              value="18s"
              icon={Clock}
              desc="Target: 20s"
            />
          </div>

          {/* VIEW TOGGLE */}
          <div className="flex justify-center sm:justify-start mb-6">
            <div className="flex gap-2 bg-white border border-emerald-100 p-1 rounded-lg">
              {["Today", "This week", "This month"].map((view) => {
                const key = view.toLowerCase().replace(" ", "-");
                return (
                  <button
                    key={view}
                    onClick={() => setActiveView(key)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      activeView === key
                        ? "bg-emerald-100 text-emerald-700"
                        : "text-emerald-600 hover:bg-emerald-50"
                    }`}
                  >
                    {view}
                  </button>
                );
              })}
            </div>
          </div>

          {/* BAY CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {baysData.map((bay) => (
              <div
                key={bay._id}
                onClick={() => setSelectedBay(bay)}
                className="bg-white rounded-xl border border-emerald-100 hover:border-emerald-400 hover:shadow-lg transition-all cursor-pointer"
              >
                <div className="p-6">
                  <div className="flex justify-between mb-4">
                    <h3 className="text-lg font-bold text-emerald-800">
                      {bay.bayName}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        bay.status === "Free"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {bay.status}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <Info label="Vehicles today" value={bay.vehiclesToday} />
                    <Info label="Avg time" value={bay.avgTime} />
                    <Info label="Currently inside" value={bay.currentlyInside} />
                    <Info label="Staff on duty" value={bay.staffOnDuty} />
                  </div>
                </div>

                <div className="bg-emerald-50 px-6 py-4 border-t border-emerald-100 text-center text-sm text-emerald-600 font-medium">
                  Tap to view full details →
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MODAL */}
        {selectedBay && (
          <BayModal bay={selectedBay} onClose={() => setSelectedBay(null)} />
        )}
      </div>
    </div>
  );
};

/* ---------- SMALL COMPONENTS ---------- */

const Stat = ({ title, value, icon: Icon, desc }) => (
  <div className="bg-white rounded-xl border border-emerald-100 p-4 sm:p-6 shadow-sm hover:shadow transition">
    <div className="flex justify-between mb-2">
      <p className="text-emerald-600 text-sm font-medium">{title}</p>
      <Icon size={20} className="text-emerald-600" />
    </div>
    <h3 className="text-2xl sm:text-3xl font-bold text-emerald-800">{value}</h3>
    <p className="text-emerald-500 text-sm mt-1">{desc}</p>
  </div>
);

const Info = ({ label, value }) => (
  <div className="flex justify-between">
    <span className="text-emerald-600">{label}:</span>
    <span className="font-semibold text-emerald-800">{value}</span>
  </div>
);

const BayModal = ({ bay, onClose }) => {
  if (!bay) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl rounded-xl shadow-xl max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-emerald-100 px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-emerald-800">{bay.bayName}</h2>
            <p className="text-sm text-emerald-600">Bay Details & Activity</p>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-600 hover:bg-emerald-50 p-2 rounded-lg transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Status Card */}
          <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-emerald-700 font-medium">Current Status:</span>
              <span
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  bay.status === "Free"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-orange-100 text-orange-700"
                }`}
              >
                {bay.status}
              </span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white border border-emerald-100 rounded-lg p-4">
              <p className="text-sm text-emerald-600 mb-1">Vehicles Today</p>
              <p className="text-2xl font-bold text-emerald-800">{bay.vehiclesToday || 0}</p>
            </div>
            <div className="bg-white border border-emerald-100 rounded-lg p-4">
              <p className="text-sm text-emerald-600 mb-1">Average Time</p>
              <p className="text-2xl font-bold text-emerald-800">{bay.avgTime || "—"}</p>
            </div>
            <div className="bg-white border border-emerald-100 rounded-lg p-4">
              <p className="text-sm text-emerald-600 mb-1">Currently Inside</p>
              <p className="text-2xl font-bold text-emerald-800">{bay.currentlyInside || 0}</p>
            </div>
            <div className="bg-white border border-emerald-100 rounded-lg p-4">
              <p className="text-sm text-emerald-600 mb-1">Staff on Duty</p>
              <p className="text-2xl font-bold text-emerald-800">{bay.staffOnDuty || 0}</p>
            </div>
          </div>

          {/* Additional Info */}
          <div className="bg-white border border-emerald-100 rounded-lg p-4">
            <h3 className="font-semibold text-emerald-800 mb-3">Bay Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-emerald-600">Bay ID:</span>
                <span className="font-medium text-emerald-800">{bay._id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-600">Location:</span>
                <span className="font-medium text-emerald-800">{bay.location || "Main Campus"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-600">Capacity:</span>
                <span className="font-medium text-emerald-800">{bay.capacity || "10 vehicles"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-emerald-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyBays;