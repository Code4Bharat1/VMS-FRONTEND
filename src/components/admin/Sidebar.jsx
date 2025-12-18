"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  QrCode,
  ScanLine,
  Edit,
  List,
  Search,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const menu = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Search Records", href: "/admin/Search", icon: QrCode },
  { label: "Bay Management", href: "/staff/ocr-anpr", icon: ScanLine },
  { label: "Visitor Management", href: "/admin/Vendors", icon: Edit },
  { label: "Tenants Management", href: "/admin/Tenants", icon: List },
  { label: "Supervisors", href: "/admin/Supervisors", icon: Search },
  { label: "Staff", href: "/admin/Staff", icon: Settings },
  { label: "Reports", href: "/admin/Report", icon: Settings },
  { label: "Settings", href: "/staff/SettingPage", icon: Settings },
];

export default function Sidebar({ collapsed, setCollapsed }) {
  const pathname = usePathname();
  return (
    <aside
      className={`
        fixed top-0 left-0 z-40 h-screen
        ${collapsed ? "w-20" : "w-64"}
        bg-white border-r
        flex flex-col
        transition-all duration-300
      `}
    >
      {/* LOGO + TOGGLE */}
      <div className="flex items-center justify-between px-4 py-4 border-b">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-lg bg-green-600 text-white flex items-center justify-center font-bold">
            V
          </div>

          {!collapsed && (
            <span className="font-semibold text-gray-800 text-lg whitespace-nowrap">
              VMS
            </span>
          )}
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)} // ✅ NOW WORKS
          className="p-1 rounded-md hover:bg-gray-100"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* MENU */}
      <nav className="flex-1 px-3 py-4 space-y-1 text-sm overflow-y-auto">
        {menu.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            pathname.startsWith(item.href + "/");

          return (
            <Link key={item.href} href={item.href}>
              <div
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer
                  transition-colors
                  ${
                    isActive
                      ? "bg-green-50 text-green-700 font-medium"
                      : "text-gray-600 hover:bg-gray-100"
                  }
                  ${collapsed ? "justify-center" : ""}
                `}
              >
                <Icon size={20} />
                {!collapsed && <span>{item.label}</span>}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* LOGOUT */}
      <div className="p-3 border-t">
        <Link href="/">
          <div
            className={`
              flex items-center gap-3 px-4 py-3 rounded-lg
              text-gray-600 hover:bg-red-50 hover:text-red-600
              cursor-pointer
              ${collapsed ? "justify-center" : ""}
            `}
          >
            <LogOut size={20} />
            {!collapsed && <span>Logout</span>}
          </div>
        </Link>
      </div>
    </aside>
  );
}
