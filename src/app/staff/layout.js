"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import Sidebar from "@/components/Staff/Sidebar";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function StaffLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    // <ProtectedRoute role="staff">
      <div className="h-screen flex bg-[#f5f7fa] text-[13px] text-gray-700 overflow-hidden">
        {/* ================= SIDEBAR ================= */}
        <Sidebar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />

        {/* ================= MOBILE OVERLAY ================= */}
        {mobileOpen && (
          <div
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          />
        )}

        {/* ================= MAIN ================= */}
        <div className="flex-1 flex flex-col">
          <div className="lg:hidden h-14  shadow-md px-4 flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)}>
              <Menu size={22} />
            </button>
             
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
    // </ProtectedRoute>
  );
}
