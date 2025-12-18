// "use client";

// import React from "react";
// import ProtectedRoute from "@/components/ProtectedRoute";
// import Sidebar from "@/components/admin/Sidebar";

// export default function AdminRootLayout({ children }) {
//   return (
//     <ProtectedRoute requireAdmin={true}>
//       <div className="w-full flex min-h-screen">
//         {/* Sidebar */}
//         <Sidebar />

//         {/* Page Content */}
//         <main className="flex-1 p-6">{children}</main>
//       </div>
//     </ProtectedRoute>
//   );
// }
"use client";

import { useState } from "react";
import Sidebar from "@/components/admin/Sidebar";

export default function StaffLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="h-screen flex overflow-hidden bg-[#f5f7fa] text-[13px] text-gray-700">
      {/* SIDEBAR */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* MAIN CONTENT */}
      <main
        className={`
          flex-1 overflow-y-auto p-4 sm:p-6 transition-all duration-300
          ${collapsed ? "ml-20" : "ml-64"}
        `}
      >
        {children}
      </main>
    </div>
  );
}
