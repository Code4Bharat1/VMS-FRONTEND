"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ScanLine,
  Edit,
  List,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

const menuItems = [
  { label: "Security Dashboard", href: "/staff/dashboard", icon: LayoutDashboard },
  { label: "OCR / ANPR", href: "/staff/ocr-anpr", icon: ScanLine },
  { label: "Manual Entry", href: "/staff/ManualEntry", icon: Edit },
  { label: "My Entries", href: "/staff/MyEntries", icon: List },
  { label: "My Settings", href: "/staff/SettingPage", icon: Settings },
];

export default function Sidebar({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside
      className={`
        fixed lg:static inset-y-0 left-0 z-50
        ${collapsed ? "w-20" : "w-64"}
        bg-gradient-to-b from-emerald-50 to-white
        border-r border-gray-200
        flex flex-col
        transform transition-all duration-300 ease-in-out
        ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
    >
      {/* ================= MOBILE HEADER ================= */}
      <div className="lg:hidden flex items-center justify-between px-4 h-14 border-b">
        <span className="font-semibold text-gray-800">Menu</span>
        <button
          onClick={() => setMobileOpen(false)}
          className="p-1 rounded hover:bg-gray-100"
        >
          <X size={20} />
        </button>
      </div>

      {/* ================= LOGO ================= */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-gray-300">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">V</span>
          </div>
          {!collapsed && (
            <span className="font-bold text-gray-800 text-lg">VMS</span>
          )}
        </div>

        {/* DESKTOP COLLAPSE */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:block p-1 rounded hover:bg-gray-100"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* ================= MENU ================= */}
      <nav className="flex-1 p-3 space-y-1 text-[15px] overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link key={item.href} href={item.href}>
              <div
                onClick={() => setMobileOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-2.5 rounded-lg
                  transition-colors
                  ${
                    active
                      ? "bg-emerald-100 text-emerald-700 font-medium"
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

      {/* ================= LOGOUT ================= */}
      <div className="p-3 ">
        <div
          onClick={() => {
            localStorage.clear();
            router.push("/");
          }}
          className={`
            flex items-center gap-3 px-4 py-2.5 rounded-lg
            bg-red-500 text-white hover:bg-red-600 cursor-pointer
            ${collapsed ? "justify-center" : ""}
          `}
        >
          <LogOut size={20} />
          {!collapsed && <span>Logout</span>}
        </div>
      </div>
    </aside>
  );
}
