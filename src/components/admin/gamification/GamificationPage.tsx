"use client";

import React, { useState } from "react";
import { 
  Trophy, 
  Users, 
  Settings, 
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import AchievementManager from "./AchievementManager";
import UserGrantManager from "./UserGrantManager";

type Tab = "achievements" | "users" | "settings";

export default function GamificationPage() {
  const [activeTab, setActiveTab] = useState<Tab>("achievements");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Gamification & Danh Hiệu</h1>
          <p className="text-muted-foreground text-gray-400 mt-2">
            Quản lý hệ thống thành tích, danh hiệu và cấp phát cho người dùng.
          </p>
        </div>
      </div>

      {/* Custom Tabs */}
      <div className="flex space-x-1 bg-[#1F1F1F] p-1 rounded-lg w-fit border border-slate-800">
        <button
          onClick={() => setActiveTab("achievements")}
          className={cn(
            "flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors",
            activeTab === "achievements"
              ? "bg-[#262626] text-white shadow-sm border border-slate-700"
              : "text-gray-400 hover:text-white hover:bg-[#262626]/50"
          )}
        >
          <Trophy className="mr-2 h-4 w-4" />
          Danh Hiệu & Huy Hiệu
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={cn(
            "flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors",
            activeTab === "users"
              ? "bg-[#262626] text-white shadow-sm border border-slate-700"
              : "text-gray-400 hover:text-white hover:bg-[#262626]/50"
          )}
        >
          <Users className="mr-2 h-4 w-4" />
          Cấp Phát Thủ Công
        </button>
      </div>

      <div className="mt-6">
        {activeTab === "achievements" && <AchievementManager />}
        {activeTab === "users" && <UserGrantManager />}
      </div>
    </div>
  );
}
