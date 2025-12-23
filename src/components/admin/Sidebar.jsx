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
  X,
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
  { label: "Settings", href: "/staff/SettingPage", icon: Settings },
];

/* ================= SIDEBAR ================= */
export default function Sidebar({
  collapsed = false,
  setCollapsed = () => {},
  onClose,
}) {
  const pathname = usePathname();

  return (
    <aside
      className={`
        h-screen
        ${collapsed ? "w-20" : "w-64"}
        flex flex-col
        bg-gradient-to-b from-emerald-50 to-white
        border-r border-gray-200
        transition-[width] duration-300
        text-sm text-gray-700
      `}
    >
      {/* MOBILE HEADER */}
      {onClose && (
        <div className="lg:hidden flex items-center justify-between px-4 h-[56px] border-b">
          <span className="font-semibold text-gray-800">Menu</span>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X size={20} />
          </button>
        </div>
      )}

      {/* LOGO */}
      <div className="p-4 flex items-center justify-between border-b">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">V</span>
          </div>
          {!collapsed && (
            <span className="font-bold text-gray-800 text-lg">VMS</span>
          )}
        </div>

        {!onClose && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        )}
      </div>

      {/* MENU */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menu.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href ||
            pathname.startsWith(item.href + "/");

          return (
            <Link key={item.href} href={item.href}>
              <div
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg
                  transition-colors duration-200
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

      {/* LOGOUT */}
      <div className="p-3 border-t">
        <Link href="/">
          <div
            className={`
              flex items-center gap-3 px-4 py-3 rounded-lg
              text-gray-600 hover:bg-red-50 hover:text-red-600
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
