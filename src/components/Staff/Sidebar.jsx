"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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

const menuItems = [
  { id: "dashboard", label: "Security Dashboard", href: "/staff/dashboard", icon: LayoutDashboard },
  // { id: "qr-scan", label: "QR Scan", href: "/staff/QREntry", icon: QrCode },
  { id: "ocr-anpr", label: "OCR / ANPR", href: "/staff/ocr-anpr", icon: ScanLine },
  { id: "manual-entry", label: "Manual Entry", href: "/staff/ManualEntry", icon: Edit },
  { id: "my-entries", label: "My Entries", href: "/staff/MyEntries", icon: List },
  // { id: "search-entries", label: "Search Entries", href: "/staff/SearchEntry", icon: Search },
  { id: "my-settings", label: "My Settings", href: "/staff/SettingPage", icon: Settings },
];

const Sidebar = ({ collapsed, setCollapsed }) => {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-40
        ${collapsed ? "w-20" : "w-64"}
        bg-gradient-to-b from-emerald-50 to-white
        border-r border-gray-200
        flex flex-col
        transition-[width] duration-300
      `}
    >
      {/* LOGO */}
      <div className="h-16 px-4 flex items-center justify-between border-gray-200 border-b-2 p-4">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">V</span>
          </div>
          {!collapsed && (
            <span className="font-bold text-gray-800 text-lg">VMS</span>
          )}
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded hover:bg-gray-100"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* MENU */}
      <nav className="flex-1 p-3 py-2 text-[16px] space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link key={item.id} href={item.href}>
              <div
                className={`
                  flex items-center gap-3 px-4 py-2.5 rounded-lg
                  transition-colors
                  ${isActive
                    ? "bg-emerald-100 text-emerald-700 font-medium"
                    : "text-gray-600 hover:bg-gray-100"}
                  ${collapsed ? "justify-center" : ""}
                `}
              >
                <Icon size={20} />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* LOGOUT */}
      <div className="p-3 border-t">
        <div
          onClick={() => {
            localStorage.clear();
            router.push("/");
          }}
          className={`
            flex items-center gap-3 px-4 py-2.5 rounded-lg
            text-white hover:bg-red-50 hover:text-red-600
            cursor-pointer bg-red-500
            ${collapsed ? "justify-center" : ""}
          `}
        >
          <LogOut size={20} />
          {!collapsed && <span>Logout</span>}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
