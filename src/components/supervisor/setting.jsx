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
    <div className="flex h-screen bg-emerald-50/60">
      <Sidebar activePage={activePage} onPageChange={setActivePage} />
      
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-white border-b border-emerald-100 px-4 sm:px-8 py-4 sm:py-6 flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-xl font-bold text-emerald-800">My Settings</h1>
            <p className="text-sm text-emerald-600 mt-1">Manage your supervisor profile, notifications, and preferences for staff and bays you oversee.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold">
              {(supervisor?.name || '')
                .split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()}
            </div>

            <div>
              <h2 className="text-sm sm:text-base font-semibold text-emerald-800">
                {supervisor?.name || 'Supervisor'}
              </h2>

              <p className="text-emerald-600 text-xs sm:text-sm">
                {supervisor?.role || 'Supervisor'}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-8 max-w-7xl mx-auto">
          {/* Profile Card */}
          <div className="bg-white rounded-xl border border-emerald-100 shadow-sm mb-6">
            <div className="px-6 py-4 border-b border-emerald-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-emerald-800">Profile & Contact</h2>
                <p className="text-sm text-emerald-600">Basic information used across reports and staff panels</p>
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                Supervisor
              </span>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-emerald-700 mb-2">Full name</label>
                  <input
                    type="text"
                    value="Ahmed Khan"
                    className="w-full px-3 py-2 border border-emerald-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-emerald-700 mb-2">Mobile number</label>
                  <input
                    type="text"
                    value="+974 5555 1234"
                    className="w-full px-3 py-2 border border-emerald-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-emerald-700 mb-2">Email</label>
                  <input
                    type="email"
                    value="supervisor@example.com"
                    className="w-full px-3 py-2 border border-emerald-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-emerald-700 mb-2">Assigned bays</label>
                  <div className="relative">
                    <select className="w-full px-3 py-2 border border-emerald-200 rounded-lg text-sm appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                      <option>Bay A, Bay B</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-2.5 text-emerald-400 pointer-events-none" size={16} />
                  </div>
                  <p className="text-xs text-emerald-600 mt-1.5">You can only view and manage activity for bays assigned to you.</p>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-emerald-100">
                <button className="px-4 py-2 text-emerald-600 hover:bg-emerald-50 rounded-lg text-sm font-medium transition-colors">
                  Cancel
                </button>
                <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
                  Save profile
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Notification Preferences */}
            <div className="bg-white rounded-xl border border-emerald-100 shadow-sm">
              <div className="px-6 py-4 border-b border-emerald-100">
                <h2 className="text-base font-semibold text-emerald-800">Notification Preferences</h2>
                <p className="text-sm text-emerald-600">Choose when to be notified about staff and bay activity</p>
              </div>
              
              <div className="p-6 space-y-5">
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-lg">
                  <h3 className="text-sm font-medium text-emerald-800 mb-1">Bay alerts</h3>
                  <p className="text-xs text-emerald-600">Get alerts when queues build up at your bays.</p>
                </div>

                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-lg">
                  <h3 className="text-sm font-medium text-emerald-800 mb-1">Staff performance notifications</h3>
                  <p className="text-xs text-emerald-600">Daily summary of entries captured by your staff.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-emerald-700 mb-2">Preferred channel</label>
                  <p className="text-xs text-emerald-600 mb-3">Where we send important updates.</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setNotificationChannel('in-app')}
                      className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        notificationChannel === 'in-app'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      In-app only
                    </button>
                    <button
                      onClick={() => setNotificationChannel('email')}
                      className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        notificationChannel === 'email'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      Email
                    </button>
                    <button
                      onClick={() => setNotificationChannel('sms')}
                      className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        notificationChannel === 'sms'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      SMS
                    </button>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-emerald-100">
                  <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
                    Update alerts
                  </button>
                </div>
              </div>
            </div>

            {/* Workspace Preferences */}
            <div className="bg-white rounded-xl border border-emerald-100 shadow-sm">
              <div className="px-6 py-4 border-b border-emerald-100">
                <h2 className="text-base font-semibold text-emerald-800">Workspace Preferences</h2>
                <p className="text-sm text-emerald-600">Control what you see for your staff and bays</p>
              </div>
              
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-emerald-700 mb-3">Default view</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setDefaultView('supervisor')}
                      className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        defaultView === 'supervisor'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      Supervisor overview
                    </button>
                    <button
                      onClick={() => setDefaultView('staff')}
                      className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        defaultView === 'staff'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      My staff
                    </button>
                    <button
                      onClick={() => setDefaultView('bays')}
                      className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        defaultView === 'bays'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      My bays
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-emerald-700 mb-2">Time window for metrics</label>
                  <div className="relative">
                    <select
                      value={timeWindow}
                      onChange={(e) => setTimeWindow(e.target.value)}
                      className="w-full px-3 py-2 border border-emerald-200 rounded-lg text-sm appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    >
                      <option>Today</option>
                      <option>Last 7 days</option>
                      <option>Last 30 days</option>
                      <option>This month</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-2.5 text-emerald-400 pointer-events-none" size={16} />
                  </div>
                  <p className="text-xs text-emerald-600 mt-1.5">Affects default charts and tables in your supervisor dashboards.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-emerald-700 mb-2">Language & region</label>
                  <div className="relative">
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full px-3 py-2 border border-emerald-200 rounded-lg text-sm appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    >
                      <option>English (Qatar)</option>
                      <option>العربية (قطر)</option>
                      <option>English (US)</option>
                      <option>English (UK)</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-2.5 text-emerald-400 pointer-events-none" size={16} />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-emerald-100">
                  <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
                    Save preferences
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Security Section */}
          <div className="bg-white rounded-xl border border-emerald-100 shadow-sm mt-6">
            <div className="px-6 py-4 border-b border-emerald-100">
              <h2 className="text-base font-semibold text-emerald-800">Access & Security</h2>
              <p className="text-sm text-emerald-600">Manage login details and see where your account is active</p>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-emerald-700 mb-2">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value="••••••••"
                      className="w-full px-3 py-2 border border-emerald-200 rounded-lg text-sm pr-20 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-12 top-2 text-emerald-400 hover:text-emerald-600"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                    <button className="absolute right-3 top-2 text-emerald-600 hover:text-emerald-700 text-xs font-medium">
                      Change
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-emerald-700 mb-2">Two-step verification</label>
                  <div className="flex items-center justify-between px-3 py-2 border border-emerald-200 rounded-lg bg-emerald-50">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      <span className="text-sm text-emerald-800">SMS code</span>
                    </div>
                    <span className="text-xs text-emerald-600">Recommended</span>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-emerald-700 mb-3">Active sessions</label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 border border-emerald-200 rounded-lg bg-emerald-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white border border-emerald-200 rounded-lg flex items-center justify-center">
                        <Monitor className="text-emerald-600" size={20} />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-emerald-800">Desktop browser - This device</div>
                        <div className="text-xs text-emerald-600">Last active: just now</div>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                      Current
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-emerald-200 rounded-lg hover:bg-emerald-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white border border-emerald-200 rounded-lg flex items-center justify-center">
                        <Smartphone className="text-emerald-600" size={20} />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-emerald-800">Mobile browser</div>
                        <div className="text-xs text-emerald-600">Last active: 3 hours ago</div>
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