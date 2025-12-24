"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import Sidebar from "@/components/admin/Sidebar";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function StaffLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <ProtectedRoute role="admin">
      <div className="h-screen flex bg-[#f5f7fa] overflow-hidden">
        {/* ===== DESKTOP SIDEBAR ===== */}
        <div className="hidden lg:block">
          <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        </div>

        {/* ===== MOBILE SIDEBAR (ALWAYS MOUNTED) ===== */}
        <div
          className={`
          fixed inset-0 z-50 lg:hidden
          transition-opacity duration-300
          ${
            mobileOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }
        `}
        >
          {/* OVERLAY */}
          <div
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-black/40"
          />

          {/* SLIDING DRAWER */}
          <div
            className={`
            absolute left-0 top-0 h-full w-64 bg-white shadow-xl
            transform transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
            ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          `}
          >
            <Sidebar
              collapsed={false}
              setCollapsed={() => {}}
              onClose={() => setMobileOpen(false)}
            />
          </div>
        </div>

        {/* ===== MAIN CONTENT ===== */}
        <div className="flex-1 flex flex-col">
          {/* MOBILE TOP BAR */}
          <div className="lg:hidden h-[56px] bg-white border-b px-4 flex items-center justify-between">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              <Menu size={22} />
            </button>

            <span className="font-semibold text-gray-800">Admin Panel</span>

            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-semibold">
              A
            </div>
          </div>

          {/* PAGE CONTENT */}
          <main
            className={`
            flex-1 overflow-y-auto transition-all duration-300
            ${collapsed ? "lg:ml-0" : "lg:ml-0"}
          `}
          >
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
