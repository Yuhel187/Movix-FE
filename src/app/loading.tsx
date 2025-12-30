import React from "react";
import Image from "next/image";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] flex h-screen w-full flex-col items-center justify-center bg-black">
      <div className="relative flex flex-col items-center gap-6">
        {/* Logo Animation */}
        <div className="relative h-24 w-24 animate-pulse">
          <Image 
            src="/images/logo.png" 
            alt="Movix Logo" 
            fill 
            className="object-contain"
            priority
          />
        </div>
        
        {/* Spinner */}
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-4 border-zinc-800"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-red-600 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
        </div>
      </div>
    </div>
  );
}
