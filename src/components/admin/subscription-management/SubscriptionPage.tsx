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
  SelectLabel,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Pencil, Trash2 } from "lucide-react";
import {
  Check,
  X,
  CreditCard,
  MoreVertical,
  Settings,
  ListPlus,
  Receipt,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { subscriptionService } from "@/services/subscription.service";
import { useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserSubscriptionsTab from "./UserSubscriptionsTab";

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

const BENEFIT_CATEGORIES = [
  {
    category: "NỀN TẢNG & XEM PHIM",
    items: [
      "Xem mọi lúc mọi nơi trên đa thiết bị",
      "Trải nghiệm không giới hạn phim",
      "Tạo danh sách phát cá nhân",
      "Bình luận nổi bật dán nhãn",
      "Hỗ trợ và ưu tiên xử lý",
    ],
  },
  {
    category: "TÍNH NĂNG TƯƠNG TÁC",
    items: [
      "Tạo Watch Party (Tối đa 10 người)",
      "Tạo Watch Party mở rộng (Tối đa 50 người)",
      "Quyền quản trị phòng xem chung (Kick/Mute)",
      "Phòng chat Voice chất lượng cao",
    ],
  },
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
      "Tốc độ cày cấp bình thường (1x XP)",
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
      "Tăng tốc 1.2x XP khi xem phim",
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
      "Tăng tốc 2x XP (Lên hạng cực nhanh)",
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

  // Dialog states
  const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Edit states
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan | null>(null);
  const [formData, setFormData] =
    useState<Omit<SubscriptionPlan, "id">>(DEFAULT_FORM_DATA);

  // Basic states
  const [loading, setLoading] = useState(false);

  // Focus plan cho Tab Danh Sách Nguười Dùng (bấm từ thẻ Package)
  const [activeTab, setActiveTab] = useState("plans");
  const [filterPlanId, setFilterPlanId] = useState<string | undefined>(
    undefined,
  );

  // --- FETCH DATA ---
  const fetchPlans = async () => {
    try {
      setLoading(true);
      const data = await subscriptionService.getAllPlans();
      // the endpoint returned from Prisma might have some missing optional keys or mismatched "features"
      // Wait, is 'features' saved as a JSON string or what? Let's check Prisma schema. Wait, if it's 'benefits' array...
      setPlans(
        data.map((p: any) => ({
          ...p,
          features: p.benefits || [], // Assuming it's saved in benefits
          billingCycle: "MONTHLY", // Missing from DB maybe?
          currency: "VND", // Missing from DB?
          isActive: p.is_active,
        })),
      );
    } catch (error) {
      toast.error("Không thể tải danh sách gói cước.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

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
      can_kick_mute_members: plan.can_kick_mute_members,
    });
    setIsPlanDialogOpen(true);
  };

  const handleSavePlan = async () => {
    if (!formData.name) {
      toast.error("Vui lòng nhập tên gói dịch vụ");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        duration_days: 30,
        benefits: formData.features,
        can_create_watch_party: formData.can_create_watch_party,
        max_watch_party_participants: formData.max_watch_party_participants,
        can_kick_mute_members: formData.can_kick_mute_members,
        is_active: formData.isActive,
      };

      if (currentPlan) {
        await subscriptionService.updatePlan(currentPlan.id, payload);
        toast.success("Cập nhật gói dịch vụ thành công");
      } else {
        await subscriptionService.createPlan(payload);
        toast.success("Thêm gói dịch vụ mới thành công");
      }

      await fetchPlans();
      setIsPlanDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDeleteDialog = (plan: SubscriptionPlan) => {
    setCurrentPlan(plan);
    setIsDeleteDialogOpen(true);
  };

  const handleDeletePlan = async () => {
    if (currentPlan) {
      try {
        setLoading(true);
        await subscriptionService.togglePlanFlag(currentPlan.id);
        toast.success(
          "Thay đổi trạng thái (Hoạt động/Tạm dừng) gói cước thành công",
        );
        await fetchPlans();
        setIsDeleteDialogOpen(false);
        setCurrentPlan(null);
      } catch (error: any) {
        toast.error("Có lỗi xảy ra");
      } finally {
        setLoading(false);
      }
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

  // --- HELPERS ---

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const viewPlanUsers = (planId: string) => {
    setFilterPlanId(planId);
    setActiveTab("subscriptions");
  };

  return (
    <div className="space-y-6 pt-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
            Quản lý Gói Dịch Vụ
          </h1>
          <p className="text-slate-400">
            Cấu hình các gói đăng ký, quyền lợi và theo dõi lịch sử thanh toán
            người dùng.
          </p>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(val) => {
          if (val === "plans") setFilterPlanId(undefined); // Xóa filter nếu tự ấn về danh sách Package
          setActiveTab(val);
        }}
        className="space-y-6"
      >
        <TabsList className="bg-slate-800 border-slate-700">
          <TabsTrigger
            value="plans"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Quản lý Gói Dịch Vụ
          </TabsTrigger>
          <TabsTrigger
            value="subscriptions"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Lịch đăng ký của Users
          </TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="space-y-6">
          <div className="flex justify-end gap-2">
            <Button
              onClick={handleOpenAddDialog}
              className="bg-primary hover:bg-primary/90"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Thêm Gói Mới
            </Button>
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

                <CardHeader
                  className={`pb-4 border-b border-slate-800 relative space-y-4`}
                >
                  <div className="flex justify-between items-start w-full">
                    <div className="space-y-1">
                      <div
                        className={`w-8 h-1 ${plan.color || "bg-slate-500"} mb-2 rounded-full`}
                      ></div>
                      <CardTitle className="text-xl font-bold text-white leading-tight">
                        {plan.name}
                      </CardTitle>
                    </div>
                    <Badge
                      variant={plan.isActive ? "default" : "destructive"}
                      className={`${plan.isActive ? "bg-green-900/40 text-green-400 hover:bg-green-900/60" : "bg-red-900/40 text-red-400 hover:bg-red-900/60"} whitespace-nowrap ml-2`}
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
                        <div
                          key={idx}
                          className="flex items-start text-sm text-slate-300 group/item"
                        >
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
                        <Button
                          variant="ghost"
                          className="h-10 w-10 p-0 text-slate-400 hover:text-white"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="bg-[#1e1e1e] border-slate-800 text-slate-200"
                      >
                        <DropdownMenuItem
                          onClick={() => viewPlanUsers(plan.id)}
                          className="hover:bg-slate-800 cursor-pointer"
                        >
                          <Receipt className="mr-2 h-4 w-4 text-emerald-400" />
                          ĐK User Nhanh
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleOpenDeleteDialog(plan)}
                          className="text-red-500 focus:text-red-500 focus:bg-red-500/10 cursor-pointer"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Cập nhật TT (Active)
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
        </TabsContent>

        <TabsContent value="subscriptions">
          <UserSubscriptionsTab />
        </TabsContent>
      </Tabs>

      {/* --- DIALOG THÊM / SỬA GÓI --- */}
      <Dialog open={isPlanDialogOpen} onOpenChange={setIsPlanDialogOpen}>
        <DialogContent className="max-w-[90vw] w-full lg:max-w-4xl bg-[#1e1e1e] border-slate-800 text-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {currentPlan ? "Chỉnh sửa gói dịch vụ" : "Thêm gói dịch vụ mới"}
            </DialogTitle>
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
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Ví dụ: Movix Ultimate"
                  className="bg-[#262626] border-slate-700 focus:border-primary"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Mô tả ngắn</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
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
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          price: Number(e.target.value),
                        })
                      }
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
                  <Label htmlFor="color" className="text-sm font-medium">
                    Màu nhận diện
                  </Label>
                  <Select
                    value={formData.color}
                    onValueChange={(value) =>
                      setFormData({ ...formData, color: value })
                    }
                  >
                    <SelectTrigger className="bg-[#262626] border-slate-700 text-white h-10 w-full">
                      <div className="flex items-center w-full overflow-hidden">
                        {formData.color ? (
                          <>
                            <div
                              className={`w-4 h-4 rounded-full mr-2 shrink-0 ${formData.color} border border-white/20`}
                            ></div>
                            <span className="truncate text-sm">
                              {formData.color === "bg-slate-500"
                                ? "Xám (Basic)"
                                : formData.color === "bg-blue-600"
                                  ? "Xanh dương (Plus)"
                                  : formData.color === "bg-amber-500"
                                    ? "Vàng (Gold)"
                                    : formData.color === "bg-purple-600"
                                      ? "Tím (Premium)"
                                      : formData.color === "bg-red-600"
                                        ? "Đỏ (Special)"
                                        : formData.color}
                            </span>
                          </>
                        ) : (
                          <span className="text-slate-400 text-sm">
                            Chọn màu...
                          </span>
                        )}
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-[#262626] border-slate-700 text-white shadow-xl z-[9999]">
                      <SelectItem value="bg-slate-500">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-slate-500 mr-2"></div>
                          Xám (Basic)
                        </div>
                      </SelectItem>
                      <SelectItem value="bg-blue-600">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-blue-600 mr-2"></div>
                          Xanh dương (Plus)
                        </div>
                      </SelectItem>
                      <SelectItem value="bg-amber-500">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
                          Vàng (Gold)
                        </div>
                      </SelectItem>
                      <SelectItem value="bg-purple-600">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-purple-600 mr-2"></div>
                          Tím (Premium)
                        </div>
                      </SelectItem>
                      <SelectItem value="bg-red-600">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-red-600 mr-2"></div>
                          Đỏ (Special)
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label className="text-sm font-medium">
                    Trạng thái & Hiển thị
                  </Label>
                  <div className="flex flex-col gap-3 mt-1 bg-[#262626] border border-slate-800 rounded-md p-3">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={!!formData.isActive}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            isActive: e.target.checked,
                          })
                        }
                        className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-primary focus:ring-primary focus:ring-offset-0"
                      />
                      <Label
                        htmlFor="isActive"
                        className="cursor-pointer font-normal text-sm select-none"
                      >
                        Đang hoạt động
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="recommended"
                        checked={!!formData.recommended}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            recommended: e.target.checked,
                          })
                        }
                        className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-amber-500 focus:ring-amber-500 focus:ring-offset-0"
                      />
                      <Label
                        htmlFor="recommended"
                        className="cursor-pointer font-normal text-sm text-amber-500 select-none flex items-center"
                      >
                        Đề xuất{" "}
                        <span className="text-[10px] ml-1 opacity-70 border border-amber-500/50 rounded px-1">
                          (HOT)
                        </span>
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
                    <Label
                      htmlFor="can_create_watch_party"
                      className="cursor-pointer"
                    >
                      Quyền tạo phòng
                    </Label>
                    <input
                      type="checkbox"
                      id="can_create_watch_party"
                      checked={!!formData.can_create_watch_party}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          can_create_watch_party: e.target.checked,
                        })
                      }
                      className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-primary"
                    />
                  </div>

                  {formData.can_create_watch_party && (
                    <>
                      <div className="grid gap-2">
                        <Label htmlFor="max_participants" className="text-sm">
                          Giới hạn thành viên tối đa
                        </Label>
                        <Input
                          id="max_participants"
                          type="number"
                          min={0}
                          value={formData.max_watch_party_participants || 0}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              max_watch_party_participants: Number(
                                e.target.value,
                              ),
                            })
                          }
                          className="bg-[#262626] border-slate-700 h-8"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label
                          htmlFor="can_kick_mute"
                          className="text-sm cursor-pointer"
                        >
                          Quyền quản trị (Kick/Mute)
                        </Label>
                        <input
                          type="checkbox"
                          id="can_kick_mute"
                          checked={!!formData.can_kick_mute_members}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              can_kick_mute_members: e.target.checked,
                            })
                          }
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
                <Badge
                  variant="secondary"
                  className="bg-slate-800 text-slate-300"
                >
                  {formData.features.length} quyền lợi
                </Badge>
              </h3>

              <div className="flex gap-2">
                <Select onValueChange={handleAddFeatureToPlan}>
                  <SelectTrigger className="bg-[#262626] border-slate-700 text-white flex-1">
                    <SelectValue placeholder="Chọn quyền lợi để thêm..." />
                  </SelectTrigger>
                  <SelectContent className="bg-[#262626] border-slate-700 text-white max-h-[300px]">
                    {BENEFIT_CATEGORIES.map((categoryGroup) => (
                      <SelectGroup key={categoryGroup.category}>
                        <SelectLabel className="text-slate-400 pl-2 py-1.5 text-xs font-bold uppercase tracking-wider bg-slate-900/50">
                          {categoryGroup.category}
                        </SelectLabel>
                        {categoryGroup.items.map((item, idx) => (
                          <SelectItem
                            key={`${categoryGroup.category}-${idx}`}
                            value={item}
                            className="cursor-pointer pl-4"
                          >
                            {item}
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
                    <p className="text-sm">
                      Chọn từ danh sách bên trên để thêm
                    </p>
                  </div>
                ) : (
                  <ScrollArea className="flex-1 h-full pr-3 relative">
                    <div className="space-y-2 p-1">
                      {formData.features.map((feature, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-[#1e1e1e] p-3 rounded border border-slate-800 group hover:border-slate-600 transition-colors"
                        >
                          <div className="flex items-start gap-3 flex-1 mr-2">
                            <div className="bg-primary/20 p-1 rounded-full mt-0.5 shrink-0">
                              <Check className="h-3 w-3 text-primary" />
                            </div>
                            <span className="text-sm text-slate-200 leading-tight">
                              {feature}
                            </span>
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
            <Button
              variant="outline"
              onClick={() => setIsPlanDialogOpen(false)}
              className="border-slate-700 hover:bg-slate-800 text-slate-300"
            >
              Hủy bỏ
            </Button>
            <Button
              onClick={handleSavePlan}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              {currentPlan ? "Lưu thay đổi" : "Tạo gói mới"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- DIALOG XÓA --- */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-[#1e1e1e] border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle>Xác nhận đổi trạng thái</DialogTitle>
            <CardDescription className="text-slate-400">
              Bạn có chắc chắn muốn thay đổi trạng thái gói dịch vụ{" "}
              <span className="font-bold text-white">
                "{currentPlan?.name}"
              </span>{" "}
              không? Nếu ngừng hoạt động, người dùng mới sẽ không thấy gói này.
            </CardDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="hover:bg-slate-800 text-slate-300"
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeletePlan}
              className="bg-red-600 hover:bg-red-700"
            >
              Xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
