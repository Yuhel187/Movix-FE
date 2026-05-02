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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Pencil, Trash2 } from "lucide-react";
import {
  Check,
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


interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  duration_days: number;
  level: number;
  features: string[]; // Stores content strings
  isActive: boolean;
  can_create_watch_party: boolean;
  max_watch_party_participants: number;
  can_kick_mute_members: boolean;
  chatbot_max_questions_per_day: number;
  search_ai_max_requests_per_day: number;
  offline_download_supported: boolean;
  max_devices: number;
  gamification_xp_multiplier: number;
  smart_search_supported: boolean;
  mobile_remote_control_supported: boolean;
  recommended?: boolean;
}


const DEFAULT_FORM_DATA: Omit<SubscriptionPlan, "id"> = {
  name: "",
  description: "",
  price: 0,
  currency: "VND",
  duration_days: 30,
  level: 1,
  features: [],
  isActive: true,
  can_create_watch_party: false,
  max_watch_party_participants: 0,
  can_kick_mute_members: false,
  chatbot_max_questions_per_day: 5,
  search_ai_max_requests_per_day: 5,
  offline_download_supported: false,
  max_devices: 1,
  gamification_xp_multiplier: 1,
  smart_search_supported: false,
  mobile_remote_control_supported: false,
};

export default function SubscriptionPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan | null>(null);
  const [formData, setFormData] =
    useState<Omit<SubscriptionPlan, "id">>(DEFAULT_FORM_DATA);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("plans");
  const [filterPlanId, setFilterPlanId] = useState<string | undefined>(
    undefined,
  );
  const fetchPlans = async () => {
    try {
      setLoading(true);
      const data = await subscriptionService.getAllPlans();

      setPlans(
        data.map((p: any) => ({
          ...p,
          features: Array.isArray(p.benefits) ? p.benefits : (p.benefits?.features || []),
          chatbot_max_questions_per_day: p.benefits?.chatbot_ai?.max_questions_per_day ?? 5,
          search_ai_max_requests_per_day:
            p.benefits?.search_ai?.max_requests_per_day ??
            (p.benefits?.smart_search?.supported ? 5 : 0),
          offline_download_supported: p.benefits?.offline_download?.supported ?? false,
          max_devices: p.benefits?.device_login?.max_devices ?? 1,
          gamification_xp_multiplier: p.benefits?.gamification?.xp_multiplier ?? 1,
          smart_search_supported: p.benefits?.smart_search?.supported ?? false,
          mobile_remote_control_supported: p.benefits?.mobile_remote_control?.supported ?? false,
          duration_days: p.duration_days ?? 30,
          level: p.level ?? 1,
          currency: p.currency ?? "VND",
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
      duration_days: plan.duration_days,
      level: plan.level,
      features: [...plan.features],
      isActive: plan.isActive,

      can_create_watch_party: plan.can_create_watch_party,
      max_watch_party_participants: plan.max_watch_party_participants,
      can_kick_mute_members: plan.can_kick_mute_members,
      chatbot_max_questions_per_day: plan.chatbot_max_questions_per_day,
      search_ai_max_requests_per_day: plan.search_ai_max_requests_per_day,
      offline_download_supported: plan.offline_download_supported,
      max_devices: plan.max_devices,
      gamification_xp_multiplier: plan.gamification_xp_multiplier,
      smart_search_supported: plan.smart_search_supported,
      mobile_remote_control_supported: plan.mobile_remote_control_supported,
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
      const generatedFeatures: string[] = [];

      if (formData.can_create_watch_party) {
        if (
          formData.max_watch_party_participants >= 50 &&
          formData.can_kick_mute_members
        ) {
          generatedFeatures.push(
            `Tạo phòng Watch Party Siêu lớn (${formData.max_watch_party_participants} người), có quyền Kick/Mute thành viên.`,
          );
        } else {
          generatedFeatures.push(
            `Được Tạo phòng Watch Party (Tối đa ${formData.max_watch_party_participants} người).`,
          );
        }
      } else {
        generatedFeatures.push("Chỉ được Tham gia phòng người khác tạo.");
      }

      generatedFeatures.push(
        formData.chatbot_max_questions_per_day === -1
          ? "Chatbot AI: Không giới hạn."
          : `Chatbot AI: Giới hạn ${formData.chatbot_max_questions_per_day} câu/ngày.`,
      );

      generatedFeatures.push(
        formData.smart_search_supported
          ? formData.search_ai_max_requests_per_day === -1
            ? "Tìm kiếm thông minh AI: Không giới hạn lượt/ngày."
            : `Tìm kiếm thông minh AI: Giới hạn ${formData.search_ai_max_requests_per_day} lượt/ngày.`
          : "Tìm kiếm thông minh AI: Không hỗ trợ.",
      );

      generatedFeatures.push(
        formData.offline_download_supported
          ? "Cho phép tải về Mobile App."
          : "Không hỗ trợ tải về (Offline).",
      );

      generatedFeatures.push(
        `${formData.max_devices} thiết bị đăng nhập cùng lúc.`,
      );

      generatedFeatures.push(
        formData.gamification_xp_multiplier > 1
          ? `Tăng tốc ${formData.gamification_xp_multiplier}x XP khi xem phim.`
          : "Tốc độ cày cấp bình thường (1x XP).",
      );

      generatedFeatures.push(
        `Tìm kiếm thông minh: ${formData.smart_search_supported ? "Có" : "Không"}.`,
      );

      generatedFeatures.push(
        formData.mobile_remote_control_supported
          ? "Có Mobile Remote Control."
          : "Không Mobile Remote Control.",
      );

      const payload = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        duration_days: formData.duration_days,
        level: formData.level,
        can_create_watch_party: formData.can_create_watch_party,
        max_watch_party_participants: formData.max_watch_party_participants,
        can_kick_mute_members: formData.can_kick_mute_members,
        is_active: formData.isActive,
        benefits: {
          features: generatedFeatures,
          chatbot_ai: {
            max_questions_per_day: formData.chatbot_max_questions_per_day,
          },
          search_ai: {
            max_requests_per_day: formData.smart_search_supported
              ? formData.search_ai_max_requests_per_day
              : 0,
          },
          offline_download: {
            supported: formData.offline_download_supported,
          },
          device_login: {
            max_devices: formData.max_devices,
          },
          gamification: {
            xp_multiplier: formData.gamification_xp_multiplier,
          },
          smart_search: {
            supported: formData.smart_search_supported,
          },
          mobile_remote_control: {
            supported: formData.mobile_remote_control_supported,
          },
        },
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
                
                {plan.recommended && (
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 z-20" />
                )}

                <CardHeader
                  className={`pb-4 border-b border-slate-800 relative space-y-4`}
                >
                  <div className="flex justify-between items-start w-full">
                    <div className="space-y-1">
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
                      /{plan.duration_days} ngày
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

      
      <Dialog open={isPlanDialogOpen} onOpenChange={setIsPlanDialogOpen}>
        <DialogContent className="max-w-[90vw] w-full lg:max-w-4xl bg-[#1e1e1e] border-slate-800 text-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {currentPlan ? "Chỉnh sửa gói dịch vụ" : "Thêm gói dịch vụ mới"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 py-4">
            
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="level" title="Số càng cao xếp thứ hạng càng cao">Thứ hạng (Level)</Label>
                  <Input
                    id="level"
                    type="number"
                    min={1}
                    value={formData.level}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        level: Number(e.target.value),
                      })
                    }
                    className="bg-[#262626] border-slate-700 focus:border-primary"
                  />
                </div>
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
                  <Label htmlFor="duration_days">Thời hạn (Ngày)</Label>
                  <div className="relative">
                    <Input
                      id="duration_days"
                      type="number"
                      min={1}
                      value={formData.duration_days}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          duration_days: Number(e.target.value),
                        })
                      }
                      className="bg-[#262626] border-slate-700 focus:border-primary pr-12"
                    />
                    <span className="absolute right-3 top-2.5 text-slate-400 text-sm font-semibold pointer-events-none">
                      Ngày
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                <div className="grid gap-2">
                  <Label className="text-sm font-medium">
                    Trạng thái hiển thị
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
                  </div>
                </div>
              </div>

              
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

            
            <div className="space-y-4 flex flex-col h-full">
              <h3 className="text-lg font-semibold flex items-center text-primary">
                <ListPlus className="mr-2 h-5 w-5" />
                Cấu hình Quyền lợi Gói (Benefits)
              </h3>

              <div className="flex-1 bg-[#262626] rounded-md border border-slate-800 p-4 overflow-y-auto space-y-4 min-h-[300px]">
                <div className="space-y-2">
                  <Label
                    htmlFor="chatbot_max"
                    className="text-sm font-bold text-slate-300"
                  >
                    1. Giới hạn Chatbot AI / Agent
                  </Label>
                  <p className="text-xs text-slate-500">
                    Số câu hỏi mỗi ngày (-1 là không giới hạn)
                  </p>
                  <Input
                    id="chatbot_max"
                    type="number"
                    value={formData.chatbot_max_questions_per_day}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        chatbot_max_questions_per_day: Number(e.target.value),
                      })
                    }
                    className="bg-[#1e1e1e] border-slate-700"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="search_ai_max"
                    className="text-sm font-bold text-slate-300"
                  >
                    2. Giới hạn Tìm kiếm thông minh AI
                  </Label>
                  <p className="text-xs text-slate-500">
                    Số lượt tìm kiếm mỗi ngày (-1 là không giới hạn, 0 là tắt)
                  </p>
                  <Input
                    id="search_ai_max"
                    type="number"
                    value={formData.search_ai_max_requests_per_day}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setFormData({
                        ...formData,
                        search_ai_max_requests_per_day: val,
                        smart_search_supported: val !== 0
                      });
                    }}
                    className="bg-[#1e1e1e] border-slate-700"
                  />
                </div>

                <div className="space-y-2 pt-4 border-t border-slate-800">
                  <Label
                    htmlFor="max_devices"
                    className="text-sm font-bold text-slate-300"
                  >
                    3. Số thiết bị đăng nhập cùng lúc
                  </Label>
                  <Input
                    id="max_devices"
                    type="number"
                    min={1}
                    value={formData.max_devices}
                    onChange={(e) =>
                      setFormData({ ...formData, max_devices: Number(e.target.value) })
                    }
                    className="bg-[#1e1e1e] border-slate-700"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="xp_multiplier"
                    className="text-sm font-bold text-slate-300"
                  >
                    4. Hệ số XP (Gamification)
                  </Label>
                  <Input
                    id="xp_multiplier"
                    type="number"
                    min={1}
                    step={0.1}
                    value={formData.gamification_xp_multiplier}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        gamification_xp_multiplier: Number(e.target.value),
                      })
                    }
                    className="bg-[#1e1e1e] border-slate-700"
                  />
                </div>

                <div className="pt-2 border-t border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="offline_download"
                      className="text-sm font-bold text-slate-300 cursor-pointer"
                    >
                      5. Cho phép tải xuống (Offline)
                    </Label>
                    <input
                      type="checkbox"
                      id="offline_download"
                      checked={formData.offline_download_supported}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          offline_download_supported: e.target.checked,
                        })
                      }
                      className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-primary"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="mobile_remote"
                      className="text-sm font-bold text-slate-300 cursor-pointer"
                    >
                      6. Mobile Remote Control
                    </Label>
                    <input
                      type="checkbox"
                      id="mobile_remote"
                      checked={formData.mobile_remote_control_supported}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          mobile_remote_control_supported: e.target.checked,
                        })
                      }
                      className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-primary"
                    />
                  </div>
                </div>
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

      
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-[#1e1e1e] border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle>Xác nhận đổi trạng thái</DialogTitle>
            <CardDescription className="text-slate-400">
              Bạn có chắc chắn muốn thay đổi trạng thái gói dịch vụ{" "}
              <span className="font-bold text-white">
                &quot;{currentPlan?.name}&quot;
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
