import React, { useState, useRef, useEffect } from "react";
import { X, Send, Bot, User, Minus } from "lucide-react";
import apiClient from "@/lib/apiClient";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
}

interface Props {
  onClose: () => void;
  onMinimize?: () => void;
}

export default function AIChatBox({ onClose , onMinimize}: Props) {
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", text: "Xin chào! 👋 Tôi là AI của Movix. Tôi có thể giúp bạn tìm phim hoặc giải đáp thắc mắc.", sender: "bot" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), text: input, sender: "user" };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await apiClient.post("/ai/chat", { message: userMsg.text });
      const botMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        text: res.data.reply, 
        sender: "bot" 
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      setMessages(prev => [...prev, { id: `err-${Date.now()}`, text: "Xin lỗi, tôi đang gặp sự cố kết nối.", sender: "bot" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div className="flex flex-col h-full bg-neutral-950 border border-neutral-800 shadow-2xl rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between bg-[#E50914] px-4 py-3 shadow-md">
        <div className="flex items-center gap-2">
          <div className="bg-white/20 p-1.5 rounded-full">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-white text-sm">Movix Assistant</h2>
            <p className="text-[10px] text-green-200 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full block"></span> Online
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {/* Nút Minimize */}
          <button 
            onClick={onMinimize} 
            className="p-1 text-white/80 hover:text-white hover:bg-white/10 rounded transition"
            title="Thu nhỏ"
          >
            <Minus className="w-5 h-5" />
          </button>
          
          {/* Nút Close */}
          <button 
            onClick={onClose} 
            className="p-1 text-white/80 hover:text-white hover:bg-white/10 rounded transition"
            title="Đóng chat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Chat Content */}
      <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-4 bg-zinc-900/50">
        {messages.map((msg) => (
          <div key={msg.id} className={cn("flex gap-3", msg.sender === "user" ? "flex-row-reverse" : "")}>
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
              msg.sender === "bot" ? "bg-zinc-800 text-red-500" : "bg-zinc-700 text-white"
            )}>
              {msg.sender === "bot" ? <Bot size={16} /> : <User size={16} />}
            </div>
            <div className={cn(
              "p-3 rounded-2xl text-sm max-w-[80%] leading-relaxed",
              msg.sender === "bot" 
                ? "bg-zinc-800 text-gray-200 rounded-tl-none" 
                : "bg-red-600 text-white rounded-tr-none"
            )}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3">
             <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                <Bot size={16} className="text-red-500" />
             </div>
             <div className="bg-zinc-800 p-3 rounded-2xl rounded-tl-none">
               <div className="flex space-x-1">
                 <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                 <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-75"></div>
                 <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150"></div>
               </div>
             </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-3 bg-zinc-900 border-t border-zinc-800">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Hỏi tôi về phim..."
            className="w-full pl-4 pr-12 py-3 rounded-full bg-black border border-zinc-700 text-white placeholder-gray-500 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 text-sm"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-2 bg-red-600 rounded-full text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}