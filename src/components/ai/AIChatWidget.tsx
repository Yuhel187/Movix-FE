"use client";

import React, { useState } from "react";
import { MessageCircle } from "lucide-react";
import AIChatBox from "./AIChatBox";

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* --- Chat Box --- */}
      {isOpen && (
        <div className="mb-4 w-[380px] h-[520px] bg-neutral-900 text-white rounded-2xl shadow-xl border border-neutral-800 overflow-hidden animate-fade-in">
          <AIChatBox onClose={() => setIsOpen(false)} />
        </div>
      )}

      {/* --- Floating Button --- */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-red-900/50 transition-all relative"
      >
        <MessageCircle className="w-8 h-8" />
        <span className="absolute -top-0.5 -right-0.5 bg-green-500 w-4 h-4 rounded-full border border-white"></span>
      </button>
    </div>
  );
}
