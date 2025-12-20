"use client";

import { useState } from "react";
import Sidebar from "@/components/Staff/Sidebar";

export default function StaffLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="h-screen flex overflow-hidden bg-[#f5f7fa] text-[13px] text-gray-700">
      {/* SIDEBAR */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* MAIN CONTENT */}
      <main
        className={`
          flex-1 overflow-y-auto transition-all duration-300
          ${collapsed ? "ml-20" : "ml-64"}
        `}
      >
        {children}
      </main>
    </div>
  );
}
