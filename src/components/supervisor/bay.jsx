"use client";   
import React, { useEffect, useState } from 'react';
import { Building2, Users, Clock, TrendingUp, X, AlertCircle, CheckCircle, Activity, Car, Truck } from 'lucide-react';
import Sidebar from './sidebar';

const MyBays = () => {
  const [selectedBay, setSelectedBay] = useState(null);
  const [activeView, setActiveView] = useState('today');
  const [supervisor, setSupervisor] = useState(null);
  const [baysData, setBaysData] = useState([]);

useEffect(() => {
  const storedUser = localStorage.getItem("user");

  if (storedUser) {
    setSupervisor(JSON.parse(storedUser));
  }
}, []);
useEffect(() => {
  const fetchBays = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bays`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    });
    const data = await res.json();
    setBaysData(data.bays);
  };

  fetchBays();
}, []);

  const recentBayActivity = [
    { time: '09:22', bay: 'Bay A', vrn: 'QTR-58293', company: 'Alpha Logistics', handledBy: 'Ali Hassan', direction: 'Entry', method: 'OCR' },
    { time: '09:18', bay: 'Bay C', vrn: 'QTR-99314', company: 'FreshFoods', handledBy: 'Sara Ibrahim', direction: 'Exit', method: 'Manual' },
    { time: '09:10', bay: 'Bay B', vrn: 'QTR-44120', company: 'Metro Supplies', handledBy: 'John Peter', direction: 'Entry', method: 'QR' },
    { time: '09:05', bay: 'Bay A', vrn: 'QTR-78110', company: 'City Courier', handledBy: 'Imran Khan', direction: 'Exit', method: 'OCR' },
    { time: '08:58', bay: 'Bay C', vrn: 'QTR-66821', company: 'Delta Cold Chain', handledBy: 'Ravi Kumar', direction: 'Entry', method: 'Manual' },
  ];
const filter = activeView;
const BayModal = ({ bay, onClose }) => {
  if (!bay) return null;

  // Lock background scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 overflow-y-auto px-4 py-10">
      {/* Modal Card */}
      <div className="mx-auto bg-white rounded-2xl max-w-5xl w-full shadow-2xl">
        
        {/* Header */}
        <div className="top-0 z-10 bg-white border-b border-gray-200 px-8 py-6 flex items-center justify-between rounded-t-2xl">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-gray-800">
                {bay.name}
              </h2>
              <span
                className={`px-4 py-1 rounded-full text-sm font-semibold ${
                  bay.status === "Free"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-orange-100 text-orange-700"
                }`}
              >
                {bay.status}
              </span>
            </div>
            <p className="text-gray-500 mt-1">
              Live status and recent activity for this bay
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition"
          >
            <X size={22} className="text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-10">
          
          {/* Current Status Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-blue-900">
                  Current Status
                </p>
                <Activity size={20} className="text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-blue-900 mb-1">
                {bay.currentVehicle || "No vehicle"}
              </p>
              <p className="text-blue-700 text-sm">
                {bay.currentVehicle
                  ? "Vehicle inside"
                  : "Ready for next arrival"}
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-purple-900">
                  On-duty Staff
                </p>
                <Users size={20} className="text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-purple-900 mb-1">
                {bay.staffOnDuty} staff
              </p>
              <p className="text-purple-700 text-sm">
                {bay.staff.slice(0, 2).join(", ")}
                {bay.staff.length > 2 &&
                  ` +${bay.staff.length - 2}`}
              </p>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-emerald-900">
                  Avg Time Today
                </p>
                <Clock size={20} className="text-emerald-600" />
              </div>
              <p className="text-2xl font-bold text-emerald-900 mb-1">
                {bay.avgTime}
              </p>
              <p className="text-emerald-700 text-sm">
                Target: 20s per entry
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-orange-900">
                  Vehicles Today
                </p>
                <TrendingUp size={20} className="text-orange-600" />
              </div>
              <p className="text-2xl font-bold text-orange-900 mb-1">
                {bay.vehiclesToday}
              </p>
              <p className="text-orange-700 text-sm">
                Currently inside: {bay.currentlyInside}
              </p>
            </div>
          </div>

          {/* Bay Activity Timeline */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Bay Activity Timeline (Today)
            </h3>
            <div className="bg-gray-50 rounded-xl p-6 space-y-3">
              {bay.recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 bg-white p-4 rounded-lg"
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      activity.type === "Entry"
                        ? "bg-emerald-600"
                        : "bg-blue-600"
                    }`}
                  />
                  <span className="w-16 text-gray-600 font-medium">
                    {activity.time}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      activity.type === "Entry"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {activity.type}
                  </span>
                  <span className="font-medium text-gray-800">
                    {activity.vehicle}
                  </span>
                  <span className="ml-auto px-3 py-1 bg-gray-100 rounded-full text-xs font-medium">
                    {activity.method}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Vehicles */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Recent Vehicles Linked
            </h3>
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                      VRN
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                      Company
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                      Direction
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {bay.recentVehicles.map((vehicle, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-semibold">
                        {vehicle.vrn}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {vehicle.company}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {vehicle.time}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            vehicle.direction === "Entry"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {vehicle.direction}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bay Alerts */}
          {bay.alerts.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Bay Alerts
              </h3>
              <div className="space-y-3">
                {bay.alerts.map((alert, index) => (
                  <div
                    key={index}
                    className={`flex gap-4 p-4 rounded-xl border ${
                      alert.type === "reminder"
                        ? "bg-orange-50 border-orange-200"
                        : "bg-blue-50 border-blue-200"
                    }`}
                  >
                    <AlertCircle
                      size={20}
                      className={
                        alert.type === "reminder"
                          ? "text-orange-600"
                          : "text-blue-600"
                      }
                    />
                    <div>
                      <span
                        className={`inline-block px-3 py-1 mb-2 rounded-full text-xs font-bold ${
                          alert.type === "reminder"
                            ? "bg-orange-600 text-white"
                            : "bg-blue-600 text-white"
                        }`}
                      >
                        {alert.type.toUpperCase()}
                      </span>
                      <p className="text-gray-700">
                        {alert.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeItem='overview'/>
      <div className="flex-1 overflow-auto">
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">My Bays</h1>
              <p className="text-gray-500 mt-1">Monitor live bay status, traffic, and alerts for the bays assigned to you.</p>
            </div>
<div className="flex items-center gap-4">
  <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-semibold">
    {(supervisor?.name || '')
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()}
  </div>

  <div>
    <h2 className="text-2xl font-semibold text-gray-800">
      {supervisor?.name || 'Supervisor'}
    </h2>

    <p className="text-gray-500 text-sm">
      {supervisor?.role || 'Supervisor'}
     
    </p>
  </div>


            </div>
          </div>
        </div>

      <div className="px-8 py-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-500 text-sm font-medium">Total Bays Assigned</p>
              <Building2 className="text-emerald-600" size={20} />
            </div>
            <h3 className="text-3xl font-bold text-gray-800">{baysData.length}</h3>
            <p className="text-gray-400 text-sm mt-1">Bay A, Bay B, Bay C</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-500 text-sm font-medium">Active Bays Now</p>
              <Activity className="text-blue-600" size={20} />
            </div>
            <h3 className="text-3xl font-bold text-gray-800">{(baysData.filter(bay => bay.status === 'active')).length}</h3>
            <p className="text-gray-400 text-sm mt-1">Receiving vehicles in this shift</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-500 text-sm font-medium">Avg Processing Time / Bay (Today)</p>
              <Clock className="text-purple-600" size={20} />
            </div>
            <h3 className="text-3xl font-bold text-gray-800">18s</h3>
            <p className="text-gray-400 text-sm mt-1">Target: <span className="text-emerald-600 font-medium">20s per entry</span></p>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
            {['Today', 'This week', 'This month'].map((view) => (
              <button
                key={view}
                onClick={() => setActiveView(view.toLowerCase().replace(' ', '-'))}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeView === view.toLowerCase().replace(' ', '-')
                    ? 'bg-white text-emerald-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {view}
              </button>
            ))}
          </div>
       
        </div>

        {/* Bay Cards */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          {baysData.map((bay) => (
            <div
              key={bay.id}
              // onClick={() => openBay(bay.id)}

              className="bg-white rounded-xl border-2 border-gray-200 hover:border-emerald-400 hover:shadow-xl transition-all cursor-pointer group"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-800 group-hover:text-emerald-600 transition-colors">
                    {bay.bayName}
                  </h3>
                  <span className={`px-4 py-1 rounded-full text-sm font-bold ${
                    bay.status === 'Free' 
                      ? 'bg-emerald-500 text-white' 
                      : 'bg-orange-500 text-white'
                  }`}>
                    {bay.status}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Vehicles today:</span>
                    <span className="font-bold text-gray-800">{bay.vehiclesToday}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Avg time:</span>
                    <span className="font-bold text-gray-800">{bay.avgTime}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Currently inside:</span>
                    <span className="font-bold text-gray-800">{bay.currentlyInside}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Staff on duty:</span>
                    <span className="font-bold text-gray-800">{bay.staffOnDuty}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className={`flex items-center gap-2 ${
                    bay.performance === 'high' ? 'text-emerald-600' :
                    bay.performance === 'ready' ? 'text-blue-600' :
                    'text-orange-600'
                  }`}>
                    <div className="w-2 h-2 rounded-full bg-current"></div>
                    <p className="text-sm font-medium">{bay.performanceText}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-6 py-4 rounded-b-xl border-t border-gray-200">
                <p className="text-sm text-gray-500 text-center group-hover:text-emerald-600 font-medium transition-colors">
                  Click to view full details →
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Bay Activity Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">Recent Bay Activity</h2>
            <p className="text-gray-500 text-sm mt-1">Latest entries and exits for your bays, ordered by time.</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Time</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Bay</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">VRN</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Company</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Handled By</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Direction</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Method</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentBayActivity.map((activity, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-600 font-medium">{activity.time}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-semibold">
                        {activity.bay}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-800">{activity.vrn}</td>
                    <td className="px-6 py-4 text-gray-600">{activity.company}</td>
                    <td className="px-6 py-4 text-gray-600">{activity.handledBy}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        activity.direction === 'Entry'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {activity.direction}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                        {activity.method}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-600">Showing 1-5 of 20 records</p>
            <div className="flex gap-2">
              <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
                Prev
              </button>
              <button className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bay Detail Modal */}
      {selectedBay && (
        <BayModal bay={selectedBay} onClose={() => setSelectedBay(null)} />
      )}
    </div>
      </div>
  );
};

export default MyBays;