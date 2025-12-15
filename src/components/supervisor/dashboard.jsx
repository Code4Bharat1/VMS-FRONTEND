"use client";
import React, { useState } from 'react';
import { LayoutDashboard, Users, Building2, Search, Settings, LogOut, ChevronRight, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import Sidebar from './sidebar';

const SupervisorDashboard = () => {
  const [activeView, setActiveView] = useState('daily');

  const staffData = [
    { name: 'Ali Hassan', mobile: '+974 5540 1234', entries: 86, avgTime: '16s', status: 'Active' },
    { name: 'Sara Ibrahim', mobile: '+974 5540 5678', entries: 72, avgTime: '19s', status: 'Active' },
    { name: 'John Peter', mobile: '+974 5540 9012', entries: 64, avgTime: '21s', status: 'On break' },
    { name: 'Imran Khan', mobile: '+974 5540 3456', entries: 58, avgTime: '17s', status: 'Active' },
    { name: 'Ravi Kumar', mobile: '+974 5540 7890', entries: 42, avgTime: '20s', status: 'Active' },
  ];

  const recentUpdates = [
    { time: 'Today b7 09:20', action: 'Reviewed morning entries for Bay A' },
    { time: 'Today b7 08:45', action: 'Reassigned Sara to Bay C' },
    { time: 'Yesterday b7 18:10', action: 'Closed incident review' },
    { time: '2 days ago b7 14:30', action: 'Approved overtime for Ali' },
  ];

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

        {/* Stats Cards */}
        <div className="px-8 py-6">
          <div className="grid grid-cols-4 gap-6 mb-8">
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
                <p className="text-gray-500 text-sm font-medium">Today's Entries Captured</p>
                <TrendingUp className="text-blue-600" size={20} />
              </div>
              <h3 className="text-3xl font-bold text-gray-800">384</h3>
              <p className="text-green-600 text-sm mt-1 font-medium">↑ 12% from yesterday</p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-500 text-sm font-medium">Avg Processing Time</p>
                <Clock className="text-purple-600" size={20} />
              </div>
              <h3 className="text-3xl font-bold text-gray-800">18s</h3>
              <p className="text-gray-400 text-sm mt-1">Target: <span className="text-emerald-600 font-medium">20s</span></p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-500 text-sm font-medium">Active Bays Now</p>
                <Building2 className="text-orange-600" size={20} />
              </div>
              <h3 className="text-3xl font-bold text-gray-800">3</h3>
              <p className="text-gray-400 text-sm mt-1">Your assigned bays</p>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Staff Performance</h2>
              <p className="text-gray-500 text-sm">Performance overview of security staff under your supervision.</p>
            </div>
            <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
              {['Daily', 'Weekly', 'Monthly'].map((view) => (
                <button
                  key={view}
                  onClick={() => setActiveView(view.toLowerCase())}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    activeView === view.toLowerCase()
                      ? 'bg-white text-emerald-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {view}
                </button>
              ))}
            </div>
          </div>

          {/* Staff Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-8">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Staff Name</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Mobile Number</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Today's Entry Count</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Average Processing Time</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {staffData.map((staff, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {staff.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className="font-medium text-gray-800">{staff.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{staff.mobile}</td>
                      <td className="px-6 py-4">
                        <span className="text-gray-800 font-semibold">{staff.entries}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-800 font-semibold">{staff.avgTime}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          staff.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-orange-100 text-orange-700'
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
              <p className="text-sm text-gray-600">Showing 1-5 of 12 staff</p>
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

          {/* Recent Updates */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-2">My Recent Updates</h2>
            <p className="text-gray-500 text-sm mb-6">Latest actions and interactions performed by you as a supervisor.</p>
            
            <div className="space-y-4">
              {recentUpdates.map((update, index) => (
                <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="w-2 h-2 bg-emerald-600 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-gray-800 font-medium">{update.action}</p>
                    <p className="text-gray-500 text-sm mt-1">{update.time}</p>
                  </div>
                  <ChevronRight className="text-gray-400" size={20} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupervisorDashboard;