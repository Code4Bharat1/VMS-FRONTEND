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
        bg-white
        border-r border-gray-200
        flex flex-col
        transform transition-all duration-300 ease-in-out
        ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        text-sm text-gray-700
      `}
    >
      {/* ================= LOGO ================= */}
      <div
        className={`h-16 px-4 flex items-center border-b border-gray-200 ${
          collapsed ? "justify-center" : "justify-between"
        }`}
      >
        <div
          className={`flex items-center justify-center gap-3 overflow-hidden ${
            collapsed && "hidden"
          }`}
        >
          <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-lg">V</span>
          </div>

          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="font-semibold text-gray-800 text-lg">VMS</span>
              <span className="text-[11px] text-gray-500">Staff Panel</span>
            </div>
          )}
        </div>

        {/* DESKTOP COLLAPSE */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:block p-1.5 rounded-md hover:bg-emerald-100 transition cursor-pointer"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* ================= MENU ================= */}
      <nav className="flex-1 flex flex-col px-2 py-4 space-y-2 overflow-y-auto scrollbar-thin">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link key={item.href} href={item.href}>
              <div
                onClick={() => setMobileOpen(false)}
                className={`
                  group flex items-center gap-3
                  px-4 py-2.5 rounded-lg
                  transition-all duration-200
                  ${
                    active
                      ? "bg-emerald-100 text-emerald-700 font-medium"
                      : "text-gray-600 hover:bg-emerald-50"
                  }
                  ${collapsed ? "justify-center px-2" : ""}
                  active:scale-[0.97]
                `}
              >
                <Icon
                  size={20}
                  className={`shrink-0 ${
                    active ? "text-emerald-600" : "text-gray-500"
                  }`}
                />
                {!collapsed && (
                  <span className="whitespace-nowrap">{item.label}</span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* ================= LOGOUT ================= */}
      <div className="px-2 py-3 border-t border-gray-200">
        <div
          onClick={() => {
            setMobileOpen(false);

            localStorage.removeItem("accessToken");
            localStorage.removeItem("user");

            window.location.href = "/login";
          }}
          className={`
            flex items-center gap-3
            px-4 py-2.5 rounded-lg
            cursor-pointer
            text-gray-600
            hover:bg-red-50 hover:text-red-600
            transition-all duration-200
            ${collapsed ? "justify-center px-2" : ""}
            active:scale-[0.97]
          `}
        >
          <LogOut size={20} />
          {!collapsed && <span>Logout</span>}
        </div>
      </div>
    </aside>
  );
}