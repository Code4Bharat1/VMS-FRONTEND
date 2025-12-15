"use client";
import React, { useState } from 'react';
import { Users, TrendingUp, Clock, Activity, X, Phone, MapPin, Calendar, BarChart3, CheckCircle, AlertCircle, Filter, Search } from 'lucide-react';
import Sidebar from './sidebar';
const MyStaff = () => {
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [activeView, setActiveView] = useState('today');
  const [filterBay, setFilterBay] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const staffData = [
    {
      id: 1,
      name: 'Ali Hassan',
      mobile: '+974 5540 1234',
      assignedBay: 'Bay A',
      shift: '06:00 - 14:00',
      role: 'Senior Guard',
      status: 'Active',
      todayEntries: 86,
      avgTime: '16s',
      last7Days: 512,
      incidents: 1,
      reportsTo: 'Ahmed Khan (You)',
      entryHistory: [
        { time: '09:18', vehicle: 'Truck', bay: 'Bay A', method: 'OCR' },
        { time: '08:55', vehicle: 'Van', bay: 'Bay A', method: 'Manual' },
        { time: '08:30', vehicle: 'Car', bay: 'Bay A', method: 'QR' },
        { time: '08:05', vehicle: 'Truck', bay: 'Bay A', method: 'OCR' },
      ],
      performance: {
        efficiency: 95,
        accuracy: 98,
        punctuality: 100,
      },
      weeklyTrend: [45, 52, 48, 55, 50, 54, 58],
    },
    {
      id: 2,
      name: 'Sara Ibrahim',
      mobile: '+974 5540 5678',
      assignedBay: 'Bay C',
      shift: '06:00 - 14:00',
      role: 'Security Guard',
      status: 'Active',
      todayEntries: 72,
      avgTime: '19s',
      last7Days: 489,
      incidents: 0,
      reportsTo: 'Ahmed Khan (You)',
      entryHistory: [
        { time: '09:15', vehicle: 'Van', bay: 'Bay C', method: 'Manual' },
        { time: '08:50', vehicle: 'Truck', bay: 'Bay C', method: 'OCR' },
        { time: '08:25', vehicle: 'Car', bay: 'Bay C', method: 'QR' },
        { time: '08:00', vehicle: 'Van', bay: 'Bay C', method: 'Manual' },
      ],
      performance: {
        efficiency: 92,
        accuracy: 96,
        punctuality: 98,
      },
      weeklyTrend: [42, 48, 45, 50, 47, 52, 55],
    },
    {
      id: 3,
      name: 'John Peter',
      mobile: '+974 5540 9012',
      assignedBay: 'Bay B',
      shift: '06:00 - 14:00',
      role: 'Security Guard',
      status: 'On break',
      todayEntries: 64,
      avgTime: '21s',
      last7Days: 445,
      incidents: 2,
      reportsTo: 'Ahmed Khan (You)',
      entryHistory: [
        { time: '09:10', vehicle: 'Car', bay: 'Bay B', method: 'QR' },
        { time: '08:45', vehicle: 'Truck', bay: 'Bay B', method: 'OCR' },
        { time: '08:20', vehicle: 'Van', bay: 'Bay B', method: 'Manual' },
        { time: '07:55', vehicle: 'Car', bay: 'Bay B', method: 'QR' },
      ],
      performance: {
        efficiency: 88,
        accuracy: 94,
        punctuality: 95,
      },
      weeklyTrend: [38, 42, 40, 45, 43, 48, 50],
    },
    {
      id: 4,
      name: 'Imran Khan',
      mobile: '+974 5540 3456',
      assignedBay: 'Bay A',
      shift: '06:00 - 14:00',
      role: 'Security Guard',
      status: 'Active',
      todayEntries: 58,
      avgTime: '17s',
      last7Days: 398,
      incidents: 0,
      reportsTo: 'Ahmed Khan (You)',
      entryHistory: [
        { time: '09:05', vehicle: 'Truck', bay: 'Bay A', method: 'OCR' },
        { time: '08:40', vehicle: 'Car', bay: 'Bay A', method: 'QR' },
        { time: '08:15', vehicle: 'Van', bay: 'Bay A', method: 'Manual' },
        { time: '07:50', vehicle: 'Truck', bay: 'Bay A', method: 'OCR' },
      ],
      performance: {
        efficiency: 90,
        accuracy: 97,
        punctuality: 100,
      },
      weeklyTrend: [35, 40, 38, 42, 40, 45, 48],
    },
    {
      id: 5,
      name: 'Ravi Kumar',
      mobile: '+974 5540 7890',
      assignedBay: 'Bay C',
      shift: '14:00 - 22:00',
      role: 'Security Guard',
      status: 'Active',
      todayEntries: 42,
      avgTime: '20s',
      last7Days: 356,
      incidents: 0,
      reportsTo: 'Ahmed Khan (You)',
      entryHistory: [
        { time: '08:58', vehicle: 'Van', bay: 'Bay C', method: 'Manual' },
        { time: '08:35', vehicle: 'Car', bay: 'Bay C', method: 'QR' },
        { time: '08:10', vehicle: 'Truck', bay: 'Bay C', method: 'OCR' },
        { time: '07:45', vehicle: 'Van', bay: 'Bay C', method: 'Manual' },
      ],
      performance: {
        efficiency: 87,
        accuracy: 95,
        punctuality: 97,
      },
      weeklyTrend: [32, 36, 34, 38, 36, 40, 42],
    },
    {
      id: 6,
      name: 'Mohammed Ali',
      mobile: '+974 5540 2222',
      assignedBay: 'Bay B',
      shift: '14:00 - 22:00',
      role: 'Security Guard',
      status: 'Offline',
      todayEntries: 38,
      avgTime: '22s',
      last7Days: 312,
      incidents: 1,
      reportsTo: 'Ahmed Khan (You)',
      entryHistory: [
        { time: '08:50', vehicle: 'Car', bay: 'Bay B', method: 'QR' },
        { time: '08:30', vehicle: 'Truck', bay: 'Bay B', method: 'OCR' },
        { time: '08:05', vehicle: 'Van', bay: 'Bay B', method: 'Manual' },
        { time: '07:40', vehicle: 'Car', bay: 'Bay B', method: 'QR' },
      ],
      performance: {
        efficiency: 85,
        accuracy: 93,
        punctuality: 92,
      },
      weeklyTrend: [28, 32, 30, 35, 33, 38, 40],
    },
  ];

  const filteredStaff = staffData.filter(staff => {
    const matchesBay = filterBay === 'all' || staff.assignedBay === filterBay;
    const matchesSearch = staff.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          staff.mobile.includes(searchQuery);
    return matchesBay && matchesSearch;
  });

  const StaffModal = ({ staff, onClose }) => {
    if (!staff) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-auto">
          {/* Modal Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                {staff.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{staff.name}</h2>
                <p className="text-gray-500">{staff.role} • {staff.assignedBay} • {staff.shift}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={24} className="text-gray-600" />
            </button>
          </div>

          <div className="p-8">
            {/* Contact & Assignment Info */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Phone className="text-blue-600" size={20} />
                  <h3 className="font-semibold text-blue-900">Contact Information</h3>
                </div>
                <p className="text-blue-900 font-semibold text-lg">{staff.mobile}</p>
                <p className="text-blue-700 text-sm mt-1">Reports to: {staff.reportsTo}</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <MapPin className="text-purple-600" size={20} />
                  <h3 className="font-semibold text-purple-900">Assignment Details</h3>
                </div>
                <p className="text-purple-900 font-semibold text-lg">{staff.assignedBay}</p>
                <p className="text-purple-700 text-sm mt-1">Shift: {staff.shift}</p>
              </div>
            </div>

            {/* Status and Quick Stats */}
            <div className="grid grid-cols-4 gap-4 mb-8">
              <div className="bg-white border-2 border-gray-200 rounded-xl p-4">
                <p className="text-gray-500 text-sm mb-2">Status</p>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${
                  staff.status === 'Active' ? 'bg-emerald-100 text-emerald-700' :
                  staff.status === 'On break' ? 'bg-orange-100 text-orange-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {staff.status}
                </span>
              </div>

              <div className="bg-white border-2 border-gray-200 rounded-xl p-4">
                <p className="text-gray-500 text-sm mb-2">Today's Entries</p>
                <p className="text-2xl font-bold text-gray-800">{staff.todayEntries}</p>
              </div>

              <div className="bg-white border-2 border-gray-200 rounded-xl p-4">
                <p className="text-gray-500 text-sm mb-2">Avg Processing</p>
                <p className="text-2xl font-bold text-gray-800">{staff.avgTime}</p>
              </div>

              <div className="bg-white border-2 border-gray-200 rounded-xl p-4">
                <p className="text-gray-500 text-sm mb-2">Last 7 Days</p>
                <p className="text-2xl font-bold text-gray-800">{staff.last7Days}</p>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Performance Metrics</h3>
              <div className="grid grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-emerald-900 font-semibold">Efficiency</p>
                    <CheckCircle className="text-emerald-600" size={20} />
                  </div>
                  <div className="flex items-end gap-2">
                    <p className="text-3xl font-bold text-emerald-900">{staff.performance.efficiency}%</p>
                    <p className="text-emerald-700 text-sm mb-1">+5 vs target</p>
                  </div>
                  <div className="mt-3 bg-emerald-200 rounded-full h-2">
                    <div 
                      className="bg-emerald-600 rounded-full h-2" 
                      style={{ width: `${staff.performance.efficiency}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-blue-900 font-semibold">Accuracy</p>
                    <CheckCircle className="text-blue-600" size={20} />
                  </div>
                  <div className="flex items-end gap-2">
                    <p className="text-3xl font-bold text-blue-900">{staff.performance.accuracy}%</p>
                    <p className="text-blue-700 text-sm mb-1">Within target</p>
                  </div>
                  <div className="mt-3 bg-blue-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 rounded-full h-2" 
                      style={{ width: `${staff.performance.accuracy}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-purple-900 font-semibold">Punctuality</p>
                    <Clock className="text-purple-600" size={20} />
                  </div>
                  <div className="flex items-end gap-2">
                    <p className="text-3xl font-bold text-purple-900">{staff.performance.punctuality}%</p>
                    <p className="text-purple-700 text-sm mb-1">Excellent</p>
                  </div>
                  <div className="mt-3 bg-purple-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 rounded-full h-2" 
                      style={{ width: `${staff.performance.punctuality}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Entry History Today */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Entry History (Today)</h3>
              <div className="bg-gray-50 rounded-xl p-6 space-y-3">
                {staff.entryHistory.map((entry, index) => (
                  <div key={index} className="flex items-center gap-4 bg-white p-4 rounded-lg">
                    <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                    <span className="text-gray-600 font-medium w-16">{entry.time}</span>
                    <span className="text-gray-800 font-medium flex-1">{entry.vehicle}</span>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">
                      {entry.bay}
                    </span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                      {entry.method}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly Performance Chart */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4">7-Day Performance Trend</h3>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6">
                <div className="flex items-end justify-between gap-2 h-48">
                  {staff.weeklyTrend.map((value, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-emerald-200 rounded-t-lg relative" style={{ height: `${(value / 60) * 100}%` }}>
                        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-bold text-gray-700">
                          {value}
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-lg"></div>
                      </div>
                      <p className="text-xs text-gray-600 font-medium">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Incidents Section */}
            {staff.incidents > 0 && (
              <div className="mt-8">
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle className="text-orange-600" size={20} />
                  <h3 className="text-lg font-bold text-gray-800">Incidents Logged</h3>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                  <p className="text-orange-900 font-semibold">{staff.incidents} incident(s) in the last 7 days</p>
                  <p className="text-orange-700 text-sm mt-1">Review required for performance assessment</p>
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
       <Sidebar activeItem="overview" />
      
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Supervisor Panel</h1>
              <p className="text-gray-500 mt-1">Monitor your assigned security staff, bays, and your own supervision activities.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="font-semibold text-gray-800">Ahmed Khan</p>
                <p className="text-sm text-gray-500">Supervisor</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-semibold">
                AK
              </div>
            </div>
          </div>
        </div>

      <div className="px-8 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-500 text-sm font-medium">Total Staff Assigned</p>
              <Users className="text-emerald-600" size={20} />
            </div>
            <h3 className="text-3xl font-bold text-gray-800">12</h3>
            <p className="text-gray-400 text-sm mt-1">Across your bays A, B, C</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-500 text-sm font-medium">Active Staff Now</p>
              <Activity className="text-blue-600" size={20} />
            </div>
            <h3 className="text-3xl font-bold text-gray-800">9</h3>
            <p className="text-gray-400 text-sm mt-1">On duty this shift</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-500 text-sm font-medium">Today's Entries (All Staff)</p>
              <TrendingUp className="text-purple-600" size={20} />
            </div>
            <h3 className="text-3xl font-bold text-gray-800">384</h3>
            <p className="text-gray-400 text-sm mt-1">Updated in real-time</p>
          </div>
        </div>

        {/* View Toggle and Filters */}
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

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by name or mobile"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent w-64"
              />
            </div>

            {/* Bay Filter */}
            <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-2">
              <Filter size={18} className="text-gray-400" />
              <select
                value={filterBay}
                onChange={(e) => setFilterBay(e.target.value)}
                className="text-sm text-gray-700 focus:outline-none bg-transparent"
              >
                <option value="all">All bays</option>
                <option value="Bay A">Bay A</option>
                <option value="Bay B">Bay B</option>
                <option value="Bay C">Bay C</option>
              </select>
            </div>
          </div>
        </div>

        {/* Staff Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-xl font-bold text-gray-800">Staff Under Your Supervision</h2>
            <p className="text-gray-500 text-sm mt-1">Select a staff member to see detailed performance and entry history.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Staff Name</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Mobile Number</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Assigned Bay</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Today's Entries</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Avg Processing Time</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredStaff.map((staff) => (
                  <tr 
                    key={staff.id} 
                    onClick={() => setSelectedStaff(staff)}
                    className="hover:bg-emerald-50 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {staff.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{staff.name}</p>
                          <p className="text-xs text-gray-500">{staff.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{staff.mobile}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-semibold">
                        {staff.assignedBay}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-800 font-bold text-lg">{staff.todayEntries}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-800 font-bold">{staff.avgTime}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        staff.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-700'
                          : staff.status === 'On break'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {staff.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-600">Showing 1-6 of 12 staff</p>
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

      {/* Staff Detail Modal */}
      {selectedStaff && (
        <StaffModal staff={selectedStaff} onClose={() => setSelectedStaff(null)} />
      )}
         </div>
    </div>
  );
};

export default MyStaff;