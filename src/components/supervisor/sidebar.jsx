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
    { id: "staff", icon: Users, label: "My Staff", href: "/supervisor/staff" },
    { id: "bays", icon: Building2, label: "My Bays", href: "/supervisor/bays" },
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
          bg-linear-to-b from-emerald-50 to-white
          h-dvh md:h-screen
          flex flex-col border-r border-gray-200
          transition-all duration-300
        `}
      >
        {/* Logo + Collapse */}
        <div className="p-4 flex items-center justify-between border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold">
              V
            </div>
            {!collapsed && <span className="font-bold text-lg">VMS</span>}
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:block p-1 rounded-md hover:bg-gray-100"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Menu (Scrollable on mobile) */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto overscroll-contain">
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
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all cursor-pointer
                    ${
                      isActive
                        ? "bg-emerald-100 text-emerald-700 font-medium"
                        : "text-gray-600 hover:bg-emerald-100/40"
                    }
                    ${collapsed ? "justify-center" : ""}
                    active:scale-[0.98]
                  `}
                >
                  <Icon size={20} />
                  {!collapsed && <span>{item.label}</span>}
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
            p-3
            border-t border-gray-200
            bg-white
            pb-[env(safe-area-inset-bottom)]
          "
        >
          <div
            onClick={() => {
              setMobileOpen(false);
              router.push("/");
            }}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer
              text-gray-600 hover:bg-red-50 hover:text-red-600
              ${collapsed ? "justify-center" : ""}
              active:scale-[0.98]
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
