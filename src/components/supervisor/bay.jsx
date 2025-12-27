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
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activeItem="overview" />

      <div className="flex-1 overflow-auto">
        {/* HEADER */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
                My Bays
              </h1>
              <p className="text-gray-500 mt-1 text-sm">
                Monitor live bay status, traffic, and alerts.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-semibold">
                {(supervisor?.name || "")
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </div>
              <div>
                <h2 className="text-sm sm:text-lg font-semibold text-gray-800">
                  {supervisor?.name || "Supervisor"}
                </h2>
                <p className="text-xs sm:text-sm text-gray-500">
                  {supervisor?.role || "Supervisor"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="px-4 sm:px-8 py-6">
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
            <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
              {["Today", "This week", "This month"].map((view) => {
                const key = view.toLowerCase().replace(" ", "-");
                return (
                  <button
                    key={view}
                    onClick={() => setActiveView(key)}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      activeView === key
                        ? "bg-white text-emerald-700 shadow-sm"
                        : "text-gray-600"
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
                className="bg-white rounded-xl border-2 border-gray-200 hover:border-emerald-400 hover:shadow-xl transition-all cursor-pointer"
              >
                <div className="p-6">
                  <div className="flex justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-800">
                      {bay.bayName}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-bold ${
                        bay.status === "Free"
                          ? "bg-emerald-500 text-white"
                          : "bg-orange-500 text-white"
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

                <div className="bg-gray-50 px-6 py-4 border-t text-center text-sm text-gray-500">
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
  <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition">
    <div className="flex justify-between mb-2">
      <p className="text-gray-500 text-sm font-medium">{title}</p>
      <Icon size={20} className="text-emerald-600" />
    </div>
    <h3 className="text-2xl sm:text-3xl font-bold text-gray-800">{value}</h3>
    <p className="text-gray-400 text-sm mt-1">{desc}</p>
  </div>
);

const Info = ({ label, value }) => (
  <div className="flex justify-between">
    <span className="text-gray-600">{label}:</span>
    <span className="font-semibold text-gray-800">{value}</span>
  </div>
);

export default MyBays;
