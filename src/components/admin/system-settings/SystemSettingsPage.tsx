"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { 
  Save, 
  RotateCcw, 
  Bot, 
  Mic, 
  Trophy, 
  ShieldAlert, 
  Zap,
  MessageSquare,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface SystemConfig {
  maintenance_mode: boolean;
  voice_chat: {
    enabled: boolean;
  };
  ai_chatbot: {
    enabled: boolean;
  };
  gamification: {
    xp_multiplier_watch: number;
    xp_multiplier_comment: number;
    daily_login_xp: number;
    level_up_difficulty: number; // 1.0 = standard, 1.5 = harder
  };
  moderation: {
    auto_filter_comments: boolean;
    toxicity_threshold: number; // 0.0 - 1.0
  }
}

const INITIAL_CONFIG: SystemConfig = {
  maintenance_mode: false,
  voice_chat: {
    enabled: true,
  },
  ai_chatbot: {
    enabled: true,
  },
  gamification: {
    xp_multiplier_watch: 1.0,
    xp_multiplier_comment: 5.0,
    daily_login_xp: 50,
    level_up_difficulty: 1.2,
  },
  moderation: {
    auto_filter_comments: true,
    toxicity_threshold: 0.8,
  }
};

export default function SystemSettingsPage() {
  const [config, setConfig] = useState<SystemConfig>(INITIAL_CONFIG);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleReset = () => {
    setConfig(INITIAL_CONFIG);
    setHasChanges(false);
    toast.info("Đã khôi phục cài đặt mặc định (Chưa lưu)");
  };

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setHasChanges(false);
      setIsSaving(false);
      toast.success("Đã lưu cấu hình hệ thống thành công");
    }, 1000);
  };

  const updateConfig = (section: keyof SystemConfig | 'root', key: string, value: any) => {
    if (section === 'root') {
        setConfig(prev => ({
            ...prev,
            [key]: value
        }));
    } else {
        setConfig(prev => ({
        ...prev,
        [section]: {
            // @ts-ignore
            ...prev[section],
            [key]: value
        }
        }));
    }
    setHasChanges(true);
  };

  return (
    <div className="space-y-6 pt-6 pb-12 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
            Cấu Hình Hệ Thống
          </h1>
          <p className="text-slate-400">
            Quản lý các tính năng lõi, giới hạn tài nguyên và tham số vận hành.
          </p>
        </div>
        <div className="flex gap-2">
            <Button 
                variant="outline" 
                onClick={handleReset} 
                disabled={!hasChanges || isSaving}
                className="border-slate-700 hover:bg-slate-800 hover:text-white"
            >
                <RotateCcw className="mr-2 h-4 w-4" />
                Khôi phục
            </Button>
            <Button 
                onClick={handleSave} 
                disabled={!hasChanges || isSaving}
                className="bg-primary hover:bg-primary/90 min-w-[120px]"
            >
                {isSaving ? (
                    <span className="flex items-center"><span className="animate-spin mr-2">⏳</span> Lưu...</span>
                ) : (
                    <><Save className="mr-2 h-4 w-4" /> Lưu thay đổi</>
                )}
            </Button>
        </div>
      </div>

      {hasChanges && (
         <Alert className="bg-amber-900/20 border-amber-600 text-amber-200">
            <ShieldAlert className="h-4 w-4" />
            <AlertTitle>Thay đổi chưa lưu</AlertTitle>
            <AlertDescription>
                Bạn đã thực hiện thay đổi cấu hình. Vui lòng nhấn "Lưu thay đổi" để áp dụng cho toàn hệ thống.
            </AlertDescription>
         </Alert>
      )}

      {/* GLOBAL MAINTENANCE MODE */}
      <Card className="bg-red-950/10 border-red-900/50">
        <CardContent className="pt-6 flex items-center justify-between">
            <div className="space-y-1">
                <Label className="text-lg font-bold text-red-500 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Chế độ Bảo trì (Maintenance Mode)
                </Label>
                <p className="text-sm text-slate-400">
                    Khi bật, toàn bộ người dùng (trừ Admin) sẽ không thể truy cập website.
                </p>
            </div>
            <Switch 
                checked={config.maintenance_mode}
                onCheckedChange={(checked) => updateConfig('root', 'maintenance_mode', checked)}
            />
        </CardContent>
      </Card>

      <Tabs defaultValue="features" className="w-full">
        <TabsList className="bg-[#1e1e1e] border border-slate-800 p-1 w-full justify-start h-auto flex-wrap">
          <TabsTrigger value="features" className="data-[state=active]:bg-primary data-[state=active]:text-white px-4 py-2">
             <Zap className="mr-2 h-4 w-4" /> Tính Năng Chung
          </TabsTrigger>
          <TabsTrigger value="gamification" className="data-[state=active]:bg-primary data-[state=active]:text-white px-4 py-2">
             <Trophy className="mr-2 h-4 w-4" /> Gamification & XP
          </TabsTrigger>
          <TabsTrigger value="moderation" className="data-[state=active]:bg-primary data-[state=active]:text-white px-4 py-2">
             <ShieldAlert className="mr-2 h-4 w-4" /> Kiểm Duyệt
          </TabsTrigger>
        </TabsList>

        {/* --- FEATURES TOGGLE --- */}
        <TabsContent value="features" className="space-y-4 mt-4">
            <div className="grid gap-6 md:grid-cols-2">
                <Card className="bg-[#1e1e1e] border-slate-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Mic className="h-5 w-5 text-blue-400" /> Voice Chat (Watch Party)
                        </CardTitle>
                        <CardDescription>Bật/tắt tính năng thoại trong phòng xem chung.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base text-white">Trạng thái hoạt động</Label>
                                <p className="text-sm text-slate-400">Tắt nếu server quá tải hoặc gặp sự cố.</p>
                            </div>
                            <Switch 
                                checked={config.voice_chat.enabled}
                                onCheckedChange={(checked) => updateConfig('voice_chat', 'enabled', checked)}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-[#1e1e1e] border-slate-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bot className="h-5 w-5 text-purple-400" /> AI System (Gemini)
                        </CardTitle>
                        <CardDescription>Bật/tắt toàn bộ hệ thống Chatbot & Recommendation.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base text-white">Trạng thái hoạt động</Label>
                                <p className="text-sm text-slate-400">
                                    {config.ai_chatbot.enabled ? "Đang kết nối API Gemini." : "Đã ngắt kết nối API."}
                                </p>
                            </div>
                            <Switch 
                                checked={config.ai_chatbot.enabled}
                                onCheckedChange={(checked) => updateConfig('ai_chatbot', 'enabled', checked)}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </TabsContent>

         {/* --- GAMIFICATION --- */}
         <TabsContent value="gamification" className="space-y-4 mt-4">
            <div className="grid gap-6 md:grid-cols-2">
                <Card className="bg-[#1e1e1e] border-slate-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-yellow-500" /> Hệ số XP (Kinh nghiệm)
                        </CardTitle>
                        <CardDescription>Điều chỉnh tốc độ nhận XP của người dùng.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <Label>Xem phim (XP Multiplier)</Label>
                                <span className="font-bold text-yellow-500">x{config.gamification.xp_multiplier_watch}</span>
                            </div>
                            <Slider 
                                value={[config.gamification.xp_multiplier_watch]} 
                                min={0.5} 
                                max={5.0} 
                                step={0.1}
                                onValueChange={(vals) => updateConfig('gamification', 'xp_multiplier_watch', vals[0])}
                            />
                            <p className="text-xs text-slate-400">Hệ số nhân trên mỗi phút xem phim.</p>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <Label>Bình luận & Tương tác</Label>
                                <span className="font-bold text-yellow-500">x{config.gamification.xp_multiplier_comment}</span>
                            </div>
                            <Slider 
                                value={[config.gamification.xp_multiplier_comment]} 
                                min={1} 
                                max={20} 
                                step={1}
                                onValueChange={(vals) => updateConfig('gamification', 'xp_multiplier_comment', vals[0])}
                            />
                            <p className="text-xs text-slate-400">XP nhận được cho mỗi lần bình luận hợp lệ.</p>
                        </div>

                         <div className="space-y-3 pt-2">
                             <Label>XP thưởng đăng nhập hàng ngày</Label>
                             <Input 
                                type="number" 
                                value={config.gamification.daily_login_xp}
                                onChange={(e) => updateConfig('gamification', 'daily_login_xp', Number(e.target.value))}
                                className="bg-[#262626] border-slate-700 w-32"
                             />
                        </div>
                    </CardContent>
                </Card>
                
                 <Card className="bg-[#1e1e1e] border-slate-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Zap className="h-5 w-5 text-orange-400" /> Độ khó tăng cấp
                        </CardTitle>
                         <CardDescription>Cấu hình thuật toán tính cấp độ (Level Scaling).</CardDescription>
                    </CardHeader>
                     <CardContent className="space-y-6">
                         <div className="space-y-3">
                            <div className="flex justify-between">
                                <Label>Hệ số khó (Difficulty Curve)</Label>
                                <span className="font-mono text-xs bg-slate-800 px-2 py-0.5 rounded">{config.gamification.level_up_difficulty}</span>
                            </div>
                            <Slider 
                                value={[config.gamification.level_up_difficulty]} 
                                min={1.0} 
                                max={3.0} 
                                step={0.1}
                                onValueChange={(vals) => updateConfig('gamification', 'level_up_difficulty', vals[0])}
                            />
                             <div className="p-4 bg-slate-900 rounded text-xs text-slate-400 font-mono mt-2">
                                <p>Công thức dự kiến:</p>
                                <p>Next_Level_XP = Base_XP * (Level ^ {config.gamification.level_up_difficulty})</p>
                             </div>
                        </div>
                     </CardContent>
                 </Card>
            </div>
         </TabsContent>
         
         {/* --- MODERATION --- */}
         <TabsContent value="moderation" className="space-y-4 mt-4">
             <Card className="bg-[#1e1e1e] border-slate-800">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-red-400" /> Tự động kiểm duyệt (AI Moderation)
                    </CardTitle>
                    <CardDescription>Cấu hình bộ lọc ngôn ngữ và phát hiện nội dung độc hại.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                     <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-base text-white">Lọc bình luận tự động</Label>
                            <p className="text-sm text-slate-400">Tự động ẩn các bình luận có dấu hiệu vi phạm trước khi hiển thị.</p>
                        </div>
                        <Switch 
                            checked={config.moderation.auto_filter_comments}
                            onCheckedChange={(checked) => updateConfig('moderation', 'auto_filter_comments', checked)}
                        />
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <Label>Ngưỡng Toxic (Độ nhạy cảm)</Label>
                            <span className="font-bold text-red-500">{Math.round(config.moderation.toxicity_threshold * 100)}%</span>
                        </div>
                        <Slider 
                            value={[config.moderation.toxicity_threshold]} 
                            min={0.1} 
                            max={0.95} 
                            step={0.05}
                            onValueChange={(vals) => updateConfig('moderation', 'toxicity_threshold', vals[0])}
                            disabled={!config.moderation.auto_filter_comments}
                        />
                        <p className="text-xs text-slate-500 flex justify-between">
                            <span>Dễ dãi (0.1)</span>
                            <span>Nghiêm ngặt (0.95)</span>
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                            *Các bình luận có điểm số Toxic cao hơn {Math.round(config.moderation.toxicity_threshold * 100)}% sẽ bị ẩn tự động.
                        </p>
                    </div>
                </CardContent>
             </Card>
         </TabsContent>
      </Tabs>
    </div>
  );
}