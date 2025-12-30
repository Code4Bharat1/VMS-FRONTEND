"use client";
import React, { useState, useEffect } from 'react';
import { Search, Calendar, ChevronDown, FileDown, LogOut, LayoutGrid, Users, Building, Settings, Eye, EyeOff, Shield, Bell, Globe, Clock, Monitor, Smartphone } from 'lucide-react';
import Sidebar from './sidebar';

// Main Settings Component
const VMSSettings = () => {
  const [activePage, setActivePage] = useState('settings');
  const [showPassword, setShowPassword] = useState(false);
  const [notificationChannel, setNotificationChannel] = useState('in-app');
  const [defaultView, setDefaultView] = useState('supervisor');
  const [timeWindow, setTimeWindow] = useState('Today');
  const [language, setLanguage] = useState('English (Qatar)');
  const [supervisor, setSupervisor] = useState(null);

useEffect(() => {
  const storedUser = localStorage.getItem("user");

  if (storedUser) {
    setSupervisor(JSON.parse(storedUser));
  }
}, []);
  return (
    <div className="flex h-screen bg-teal-50">
      <Sidebar activePage={activePage} onPageChange={setActivePage} />
      
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">My Settings</h1>
            <p className="text-sm text-gray-500 mt-1">Manage your supervisor profile, notifications, and preferences for staff and bays you oversee.</p>
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

        <div className="p-8 max-w-7xl mx-auto">
          {/* Profile Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Profile & Contact</h2>
                <p className="text-sm text-gray-500">Basic information used across reports and staff panels</p>
              </div>
              <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                Supervisor
              </span>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Full name</label>
                  <input
                    type="text"
                    value="Ahmed Khan"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Mobile number</label>
                  <input
                    type="text"
                    value="+974 5555 1234"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value="supervisor@example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Assigned bays</label>
                  <div className="relative">
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
                      <option>Bay A, Bay B</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" size={16} />
                  </div>
                  <p className="text-xs text-gray-500 mt-1.5">You can only view and manage activity for bays assigned to you.</p>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                <button className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-md text-sm font-medium transition-colors">
                  Cancel
                </button>
                <button className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors">
                  Save profile
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Notification Preferences */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-base font-semibold text-gray-900">Notification Preferences</h2>
                <p className="text-sm text-gray-500">Choose when to be notified about staff and bay activity</p>
              </div>
              
              <div className="p-6 space-y-5">
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
                  <h3 className="text-sm font-medium text-gray-900 mb-1">Bay alerts</h3>
                  <p className="text-xs text-gray-600">Get alerts when queues build up at your bays.</p>
                </div>

                <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
                  <h3 className="text-sm font-medium text-gray-900 mb-1">Staff performance notifications</h3>
                  <p className="text-xs text-gray-600">Daily summary of entries captured by your staff.</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Preferred channel</label>
                  <p className="text-xs text-gray-500 mb-3">Where we send important updates.</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setNotificationChannel('in-app')}
                      className={`flex-1 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                        notificationChannel === 'in-app'
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      In-app only
                    </button>
                    <button
                      onClick={() => setNotificationChannel('email')}
                      className={`flex-1 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                        notificationChannel === 'email'
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Email
                    </button>
                    <button
                      onClick={() => setNotificationChannel('sms')}
                      className={`flex-1 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                        notificationChannel === 'sms'
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      SMS
                    </button>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-200">
                  <button className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors">
                    Update alerts
                  </button>
                </div>
              </div>
            </div>

            {/* Workspace Preferences */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-base font-semibold text-gray-900">Workspace Preferences</h2>
                <p className="text-sm text-gray-500">Control what you see for your staff and bays</p>
              </div>
              
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-3">Default view</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setDefaultView('supervisor')}
                      className={`flex-1 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                        defaultView === 'supervisor'
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Supervisor overview
                    </button>
                    <button
                      onClick={() => setDefaultView('staff')}
                      className={`flex-1 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                        defaultView === 'staff'
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      My staff
                    </button>
                    <button
                      onClick={() => setDefaultView('bays')}
                      className={`flex-1 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                        defaultView === 'bays'
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      My bays
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Time window for metrics</label>
                  <div className="relative">
                    <select
                      value={timeWindow}
                      onChange={(e) => setTimeWindow(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option>Today</option>
                      <option>Last 7 days</option>
                      <option>Last 30 days</option>
                      <option>This month</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" size={16} />
                  </div>
                  <p className="text-xs text-gray-500 mt-1.5">Affects default charts and tables in your supervisor dashboards.</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Language & region</label>
                  <div className="relative">
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option>English (Qatar)</option>
                      <option>العربية (قطر)</option>
                      <option>English (US)</option>
                      <option>English (UK)</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" size={16} />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-200">
                  <button className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors">
                    Save preferences
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Security Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-base font-semibold text-gray-900">Access & Security</h2>
              <p className="text-sm text-gray-500">Manage login details and see where your account is active</p>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value="••••••••"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm pr-20 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-12 top-2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                    <button className="absolute right-3 top-2 text-green-600 hover:text-green-700 text-xs font-medium">
                      Change
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Two-step verification</label>
                  <div className="flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">SMS code</span>
                    </div>
                    <span className="text-xs text-gray-500">Recommended</span>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-xs font-medium text-gray-700 mb-3">Active sessions</label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-md bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white border border-gray-200 rounded-md flex items-center justify-center">
                        <Monitor className="text-gray-600" size={20} />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">Desktop browser - This device</div>
                        <div className="text-xs text-gray-500">Last active: just now</div>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                      Current
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white border border-gray-200 rounded-md flex items-center justify-center">
                        <Smartphone className="text-gray-600" size={20} />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">Mobile browser</div>
                        <div className="text-xs text-gray-500">Last active: 3 hours ago</div>
                      </div>
                    </div>
                    <button className="text-xs text-red-600 hover:text-red-700 font-medium">
                      Sign out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VMSSettings;