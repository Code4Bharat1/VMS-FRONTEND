"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  Warehouse,
  IdCard,
  Building2,
  ShieldCheck,
  Users,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

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

export default function Sidebar({ collapsed, setCollapsed }) {
  const pathname = usePathname();

  return (
   <aside
  className={`
    ${collapsed ? "w-20" : "w-64"}
    h-screen fixed left-0 top-0 z-40
    flex flex-col
    bg-gradient-to-b from-emerald-50 to-white
    border-r border-gray-200
    transition-all duration-300
+   font-sans text-sm text-gray-700
  `}
>

      {/* LOGO + TOGGLE */}
      <div className="p-4 flex items-center justify-between border-b border-gray-200">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">V</span>
          </div>

          {!collapsed && (
            <span className="font-bold text-gray-800 text-lg whitespace-nowrap">
              VMS
            </span>
          )}
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-md hover:bg-gray-100"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* MENU */}
      <nav className="flex-1 p-3 space-y-1">
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
                  transition-all
                  ${
                    isActive
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
      <div className="p-3 border-t border-gray-200">
        <Link href="/">
          <div
            className={`
              flex items-center gap-3 px-4 py-3 rounded-lg
              text-gray-600 hover:bg-red-50 hover:text-red-600
              transition-all cursor-pointer
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
