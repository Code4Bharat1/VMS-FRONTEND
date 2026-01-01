"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  Warehouse,
  IdCard,
  ShieldCheck,
  Users,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

/* ================= MENU ================= */
const menu = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Search Records", href: "/admin/Search", icon: Search },
  { label: "Bay Management", href: "/admin/Bay", icon: Warehouse },
  { label: "Vendor Management", href: "/admin/Vendors", icon: IdCard },
  { label: "Supervisors", href: "/admin/Supervisors", icon: ShieldCheck },
  { label: "Staff", href: "/admin/Staff", icon: Users },
  { label: "Reports", href: "/admin/Report", icon: BarChart3 },
  { label: "Settings", href: "/admin/SettingPage", icon: Settings },
  { label: "Pending Staff", href: "/admin/Pending", icon: Users },
];

/* ================= SIDEBAR ================= */
export default function Sidebar({
  collapsed = false,
  setCollapsed = () => {},
  onClose, // mobile close handler
}) {
  const pathname = usePathname();

  return (
    <aside
      className={`
        h-screen
        ${collapsed ? "w-20" : "w-64"}
        flex flex-col
bg-white
        border-r border-gray-200
        transition-[width] duration-300 ease-in-out
        text-sm text-gray-700
      `}
    >
      {/* ================= HEADER / LOGO ================= */}
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
              <span className="text-[11px] text-gray-500">Admin Panel</span>
            </div>
          )}
        </div>

        {!onClose && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-md hover:bg-emerald-100 transition cursor-pointer"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        )}
      </div>

      {/* ================= NAVIGATION ================= */}
      <nav className="flex-1 flex flex-col px-2 py-4 space-y-2 scrollbar-thin">
        {menu.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => {
                if (onClose) onClose();
              }}
            >
              <div
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
      <div className="px-2 py-3 border-t border-gray-200 text-red-500">
        <div
          onClick={() => {
            if (onClose) onClose();

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
