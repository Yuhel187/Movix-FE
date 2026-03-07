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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  PlusCircle,
  Pencil,
  Trash2,
  Check,
  X,
  CreditCard,
  MoreVertical,
  Settings,
  ListPlus
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

// --- TYPES ---

interface Benefit {
  id: string;
  category: string;
  content: string;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billingCycle: "MONTHLY" | "YEARLY";
  features: string[]; // Stores content strings
  isActive: boolean;
  color?: string;
  recommended?: boolean;
  
  // --- Watch Party Config ---
  can_create_watch_party: boolean;
  max_watch_party_participants: number;
  can_kick_mute_members: boolean;
}

// --- INITIAL DATA ---

const INITIAL_BENEFITS: Benefit[] = [
  // Content
  { id: "c1", category: "Kho phim (Content)", content: "Xem phim thường, phim cũ" },
  { id: "c2", category: "Kho phim (Content)", content: "Xem tất cả, bao gồm 'Phim Hot'" },
  { id: "c3", category: "Kho phim (Content)", content: "Quyền ưu tiên: Xem sớm phim mới (Sneak Peek) trước 24h" },
  
  // Watch Party
  { id: "wp1", category: "Watching Party", content: "Chỉ được Tham gia phòng người khác tạo" },
  { id: "wp2", category: "Watching Party", content: "Được Tạo phòng (Tối đa 5 người)" },
  { id: "wp3", category: "Watching Party", content: "Tạo phòng Siêu lớn (50 người), có quyền Kick/Mute thành viên" },

  // Voice Chat
  { id: "vc1", category: "Voice Chat", content: "Chat text only (Không hỗ trợ Voice)" },
  { id: "vc2", category: "Voice Chat", content: "Mở khóa Voice Chat (Chất lượng thường)" },
  { id: "vc3", category: "Voice Chat", content: "Voice Chat HD: Âm thanh cao, lọc ồn" },

  // AI
  { id: "ai1", category: "Chatbot AI", content: "Chatbot: Giới hạn 5 câu/ngày" },
  { id: "ai2", category: "Chatbot AI", content: "Chatbot: Giới hạn 50 câu/ngày" },
  { id: "ai3", category: "Chatbot AI", content: "Chatbot: Không giới hạn & Deep Analysis" },

  // RecSys
  { id: "rs1", category: "Hệ thống Gợi ý", content: "Gợi ý Cơ bản (Theo thể loại, Trending)" },
  { id: "rs2", category: "Hệ thống Gợi ý", content: "Gợi ý Nâng cao (Collaborative Filtering)" },
  { id: "rs3", category: "Hệ thống Gợi ý", content: "Deep Learning: Gợi ý theo cảm xúc & ngữ cảnh" },

  // Download
  { id: "dl1", category: "Tải xuống", content: "Không hỗ trợ tải xuống" },
  { id: "dl2", category: "Tải xuống", content: "Cho phép tải về Mobile App" },
  
  // Devices
  { id: "dv1", category: "Thiết bị", content: "Xem trên 1 thiết bị" },
  { id: "dv2", category: "Thiết bị", content: "Xem trên 2 thiết bị cùng lúc" },
  { id: "dv3", category: "Thiết bị", content: "Xem trên 4 thiết bị cùng lúc (Gói gia đình)" },

  // Gamification
  { id: "gm1", category: "Gamification", content: "Tốc độ cày cấp bình thường (1x XP)" },
  { id: "gm2", category: "Gamification", content: "Tăng tốc 1.2x XP khi xem phim" },
  { id: "gm3", category: "Gamification", content: "Tăng tốc 2x XP (Lên hạng cực nhanh)" },
  
  // Quality
  { id: "q1", category: "Chất lượng hình ảnh", content: "Chất lượng SD 480p" },
  { id: "q2", category: "Chất lượng hình ảnh", content: "Chất lượng HD 720p" },
  { id: "q3", category: "Chất lượng hình ảnh", content: "Chất lượng Full HD 1080p & 4K" },
  
  // Ads
  { id: "ad1", category: "Quảng cáo", content: "Xem phim có quảng cáo" },
  { id: "ad2", category: "Quảng cáo", content: "Không quảng cáo" },
];

const INITIAL_PLANS: SubscriptionPlan[] = [
  {
    id: "1",
    name: "Standard",
    description: "Gói miễn phí cơ bản",
    price: 0,
    currency: "VND",
    billingCycle: "MONTHLY",
    features: [
      "Xem phim thường, phim cũ",
      "Chất lượng SD 480p",
      "Xem phim có quảng cáo",
      "Xem trên 1 thiết bị",
      "Chỉ được Tham gia phòng người khác tạo",
      "Chatbot: Giới hạn 5 câu/ngày",
      "Tốc độ cày cấp bình thường (1x XP)"
    ],
    isActive: true,
    color: "bg-slate-500",
    
    can_create_watch_party: false,
    max_watch_party_participants: 0,
    can_kick_mute_members: false,
  },
  {
    id: "2",
    name: "Movix Plus",
    description: "Trải nghiệm nâng cao",
    price: 59000,
    currency: "VND",
    billingCycle: "MONTHLY",
    features: [
      "Xem tất cả, bao gồm 'Phim Hot'",
      "Chất lượng HD 720p",
      "Không quảng cáo",
      "Xem trên 2 thiết bị cùng lúc",
      "Được Tạo phòng (Tối đa 5 người)",
      "Mở khóa Voice Chat (Chất lượng thường)",
      "Chatbot: Giới hạn 50 câu/ngày",
      "Cho phép tải về Mobile App",
      "Tăng tốc 1.2x XP khi xem phim"
    ],
    isActive: true,
    color: "bg-blue-600",
    recommended: true,

    can_create_watch_party: true,
    max_watch_party_participants: 5,
    can_kick_mute_members: false,
  },
  {
    id: "3",
    name: "Movix Ultimate",
    description: "Quyền năng tối thượng",
    price: 199000,
    currency: "VND",
    billingCycle: "MONTHLY",
    features: [
      "Quyền ưu tiên: Xem sớm phim mới (Sneak Peek) trước 24h",
      "Chất lượng Full HD 1080p & 4K",
      "Không quảng cáo",
      "Xem trên 4 thiết bị cùng lúc (Gói gia đình)",
      "Tạo phòng Siêu lớn (50 người), có quyền Kick/Mute thành viên",
      "Voice Chat HD: Âm thanh cao, lọc ồn",
      "Chatbot: Không giới hạn & Deep Analysis",
      "Deep Learning: Gợi ý theo cảm xúc & ngữ cảnh",
      "Tăng tốc 2x XP (Lên hạng cực nhanh)"
    ],
    isActive: true,
    color: "bg-amber-500",

    can_create_watch_party: true,
    max_watch_party_participants: 50,
    can_kick_mute_members: true,
  },
];

const DEFAULT_FORM_DATA: Omit<SubscriptionPlan, "id"> = {
  name: "",
  description: "",
  price: 0,
  currency: "VND",
  billingCycle: "MONTHLY",
  features: [],
  isActive: true,
  color: "bg-slate-500",
  recommended: false,
  
  can_create_watch_party: false,
  max_watch_party_participants: 0,
  can_kick_mute_members: false,
};

export default function SubscriptionPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>(INITIAL_PLANS);
  const [benefits, setBenefits] = useState<Benefit[]>(INITIAL_BENEFITS);
  
  // Dialog states
  const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false);
  const [isBenefitsDialogOpen, setIsBenefitsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Edit states
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan | null>(null);
  const [formData, setFormData] = useState<Omit<SubscriptionPlan, "id">>(DEFAULT_FORM_DATA);
  
  // Benefit management state
  const [newBenefit, setNewBenefit] = useState({ category: "", content: "" });

  // --- PLAN MANAGEMENT ---

  const handleOpenAddDialog = () => {
    setCurrentPlan(null);
    setFormData(DEFAULT_FORM_DATA);
    setIsPlanDialogOpen(true);
  };

  const handleOpenEditDialog = (plan: SubscriptionPlan) => {
    setCurrentPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description,
      price: plan.price,
      currency: plan.currency,
      billingCycle: plan.billingCycle,
      features: [...plan.features], 
      isActive: plan.isActive,
      color: plan.color,
      recommended: plan.recommended,
      
      can_create_watch_party: plan.can_create_watch_party,
      max_watch_party_participants: plan.max_watch_party_participants,
      can_kick_mute_members: plan.can_kick_mute_members
    });
    setIsPlanDialogOpen(true);
  };

  const handleSavePlan = () => {
    if (!formData.name) {
      toast.error("Vui lòng nhập tên gói dịch vụ");
      return;
    }

    if (currentPlan) {
      const updatedPlans = plans.map((p) =>
        p.id === currentPlan.id ? { ...formData, id: p.id } : p
      );
      setPlans(updatedPlans);
      toast.success("Cập nhật gói dịch vụ thành công");
    } else {
      const newPlan: SubscriptionPlan = {
        ...formData,
        id: Math.random().toString(36).substr(2, 9),
      };
      setPlans([...plans, newPlan]);
      toast.success("Thêm gói dịch vụ mới thành công");
    }
    setIsPlanDialogOpen(false);
  };

  const handleOpenDeleteDialog = (plan: SubscriptionPlan) => {
    setCurrentPlan(plan);
    setIsDeleteDialogOpen(true);
  };

  const handleDeletePlan = () => {
    if (currentPlan) {
      const updatedPlans = plans.filter((p) => p.id !== currentPlan.id);
      setPlans(updatedPlans);
      toast.success("Đã xóa gói dịch vụ");
      setIsDeleteDialogOpen(false);
      setCurrentPlan(null);
    }
  };

  // --- FEATURE MANAGEMENT IN PLAN ---

  const handleAddFeatureToPlan = (content: string) => {
    if (!content) return;
    if (formData.features.includes(content)) {
        toast.error("Quyền lợi này đã tồn tại trong gói");
        return;
    }
    setFormData({ ...formData, features: [...formData.features, content] });
  };

  const handleRemoveFeatureFromPlan = (index: number) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData({ ...formData, features: newFeatures });
  };

  // --- BENEFIT MASTER DATA MANAGEMENT ---

  const handleAddBenefit = () => {
    if (!newBenefit.content || !newBenefit.category) {
        toast.error("Vui lòng nhập đầy đủ thông tin quyền lợi");
        return;
    }
    const benefit: Benefit = {
        id: Math.random().toString(36).substr(2, 9),
        category: newBenefit.category,
        content: newBenefit.content
    };
    setBenefits([...benefits, benefit]);
    setNewBenefit({ category: "", content: "" });
    toast.success("Đã thêm quyền lợi mới vào danh sách");
  };

  const handleDeleteBenefit = (id: string) => {
    setBenefits(benefits.filter(b => b.id !== id));
  };

  // --- HELPERS ---

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  // Group benefits by category for Select
  const groupedBenefits = benefits.reduce((acc, benefit) => {
    if (!acc[benefit.category]) acc[benefit.category] = [];
    acc[benefit.category].push(benefit);
    return acc;
  }, {} as Record<string, Benefit[]>);

  return (
    <div className="space-y-6 pt-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
            Quản lý Gói Dịch Vụ
          </h1>
          <p className="text-slate-400">
            Cấu hình các gói đăng ký, giá cả và quyền lợi cho thành viên.
          </p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsBenefitsDialogOpen(true)} className="border-slate-700 hover:bg-slate-800 hover:text-white">
                <ListPlus className="mr-2 h-4 w-4" />
                Quản lý Quyền lợi
            </Button>
            <Button onClick={handleOpenAddDialog} className="bg-primary hover:bg-primary/90">
                <PlusCircle className="mr-2 h-4 w-4" />
                Thêm Gói Mới
            </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`border-slate-800 bg-[#1e1e1e] overflow-hidden relative group transition-all duration-300 hover:border-slate-600 hover:shadow-lg flex flex-col`}
          >
            {/* Overlay Gradient for Recommended Plans */}
            {plan.recommended && (
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 z-20" />
            )}

            <CardHeader className={`pb-4 border-b border-slate-800 relative space-y-4`}>
                <div className="flex justify-between items-start w-full">
                     <div className="space-y-1">
                        <div className={`w-8 h-1 ${plan.color || "bg-slate-500"} mb-2 rounded-full`}></div>
                        <CardTitle className="text-xl font-bold text-white leading-tight">
                            {plan.name}
                        </CardTitle>
                     </div>
                     <Badge 
                        variant={plan.isActive ? "default" : "destructive"} 
                        className={`${plan.isActive ? 'bg-green-900/40 text-green-400 hover:bg-green-900/60' : 'bg-red-900/40 text-red-400 hover:bg-red-900/60'} whitespace-nowrap ml-2`}
                    >
                        {plan.isActive ? "Hoạt động" : "Ẩn"}
                    </Badge>
                </div>
              
              <CardDescription className="text-slate-400 line-clamp-2 min-h-[40px]">
                {plan.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-6 space-y-4 flex-1 flex flex-col">
              <div className="flex items-baseline text-white">
                <span className="text-3xl font-bold">
                  {formatCurrency(plan.price, plan.currency)}
                </span>
                <span className="text-slate-400 ml-1 text-sm">
                  /{plan.billingCycle === "MONTHLY" ? "tháng" : "năm"}
                </span>
              </div>

              <ScrollArea className="flex-1 h-[180px] pr-3">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 sticky top-0 bg-[#1e1e1e] py-1">
                  Quyền lợi bao gồm:
                </p>
                <div className="space-y-3">
                    {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start text-sm text-slate-300 group/item">
                        <Check className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                        <span className="leading-tight">{feature}</span>
                    </div>
                    ))}
                </div>
              </ScrollArea>

              <div className="pt-4 flex gap-2 w-full mt-auto border-t border-slate-800">
                <Button
                  variant="outline"
                  className="flex-1 border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white"
                  onClick={() => handleOpenEditDialog(plan)}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Sửa
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-10 w-10 p-0 text-slate-400 hover:text-white">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-[#1e1e1e] border-slate-800 text-slate-200">
                        <DropdownMenuItem onClick={() => handleOpenDeleteDialog(plan)} className="text-red-500 focus:text-red-500 focus:bg-red-500/10 cursor-pointer">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Xóa gói
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {/* Card thêm mới nhanh */}
         <button 
            onClick={handleOpenAddDialog}
            className="border-2 border-dashed border-slate-800 rounded-lg flex flex-col items-center justify-center p-6 text-slate-500 hover:border-slate-600 hover:text-slate-300 hover:bg-slate-800/20 transition-all min-h-[400px] group"
         >
            <div className="h-14 w-14 rounded-full bg-slate-800 group-hover:bg-slate-700 flex items-center justify-center mb-4 transition-colors">
                <PlusCircle className="h-7 w-7 text-slate-400 group-hover:text-white transition-colors" />
            </div>
            <span className="font-semibold">Thêm gói dịch vụ mới</span>
         </button>
      </div>

      {/* --- DIALOG THÊM / SỬA GÓI --- */}
      <Dialog open={isPlanDialogOpen} onOpenChange={setIsPlanDialogOpen}>
        <DialogContent className="max-w-[90vw] w-full lg:max-w-4xl bg-[#1e1e1e] border-slate-800 text-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{currentPlan ? "Chỉnh sửa gói dịch vụ" : "Thêm gói dịch vụ mới"}</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 py-4">
            {/* Cột trái: Thông tin cơ bản */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center text-primary">
                    <Settings className="mr-2 h-5 w-5" />
                    Thông tin cơ bản
                </h3>
                
                <div className="grid gap-2">
                    <Label htmlFor="name">Tên gói</Label>
                    <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Ví dụ: Movix Ultimate"
                        className="bg-[#262626] border-slate-700 focus:border-primary"
                    />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="description">Mô tả ngắn</Label>
                    <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Mô tả quyền lợi chính..."
                        className="bg-[#262626] border-slate-700 focus:border-primary resize-none h-20"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="price">Giá tiền</Label>
                        <div className="relative">
                            <Input
                                id="price"
                                type="number"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                className="bg-[#262626] border-slate-700 focus:border-primary pr-12"
                            />
                            <span className="absolute right-3 top-2.5 text-slate-400 text-sm font-semibold pointer-events-none">
                                {formData.currency}
                            </span>
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="cycle">Chu kỳ</Label>
                        <Select
                            value={formData.billingCycle}
                            onValueChange={(value: "MONTHLY" | "YEARLY") =>
                            setFormData({ ...formData, billingCycle: value })
                            }
                        >
                            <SelectTrigger className="bg-[#262626] border-slate-700 text-white">
                                <SelectValue placeholder="Chọn chu kỳ" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#262626] border-slate-700 text-white">
                                <SelectItem value="MONTHLY">Tháng (Monthly)</SelectItem>
                                <SelectItem value="YEARLY">Năm (Yearly)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                     <div className="grid gap-2">
                        <Label htmlFor="color" className="text-sm font-medium">Màu nhận diện</Label>
                        <Select
                            value={formData.color}
                            onValueChange={(value) => setFormData({ ...formData, color: value })}
                        >
                            <SelectTrigger className="bg-[#262626] border-slate-700 text-white h-10 w-full">
                                <div className="flex items-center w-full overflow-hidden">
                                     {formData.color ? (
                                        <>
                                            <div className={`w-4 h-4 rounded-full mr-2 shrink-0 ${formData.color} border border-white/20`}></div>
                                            <span className="truncate text-sm">{
                                                formData.color === "bg-slate-500" ? "Xám (Basic)" :
                                                formData.color === "bg-blue-600" ? "Xanh dương (Plus)" :
                                                formData.color === "bg-amber-500" ? "Vàng (Gold)" :
                                                formData.color === "bg-purple-600" ? "Tím (Premium)" :
                                                formData.color === "bg-red-600" ? "Đỏ (Special)" : formData.color
                                            }</span>
                                        </>
                                     ) : <span className="text-slate-400 text-sm">Chọn màu...</span>}
                                </div>
                            </SelectTrigger>
                            <SelectContent className="bg-[#262626] border-slate-700 text-white shadow-xl z-[9999]">
                                <SelectItem value="bg-slate-500"><div className="flex items-center"><div className="w-3 h-3 rounded-full bg-slate-500 mr-2"></div>Xám (Basic)</div></SelectItem>
                                <SelectItem value="bg-blue-600"><div className="flex items-center"><div className="w-3 h-3 rounded-full bg-blue-600 mr-2"></div>Xanh dương (Plus)</div></SelectItem>
                                <SelectItem value="bg-amber-500"><div className="flex items-center"><div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>Vàng (Gold)</div></SelectItem>
                                <SelectItem value="bg-purple-600"><div className="flex items-center"><div className="w-3 h-3 rounded-full bg-purple-600 mr-2"></div>Tím (Premium)</div></SelectItem>
                                <SelectItem value="bg-red-600"><div className="flex items-center"><div className="w-3 h-3 rounded-full bg-red-600 mr-2"></div>Đỏ (Special)</div></SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="grid gap-2">
                        <Label className="text-sm font-medium">Trạng thái & Hiển thị</Label>
                        <div className="flex flex-col gap-3 mt-1 bg-[#262626] border border-slate-800 rounded-md p-3">
                             <div className="flex items-center space-x-3">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-primary focus:ring-primary focus:ring-offset-0"
                                />
                                <Label htmlFor="isActive" className="cursor-pointer font-normal text-sm select-none">Đang hoạt động</Label>
                            </div>
                            <div className="flex items-center space-x-3">
                                <input
                                    type="checkbox"
                                    id="recommended"
                                    checked={formData.recommended}
                                    onChange={(e) => setFormData({ ...formData, recommended: e.target.checked })}
                                    className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-amber-500 focus:ring-amber-500 focus:ring-offset-0"
                                />
                                <Label htmlFor="recommended" className="cursor-pointer font-normal text-sm text-amber-500 select-none flex items-center">
                                    Đề xuất <span className="text-[10px] ml-1 opacity-70 border border-amber-500/50 rounded px-1">(HOT)</span>
                                </Label>
                            </div>
                        </div>
                     </div>
                </div>

                {/* Watch Party Configuration */}
                <div className="space-y-4 pt-4 border-t border-slate-700">
                    <h3 className="text-md font-semibold flex items-center text-primary">
                         <span className="mr-2">🎉</span> Cấu hình Watch Party
                    </h3>
                    
                    <div className="grid gap-3 p-3 bg-slate-900/50 rounded-lg border border-slate-800">
                        <div className="flex items-center justify-between">
                             <Label htmlFor="can_create_watch_party" className="cursor-pointer">Quyền tạo phòng</Label>
                             <input
                                type="checkbox"
                                id="can_create_watch_party"
                                checked={formData.can_create_watch_party}
                                onChange={(e) => setFormData({ ...formData, can_create_watch_party: e.target.checked })}
                                className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-primary"
                             />
                        </div>

                        {formData.can_create_watch_party && (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="max_participants" className="text-sm">Giới hạn thành viên tối đa</Label>
                                    <Input
                                        id="max_participants"
                                        type="number"
                                        min={0}
                                        value={formData.max_watch_party_participants}
                                        onChange={(e) => setFormData({ ...formData, max_watch_party_participants: Number(e.target.value) })}
                                        className="bg-[#262626] border-slate-700 h-8"
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="can_kick_mute" className="text-sm cursor-pointer">Quyền quản trị (Kick/Mute)</Label>
                                    <input
                                        type="checkbox"
                                        id="can_kick_mute"
                                        checked={formData.can_kick_mute_members}
                                        onChange={(e) => setFormData({ ...formData, can_kick_mute_members: e.target.checked })}
                                        className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-primary"
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Cột phải: Cấu hình Quyền lợi */}
            <div className="space-y-4 flex flex-col h-full">
                 <h3 className="text-lg font-semibold flex items-center justify-between text-primary">
                    <span className="flex items-center">
                        <ListPlus className="mr-2 h-5 w-5" />
                        Danh sách Quyền lợi
                    </span>
                    <Badge variant="secondary" className="bg-slate-800 text-slate-300">
                        {formData.features.length} quyền lợi
                    </Badge>
                </h3>

                <div className="flex gap-2">
                    <Select onValueChange={handleAddFeatureToPlan}>
                        <SelectTrigger className="bg-[#262626] border-slate-700 text-white flex-1">
                            <SelectValue placeholder="Chọn quyền lợi để thêm..." />
                        </SelectTrigger>
                        <SelectContent className="bg-[#262626] border-slate-700 text-white max-h-[300px]">
                            {Object.entries(groupedBenefits).map(([category, items]) => (
                                <SelectGroup key={category}>
                                    <SelectLabel className="text-slate-400 pl-2 py-1.5 text-xs font-bold uppercase tracking-wider bg-slate-900/50">{category}</SelectLabel>
                                    {items.map((benefit) => (
                                         <SelectItem key={benefit.id} value={benefit.content} className="cursor-pointer pl-4">
                                            {benefit.content}
                                         </SelectItem>
                                    ))}
                                </SelectGroup>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex-1 bg-[#262626] rounded-md border border-slate-800 p-2 overflow-hidden flex flex-col min-h-[300px]">
                     {formData.features.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-500">
                            <ListPlus className="h-10 w-10 mb-2 opacity-50" />
                            <p>Chưa có quyền lợi nào</p>
                            <p className="text-sm">Chọn từ danh sách bên trên để thêm</p>
                        </div>
                     ) : (
                        <ScrollArea className="flex-1 h-full pr-3 relative">
                            <div className="space-y-2 p-1">
                                {formData.features.map((feature, index) => (
                                    <div key={index} className="flex items-center justify-between bg-[#1e1e1e] p-3 rounded border border-slate-800 group hover:border-slate-600 transition-colors">
                                        <div className="flex items-start gap-3 flex-1 mr-2">
                                            <div className="bg-primary/20 p-1 rounded-full mt-0.5 shrink-0">
                                                <Check className="h-3 w-3 text-primary" />
                                            </div>
                                            <span className="text-sm text-slate-200 leading-tight">{feature}</span>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleRemoveFeatureFromPlan(index)}
                                            className="h-7 w-7 shrink-0 text-slate-500 hover:text-red-500 hover:bg-red-500/10 opacity-70 group-hover:opacity-100 transition-all"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                     )}
                </div>
            </div>
          </div>

          <DialogFooter className="mt-6 border-t border-slate-800 pt-4">
            <Button variant="outline" onClick={() => setIsPlanDialogOpen(false)} className="border-slate-700 hover:bg-slate-800 text-slate-300">
              Hủy bỏ
            </Button>
            <Button onClick={handleSavePlan} className="bg-primary hover:bg-primary/90 text-white">
              {currentPlan ? "Lưu thay đổi" : "Tạo gói mới"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- DIALOG QUẢN LÝ MASTER DATA QUYỀN LỢI --- */}
      <Dialog open={isBenefitsDialogOpen} onOpenChange={setIsBenefitsDialogOpen}>
        <DialogContent className="max-w-3xl bg-[#1e1e1e] border-slate-800 text-white max-h-[85vh] overflow-y-auto">
             <DialogHeader>
                <DialogTitle>Quản lý Danh sách Quyền lợi (Master Data)</DialogTitle>
                <DialogDescription className="text-slate-400">
                    Thêm các tùy chọn quyền lợi vào kho hệ thống để sử dụng khi cấu hình gói dịch vụ.
                </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
                 {/* Form thêm mới */}
                 <div className="bg-[#262626] p-4 rounded-lg border border-slate-700 space-y-4">
                    <h4 className="font-medium text-sm text-slate-300 uppercase tracking-wide">Thêm quyền lợi mới</h4>
                    <div className="grid grid-cols-[1fr,2fr,auto] gap-3 items-end">
                         <div className="space-y-1">
                             <Label className="text-xs">Nhóm (Category)</Label>
                             <Input 
                                value={newBenefit.category}
                                onChange={(e) => setNewBenefit({...newBenefit, category: e.target.value})}
                                placeholder="VD: Watching Party"
                                className="bg-[#1e1e1e] border-slate-600 h-9"
                             />
                         </div>
                         <div className="space-y-1">
                             <Label className="text-xs">Nội dung quyền lợi</Label>
                             <Input 
                                value={newBenefit.content}
                                onChange={(e) => setNewBenefit({...newBenefit, content: e.target.value})}
                                placeholder="VD: Tạo phòng 50 người, Kick/Mute..."
                                className="bg-[#1e1e1e] border-slate-600 h-9"
                             />
                         </div>
                         <Button onClick={handleAddBenefit} size="sm" className="bg-green-600 hover:bg-green-700 mb-[1px]">
                             <ListPlus className="h-4 w-4 mr-1" /> Thêm
                         </Button>
                    </div>
                 </div>

                 {/* Danh sách hiện có */}
                   
                 <div>
                    <h4 className="font-medium text-sm text-slate-300 mb-3">Danh sách hiện có ({benefits.length})</h4>
                    <div className="border rounded-md border-slate-800 bg-[#121212] overflow-hidden">
                        <div className="h-[400px] overflow-y-auto no-scrollbar">
                            <div className="p-4 pr-6">
                                {Object.entries(groupedBenefits).map(([category, items]) => (
                                    <div key={category} className="mb-4 last:mb-0">
                                        <div className="sticky top-0 bg-[#121212] py-2 z-10 border-b border-slate-800 mb-2 shadow-sm">
                                            <h5 className="text-slate-500 text-xs font-bold uppercase tracking-wider">{category}</h5>
                                        </div>
                                        <div className="space-y-2 pl-2">
                                            {items.map(benefit => (
                                                <div key={benefit.id} className="flex items-center justify-between group py-2 border-b border-slate-800/50 last:border-0 hover:bg-slate-800/30 rounded px-2 transition-colors">
                                                    <span className="text-sm text-slate-300 mr-2">{benefit.content}</span>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        onClick={() => handleDeleteBenefit(benefit.id)}
                                                        className="h-7 w-7 opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-500 transition-all shrink-0"
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                 </div>
            </div>
             <DialogFooter>
                <Button onClick={() => setIsBenefitsDialogOpen(false)} className="bg-slate-700 hover:bg-slate-600">Đóng</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>


      {/* --- DIALOG XÓA --- */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-[#1e1e1e] border-slate-800 text-white">
            <DialogHeader>
                <DialogTitle>Xác nhận xóa</DialogTitle>
                <CardDescription className="text-slate-400">
                    Bạn có chắc chắn muốn xóa gói dịch vụ <span className="font-bold text-white">"{currentPlan?.name}"</span> không?
                    Hành động này không thể hoàn tác.
                </CardDescription>
            </DialogHeader>
            <DialogFooter>
                <Button variant="ghost" onClick={() => setIsDeleteDialogOpen(false)} className="hover:bg-slate-800 text-slate-300">
                    Hủy
                </Button>
                <Button variant="destructive" onClick={handleDeletePlan} className="bg-red-600 hover:bg-red-700">
                    Xóa ngay
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
