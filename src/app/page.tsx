"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import LandingView from "@/components/home/LandingView";

import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading || !router) {
      return;
    }

    if (user) {
      if (user.role === "Admin") {
        router.push("/admin"); 
      } else {
        router.push("/movies");
      }
    }
  }, [user, isLoading, router]);

  if (isLoading || user) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <p className="text-white italic text-xl">Đang tải...</p>
      </div>
    );
  }
  return <LandingView />;
}