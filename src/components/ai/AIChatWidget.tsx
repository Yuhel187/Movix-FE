// src/components/ai/AIChatWidget.tsx
"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";
import AIChatBox from "./AIChatBox";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

export default function AIChatWidget() {
  const pathname = usePathname();
  const { isLoggedIn } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);

  // Các trang không hiển thị Chat Widget
  const hiddenRoutes = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/watch-party/"
  ];

  const shouldHide = hiddenRoutes.some(route => pathname.startsWith(route));

  useEffect(() => {
    if (isOpen && !hasOpened) {
      setHasOpened(true);
    }
  }, [isOpen, hasOpened]);

  if (shouldHide || !isLoggedIn) return null;

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      setHasOpened(false); 
    }, 300);
  };
  const handleMinimize = () => {
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {hasOpened && (
        <div className={cn(
          "mb-4 w-[380px] h-[520px] bg-neutral-900 text-white rounded-2xl shadow-xl border border-neutral-800 overflow-hidden transition-all duration-300 origin-bottom-right",
          isOpen ? "opacity-100 scale-100 translate-y-0 pointer-events-auto" : "opacity-0 scale-90 translate-y-10 pointer-events-none"
        )}>
          <AIChatBox 
            onClose={handleClose}       
            onMinimize={handleMinimize} 
          />
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
            "flex items-center justify-center w-16 h-16 rounded-full text-white shadow-lg hover:shadow-red-900/50 transition-all relative",
            isOpen ? "bg-zinc-800 hover:bg-zinc-700" : "bg-red-600 hover:bg-red-700"
        )}
      >
        <MessageCircle className={cn("w-8 h-8 transition-transform", isOpen && "rotate-90")} />

        <span className="absolute -top-0.5 -right-0.5 bg-green-500 w-4 h-4 rounded-full border-2 border-black"></span>
      </button>
    </div>
  );
}