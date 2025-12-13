"use client";
import { CarTaxiFront, ChevronLeft } from "lucide-react";
import React, { useState } from "react";

const Sidebar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <>
      <aside
        className={`${
          menuOpen ? "w-60" : "w-24"
        } flex transition-all duration-500 ease-in-out fixed min-h-screen flex-col items-center justify-start bg-white border-r-2 border-light-green/50`}
      >
        <div
          onClick={() => setMenuOpen((prev) => !prev)}
          className={`
            ${menuOpen ? "rotate-0" : "rotate-180"}
          absolute -right-5 top-4 transition-all duration-500 cursor-pointer size-10 text-green rounded-full flex items-center justify-center bg-light-green
          `}
        >
          <ChevronLeft />
        </div>
        <div className="flex items-center justify-center gap-5 w-full self-center md:self-start p-4">
          <div className="bg-green-100 size-10 text-green-700 flex items-center justify-center rounded-lg p-1">
            <CarTaxiFront size={24} />
          </div>
          <span
            className={`font-semibold text-green text-xl ${
              menuOpen ? "md:inline" : "hidden"
            }`}
          >
            VMS
          </span>
        </div>
        <hr className="w-full border-b-2 border-t-0 border-light-green/50 py-1" />
      </aside>
    </>
  );
};

export default Sidebar;
