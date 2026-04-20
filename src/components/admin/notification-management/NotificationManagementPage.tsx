"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Send, Bot, Sparkles, Loader2, Bell, Users, Calendar as CalendarIcon, Clock } from "lucide-react";
import apiClient from "@/lib/apiClient";
import { toast } from "sonner";
import { UserSearchSelect } from "@/components/admin/notification-management/UserSearchSelect";
import { NotificationHistory } from "@/components/admin/notification-management/NotificationHistory";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function NotificationPage() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetType, setTargetType] = useState("all_users");
  const [targetUserId, setTargetUserId] = useState("");
  const [actionUrl, setActionUrl] = useState("");
  
  const [channels, setChannels] = useState({ inApp: true, email: false, push: false });
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);

  const [isSending, setIsSending] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [refreshHistory, setRefreshHistory] = useState(0);

  const handleGenerateAI = async () => {
    if (!title) {
        toast.error("Vui lòng nhập tiêu đề hoặc chủ đề chính trước để AI viết nội dung.");
        return;
    }
    setIsGenerating(true);
    try {
        const prompt = `Hãy viết một nội dung thông báo ngắn gọn, hấp dẫn cho người dùng ứng dụng xem phim Movix. 
        Chủ đề chính: "${title}". 
        Yêu cầu: Dưới 200 ký tự, có emoji, giọng văn thân thiện hào hứng. Chỉ cần phần nội dung, không cần tiêu đề, không cần dấu ngoặc kép, không cần đưa ra lựa chọn cho tôi và chỉ cần trả về nội dung thông báo thôi.`;
        
        const res = await apiClient.post('/ai/chat', { message: prompt, mode: 'raw' });
        const aiText = res.data.reply.replace(/"/g, ""); 
        setMessage(aiText);
        toast.success("AI đã viết xong!");
    } catch (error) {
        toast.error("Lỗi AI không phản hồi");
    } finally {
        setIsGenerating(false);
    }
  };

  const handleSend = async () => {
      if (!title || !message) {
          toast.error("Vui lòng nhập tiêu đề và nội dung.");
          return;
      }

      setIsSending(true);
      try {
          await apiClient.post('/notifications/send', {
              targetType,
              targetUserId: targetType === 'specific' ? targetUserId : undefined,
              title,
              message,
              url: actionUrl
          });
          toast.success("Đã gửi thông báo thành công!");
          setTitle("");
          setMessage("");
          setRefreshHistory(prev => prev + 1);
      } catch (error) {
          toast.error("Gửi thất bại.");
      } finally {
          setIsSending(false);
      }
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 h-[calc(100vh-100px)] flex flex-col">
        <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Users className="w-6 h-6 text-red-500"/> Trung Tâm Thông Báo
            </h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
            <Card className="lg:col-span-2 bg-[#1F1F1F] border-slate-800 text-white overflow-y-auto">
                <CardHeader>
                    <CardTitle>Soạn tin nhắn mới</CardTitle>
                    <CardDescription>Gửi thông báo thời gian thực đến người dùng.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>Đối tượng nhận</Label>
                            <Select value={targetType} onValueChange={setTargetType}>
                                <SelectTrigger className="bg-black/20 border-slate-700 h-10">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-[#262626] border-slate-700 text-white">
                                    <SelectItem value="all_users">Tất cả người dùng (Broadcast)</SelectItem>
                                    <SelectItem value="all_admins">Tất cả Admin</SelectItem>
                                    <SelectItem value="specific">Người dùng cụ thể</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {targetType === 'specific' && (
                            <div className="space-y-2 animate-in fade-in zoom-in-95 duration-200">
                                <Label>Tìm người dùng</Label>
                                <UserSearchSelect 
                                    value={targetUserId} 
                                    onChange={setTargetUserId} 
                                />
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>Tiêu đề</Label>
                        <Input 
                            placeholder="Vd: Bảo trì hệ thống..." 
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="bg-black/20 border-slate-700"
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <Label>Nội dung</Label>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={handleGenerateAI}
                                disabled={isGenerating}
                                className="text-purple-400 hover:text-purple-300 hover:bg-purple-900/20 h-6 px-2 text-xs"
                            >
                                {isGenerating ? <Loader2 className="w-3 h-3 animate-spin mr-1"/> : <Sparkles className="w-3 h-3 mr-1" />}
                                AI Magic
                            </Button>
                        </div>
                        <Textarea 
                            placeholder="Nhập nội dung..." 
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="bg-black/20 border-slate-700 min-h-[120px] text-base"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Đường dẫn (Optional)</Label>
                        <Input 
                            placeholder="/movies/slug..." 
                            value={actionUrl}
                            onChange={(e) => setActionUrl(e.target.value)}
                            className="bg-black/20 border-slate-700 text-sm font-mono text-blue-400"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
                        {/* Channels */}
                        <div className="space-y-3">
                            <Label className="text-slate-200">Kênh gửi thông báo</Label>
                            <div className="flex flex-col gap-3 p-4 border border-slate-700 rounded-md bg-black/20">
                                {/* In-App & Push Unified */}
                                <div className="flex items-start space-x-2">
                                    <Checkbox 
                                        id="inApp" 
                                        checked={channels.inApp}
                                        onCheckedChange={(checked) => setChannels(prev => ({ 
                                            ...prev, 
                                            inApp: checked === true,
                                            push: checked === true 
                                        }))}
                                        className="mt-1 border-slate-500 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                    />
                                    <div className="grid gap-1.5 leading-none">
                                        <label htmlFor="inApp" className="text-sm font-medium leading-none text-slate-300 cursor-pointer">
                                            Thông báo Ứng dụng
                                        </label>
                                        <p className="text-xs text-slate-500">
                                            Hiển thị trong App và gửi thông báo đẩy đến thiết bị.
                                        </p>
                                    </div>
                                </div>

                                {/* Email Channel */}
                                <div className="flex items-start space-x-2">
                                    <Checkbox 
                                        id="email" 
                                        checked={channels.email}
                                        onCheckedChange={(checked) => setChannels(prev => ({ ...prev, email: checked === true }))}
                                        className="mt-1 border-slate-500 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                    />
                                    <div className="grid gap-1.5 leading-none">
                                        <label htmlFor="email" className="text-sm font-medium leading-none text-slate-300 cursor-pointer">
                                            Gửi qua Email (Newsletter)
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Scheduling */}
                        <div className="space-y-3">
                            <Label className="text-slate-200">Lên lịch gửi (Tùy chọn)</Label>
                            <div className="flex flex-col gap-2">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal border-slate-700 bg-black/20 hover:bg-slate-800 hover:text-white h-12",
                                                !scheduledDate && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {scheduledDate ? format(scheduledDate, "PP HH:mm") : <span>Chọn ngày giờ gửi...</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0 bg-[#1F1F1F] border-slate-800 text-white" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={scheduledDate}
                                            onSelect={setScheduledDate}
                                            initialFocus
                                            className="p-3 bg-[#1F1F1F] text-white rounded-md border-slate-800"
                                        />
                                        <div className="p-3 border-t border-slate-700 bg-black/20">
                                            <Label className="text-xs mb-2 block text-slate-400">Giờ cụ thể</Label>
                                            <div className="flex items-center gap-2">
                                                <input 
                                                    type="time" 
                                                    className="w-full bg-[#262626] border border-slate-600 rounded px-2 py-1 text-white focus:outline-none focus:border-primary"
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        if (val && scheduledDate) {
                                                            const [h, m] = val.split(':').map(Number);
                                                            const newDate = new Date(scheduledDate);
                                                            newDate.setHours(h);
                                                            newDate.setMinutes(m);
                                                            setScheduledDate(newDate);
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                                
                                {scheduledDate ? (
                                    <div className="flex items-center text-xs text-yellow-500 bg-yellow-500/10 p-2 rounded border border-yellow-500/20">
                                        <Clock className="w-3 h-3 mr-2" /> 
                                        Hệ thống sẽ gửi vào {format(scheduledDate, "HH:mm dd/MM/yyyy")}
                                    </div>
                                ) : (
                                    <p className="text-xs text-slate-500 italic">Để trống nếu muốn gửi ngay lập tức.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <Button 
                            className="w-full bg-red-600 hover:bg-red-700 text-white h-12 text-base font-semibold shadow-lg shadow-red-900/20"
                            onClick={handleSend}
                            disabled={isSending}
                        >
                            {isSending ? <Loader2 className="w-5 h-5 animate-spin mr-2"/> : <Send className="w-5 h-5 mr-2" />}
                            Gửi thông báo
                        </Button>
                    </div>

                    <div className="mt-6 p-4 rounded-lg bg-black/30 border border-slate-800">
                        <p className="text-xs text-slate-500 mb-2 uppercase font-bold">Xem trước:</p>
                        <div className="flex gap-3 items-start">
                            <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center flex-shrink-0">
                                <Bot className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-white">{title || "Tiêu đề..."}</h4>
                                <p className="text-sm text-slate-300 mt-1">{message || "Nội dung..."}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="lg:col-span-1 h-full min-h-0">
                <NotificationHistory refreshTrigger={refreshHistory} />
            </div>
        </div>
    </div>
  );
}