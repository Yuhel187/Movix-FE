"use client";

import LandingView from "@/components/home/LandingView"
//import BrowseView from "@/components/home/BrowseView"; Sau này thay trang chủ đã đăng nhập vào
import FilterPage from "@/components/filter/FilterPage"

import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <p className="text-white italic text-xl">Đang tải...</p>
      </div>
    );
  }
  return user ? <FilterPage /> : <LandingView />;
}