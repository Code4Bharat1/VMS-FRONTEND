"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building2,
  Search,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
} from "lucide-react";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    {
      id: "overview",
      icon: LayoutDashboard,
      label: "Supervisor Overview",
      href: "/supervisor/dashboard",
    },
    { id: "staff", icon: Users, label: "My Guards", href: "/supervisor/staff" },
    { id: "bays", icon: Building2, label: "My Bays", href: "/supervisor/bays" },
    { id: "search", icon: Search, label: "Search Entries", href: "/supervisor/search" },
    {
      id: "settings",
      icon: Settings,
      label: "My Settings",
      href: "/supervisor/settings",
    },
  ];

  return (
    <>
      {/* Mobile Hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded-lg shadow"
      >
        <Menu size={20} />
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static z-50
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
          ${collapsed ? "w-20" : "w-64"}
          bg-white
          h-[100dvh] md:h-screen
          flex flex-col border-r border-gray-200
          transition-all duration-300 ease-in-out
          text-sm text-gray-700
        `}
      >
        {/* Logo + Collapse */}
        <div
          className={`h-16 px-4 flex items-center border-b border-gray-200 shrink-0 ${
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
                <span className="text-[11px] text-gray-500">Supervisor Panel</span>
              </div>
            )}
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:block p-1.5 rounded-md hover:bg-emerald-100 transition cursor-pointer"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Menu (Scrollable on mobile) */}
        <nav className="flex-1 flex flex-col px-2 py-4 space-y-2 overflow-y-auto overscroll-contain scrollbar-thin">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setMobileOpen(false)}
              >
                <div
                  className={`
                    group flex items-center gap-3
                    px-4 py-2.5 rounded-lg
                    transition-all duration-200
                    cursor-pointer
                    ${
                      isActive
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
                      isActive ? "text-emerald-600" : "text-gray-500"
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

        {/* Logout – Sticky on Mobile */}
        <div
          className="
            sticky bottom-0
            md:static
            px-2 py-3
            border-t border-gray-200
            bg-white
            pb-[env(safe-area-inset-bottom)]
          "
        >
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
              text-red-600
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
    </>
  );
};

export default Sidebar;