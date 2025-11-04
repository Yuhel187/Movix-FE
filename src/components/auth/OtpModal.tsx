"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function OtpModal({ open, onClose, onVerify, onResend }: any) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  if (!open) return null;

  const handleChange = (value: string, index: number) => {
    if (/^\d?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < 5) {
        refs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (e: any, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: any) => {
    const pasted = e.clipboardData.getData("text").slice(0, 6);
    if (/^\d+$/.test(pasted)) {
      const arr = pasted.split("");
      setOtp([...arr, "", "", "", "", "", ""].slice(0, 6));
      refs.current[arr.length - 1]?.focus();
    }
  };

  const handleResend = () => {
    setOtp(["", "", "", "", "", ""]);      
    refs.current[0]?.focus();              
    onResend && onResend();                
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
      <div className="bg-black/85 text-white w-[380px] p-6 rounded-xl shadow-[0_0_30px_rgba(255,0,0,0.5)] border border-zinc-700 backdrop-blur-xl">
        <h2 className="text-3xl text-center font-bold mb-2">Xác minh OTP</h2>
        <p className="text-zinc-300 text-center text-sm mb-6">
          Mã OTP đã gửi đến email của bạn
        </p>

        <div className="flex justify-between mb-5" onPaste={handlePaste}>
          {otp.map((digit, index) => (
            <Input
              key={index}
              maxLength={1}
              value={digit}
              ref={(el) => {
                refs.current[index] = el;
              }}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="w-12 h-14 text-center text-2xl font-bold bg-zinc-800/80 border-zinc-700"
            />
          ))}
        </div>

        <Button
          onClick={() => onVerify(otp.join(""))}
          className="bg-red-600 hover:bg-red-700 w-full py-5 text-lg font-semibold rounded-lg"
        >
          Xác minh
        </Button>

        <button
          onClick={handleResend}
          className="text-zinc-300 text-xs mt-4 hover:underline block mx-auto"
        >
          Gửi lại mã
        </button>

        <button
          onClick={onClose}
          className="text-zinc-400 text-xs hover:text-white mt-4 block mx-auto"
        >
          Hủy
        </button>
      </div>
    </div>
  );
}
