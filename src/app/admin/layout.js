"use client";

import React from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/admin/Sidebar";

export default function AdminRootLayout({ children }) {
  return (
    <ProtectedRoute requireAdmin={true}>
      <div className="w-full flex min-h-screen">
        {/* Sidebar */}
        <Sidebar />

        {/* Page Content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </ProtectedRoute>
  );
}
