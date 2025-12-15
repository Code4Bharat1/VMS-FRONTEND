"use client";
import React, { useState } from 'react';
import { Search, Calendar, ChevronDown, FileDown, LogOut, LayoutGrid, Users, Building, Settings } from 'lucide-react';
import Sidebar from './sidebar';

// Main Component
const SearchEntries = () => {
  const [activePage, setActivePage] = useState('search');
  const [dateRange, setDateRange] = useState('Today');
  const [entryMethod, setEntryMethod] = useState('All methods');
  const [bay, setBay] = useState('All bays (assigned)');
  const [staff, setStaff] = useState('All my staff');

  const entries = [
    { time: '09:22', bay: 'Bay A', vrn: 'QTR-58293', visitor: 'Mohammed Ali', company: 'Alpha Logistics', handledBy: 'Ali Hassan', method: 'OCR', direction: 'Entry' },
    { time: '09:18', bay: 'Bay C', vrn: 'QTR-99314', visitor: 'Sarah John', company: 'FreshFoods', handledBy: 'Sara Ibrahim', method: 'Manual', direction: 'Exit' },
    { time: '09:10', bay: 'Bay B', vrn: 'QTR-44120', visitor: 'Ravi Kumar', company: 'Metro Supplies', handledBy: 'John Peter', method: 'QR', direction: 'Entry' },
    { time: '09:05', bay: 'Bay A', vrn: 'QTR-78110', visitor: 'Imran Khan', company: 'City Courier', handledBy: 'Imran Khan', method: 'OCR', direction: 'Exit' },
    { time: '08:58', bay: 'Bay C', vrn: 'QTR-66821', visitor: 'Peter James', company: 'Delta Cold Chain', handledBy: 'Ravi Kumar', method: 'Manual', direction: 'Entry' }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activePage={activePage} onPageChange={setActivePage} />
      
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Search Entries</h1>
            <p className="text-sm text-gray-500 mt-1">Look up recent visitor entries for the bays and staff under your supervision.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
              <span className="text-sm font-medium text-orange-700">AK</span>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">Ahmed Khan</div>
              <div className="text-xs text-gray-500">Supervisor</div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white mx-8 mt-6 p-6 rounded-lg border border-gray-200">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-gray-900">Filters</h2>
            <p className="text-sm text-gray-500">Search within your assigned bays, staff, and recent time window.</p>
          </div>

          <div className="grid grid-cols-4 gap-4">
            {/* VRN */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">VRN</label>
              <input
                type="text"
                placeholder="e.g. QTR-58293"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* QID */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">QID</label>
              <input
                type="text"
                placeholder="Enter QID"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Mobile Number</label>
              <input
                type="text"
                placeholder="Enter mobile"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Visitor/Company */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Visitor / Company</label>
              <input
                type="text"
                placeholder="Name or company"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 mt-4">
            {/* Date range */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Date range</label>
              <div className="relative">
                <input
                  type="text"
                  value={dateRange}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <Calendar className="absolute right-3 top-2.5 text-gray-400" size={16} />
              </div>
            </div>

            {/* Entry method */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Entry method</label>
              <div className="relative">
                <select
                  value={entryMethod}
                  onChange={(e) => setEntryMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm appearance-none bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option>All methods</option>
                  <option>OCR</option>
                  <option>Manual</option>
                  <option>QR</option>
                </select>
                <ChevronDown className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" size={16} />
              </div>
            </div>

            {/* Bay */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Bay</label>
              <div className="relative">
                <select
                  value={bay}
                  onChange={(e) => setBay(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm appearance-none bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option>All bays (assigned)</option>
                  <option>Bay A</option>
                  <option>Bay B</option>
                  <option>Bay C</option>
                </select>
                <ChevronDown className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" size={16} />
              </div>
            </div>

            {/* Handled by staff */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Handled by staff</label>
              <div className="relative">
                <select
                  value={staff}
                  onChange={(e) => setStaff(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm appearance-none bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option>All my staff</option>
                  <option>Ali Hassan</option>
                  <option>Sara Ibrahim</option>
                  <option>John Peter</option>
                </select>
                <ChevronDown className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" size={16} />
              </div>
            </div>
          </div>

          {/* Quick filters */}
          <div className="flex items-center justify-between mt-6">
            <div className="flex gap-2">
              <span className="text-xs text-gray-600">Quick filters</span>
              <button className="px-3 py-1 bg-green-50 text-green-700 rounded-md text-xs font-medium">
                Last 2 hours
              </button>
              <button className="px-3 py-1 text-gray-600 hover:bg-gray-50 rounded-md text-xs font-medium">
                Today (all)
              </button>
              <button className="px-3 py-1 text-gray-600 hover:bg-gray-50 rounded-md text-xs font-medium">
                Only entries
              </button>
              <button className="px-3 py-1 text-gray-600 hover:bg-gray-50 rounded-md text-xs font-medium">
                Only exits
              </button>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-md text-sm font-medium">
                Clear
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700">
                Search entries
              </button>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="bg-white mx-8 mt-6 mb-6 p-6 rounded-lg border border-gray-200">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Results</h2>
              <p className="text-sm text-gray-500">Showing entries for your bays and staff only. Limited supervisor view.</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50">
              <FileDown size={16} />
              Export CSV
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 bg-gray-50">Time</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 bg-gray-50">Bay</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 bg-gray-50">VRN</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 bg-gray-50">Visitor Name</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 bg-gray-50">Company</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 bg-gray-50">Handled By</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 bg-gray-50">Method</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 bg-gray-50">Direction</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">{entry.time}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">{entry.bay}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">{entry.vrn}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{entry.visitor}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">{entry.company}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">{entry.handledBy}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">{entry.method}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">{entry.direction}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <p className="text-sm text-gray-500">Showing 1-5 of 32 entries</p>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-gray-400 text-sm font-medium cursor-not-allowed">
                Prev
              </button>
              <button className="px-3 py-1 text-green-600 text-sm font-medium hover:bg-green-50 rounded">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchEntries;