"use client";

import React, { useState } from "react";
import clsx from "clsx";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import AdminSidebar from "@/components/layout/AdminSidebar";
import AdminTopbar from "@/components/layout/AdminTopbar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-[#141414] text-white overflow-hidden">
      {/* SIDEBAR */}
      <AdminSidebar open={sidebarOpen} onToggle={setSidebarOpen} />

      {/* OVERLAY khi mở sidebar trên mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* MAIN AREA */}
      <div
        className={clsx(
          "flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out",
          sidebarOpen ? "md:ml-64" : "md:ml-16"
        )}
      >
        {/* TOPBAR */}
        <div className="sticky top-0 z-20 bg-[#141414] border-b border-slate-800 flex items-center p-4">
          {/* Nút menu chỉ hiện trên mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-white mr-2"
            onClick={() => setSidebarOpen((prev) => !prev)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <AdminTopbar />
        </div>

        {/* MAIN CONTENT */}
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
