import React from "react";
import { X } from "lucide-react";

interface Props {
  onClose: () => void;
}

export default function AIChatBox({ onClose }: Props) {
  return (
    <div className="flex flex-col h-full bg-neutral-950">
      {/* Header */}
      <div className="flex items-center justify-between bg-red-600 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="bg-white p-2 rounded-full">
            <img
              src="/images/ai-icon.png"
              alt="AI Icon"
              className="w-6 h-6"
            />
          </div>
          <div>
            <h2 className="font-bold text-white">Movix AI</h2>
            <p className="text-sm text-green-300">● Online</p>
          </div>
        </div>
        <button onClick={onClose}>
          <X className="w-5 h-5 text-white hover:text-gray-200" />
        </button>
      </div>

      {/* Chat content */}
      <div className="flex-1 p-4 overflow-y-auto text-gray-200">
        <p>Xin chào! 👋 Tôi có thể giúp gì cho bạn hôm nay?</p>
      </div>

      {/* Input */}
      <div className="border-t border-neutral-800 p-3 bg-neutral-900">
        <input
          type="text"
          placeholder="Nhập tin nhắn..."
          className="w-full p-2 rounded-lg bg-neutral-800 text-white placeholder-gray-400 focus:outline-none"
        />
      </div>
    </div>
  );
}
