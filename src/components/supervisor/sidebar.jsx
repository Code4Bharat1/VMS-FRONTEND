"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building2,
  Search,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useRouter } from "next/navigation";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const menuItems = [
    {
      id: "overview",
      icon: LayoutDashboard,
      label: "Supervisor Overview",
      href: "/supervisor/dashboard",
    },
    {
      id: "staff",
      icon: Users,
      label: "My Staff",
      href: "/supervisor/staff",
    },
    {
      id: "bays",
      icon: Building2,
      label: "My Bays",
      href: "/supervisor/bays",
    },
    {
      id: "search",
      icon: Search,
      label: "Search Entries",
      href: "/supervisor/search",
    },
    {
      id: "settings",
      icon: Settings,
      label: "My Settings",
      href: "/supervisor/settings",
    },
  ];

  return (
    <div
      className={`${
        collapsed ? "w-20" : "w-64"
      } bg-gradient-to-b from-emerald-50 to-white h-screen flex flex-col border-r border-gray-200 transition-all duration-300`}
    >
      {/* Logo + Toggle */}
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

      {/* Menu */}
      <nav className="flex-1 p-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link key={item.id} href={item.href}>
              <div
                className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all
                ${
                  isActive
                    ? "bg-emerald-100 text-emerald-700 font-medium"
                    : "text-gray-600 hover:bg-gray-100"
                }
                ${collapsed ? "justify-center" : ""}`}
              >
                <Icon size={20} />
                {!collapsed && <span>{item.label}</span>}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-gray-200">
<div className="p-3 border-t border-gray-200">
  {/* Logout */}
  <div
    onClick={() => router.push("/")}
    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all cursor-pointer ${
      collapsed ? "justify-center" : ""
    }`}
  >
    <LogOut size={20} />
    {!collapsed && <span>Logout</span>}
  </div>
</div>

      </div>
    </div>
  );
};

export default Sidebar;
