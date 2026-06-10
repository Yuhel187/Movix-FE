"use client";

import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import PricingCard, { PricingDisplayPlan } from "@/components/account/subscription/PricingCard";
import { SubscriptionPlan } from "@/types/subscription";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft, Landmark, QrCode } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { usePayment } from "@/hooks/usePayment";
import { useRouter } from "next/navigation";
import { subscriptionService } from "@/services/subscription.service";
import { UserSubscription } from "@/types/subscription";
import Navbar from "@/components/layout/NavBar";

type PaymentMethod = "PAYOS" | "VNPAY";

const PAYMENT_METHODS: Array<{
  value: PaymentMethod;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    value: "PAYOS",
    label: "PayOS",
    description: "QR ngân hàng",
    icon: QrCode,
  },
  {
    value: "VNPAY",
    label: "VNPay",
    description: "Thẻ ATM, QR, ví điện tử",
    icon: Landmark,
  },
];

const FAQS = [
  {
    question: "Tôi có thể hủy gói bất cứ lúc nào không?",
    answer: "Chắc chắn rồi! Bạn có thể hủy gói đăng ký bất kỳ lúc nào trong phần cài đặt tài khoản. Gói của bạn sẽ tiếp tục hoạt động cho đến hết chu kỳ thanh toán hiện tại."
  },
  {
    question: "Có giới hạn số lượng phim tôi có thể xem không?",
    answer: "Không, với các gói trả phí Movix Plus và Ultimate, bạn có quyền truy cập không giới hạn vào toàn bộ kho nội dung."
  },
  {
    question: "Watch Party hoạt động như thế nào?",
    answer: "Watch Party cho phép bạn xem phim đồng bộ cùng bạn bè. Gói miễn phí có thể tham gia, nhưng chỉ gói trả phí mới có thể tạo phòng và mời người khác."
  }
];

const levelColorClassMap: Record<number, string> = {
  1: "bg-slate-500",
  2: "bg-blue-600",
  3: "bg-amber-500",
};

const formatBenefitValue = (key: string, value: unknown): string => {
  if (typeof value === "boolean") {
    return value ? key : "";
  }
  if (typeof value === "object" && value !== null) {
    return ""; // Ignore nested objects since their details are usually in `features`
  }

  return `${key}: ${String(value)}`;
};

const toDisplayPlan = (plan: SubscriptionPlan): PricingDisplayPlan => {
  const benefits = plan.benefits ?? {};
  
  let featureList: string[] = [];
  
  if (Array.isArray(benefits.features)) {
    featureList = [...benefits.features] as string[];
  } else {
    featureList = Object.entries(benefits)
      .map(([key, value]) => formatBenefitValue(key, value))
      .filter(Boolean);
  }

  featureList = featureList.filter((f) => !f.toLowerCase().includes('remote control'));

  if (plan.can_create_watch_party) {
    featureList.push(`Tạo Watch Party (tối đa ${plan.max_watch_party_participants} người)`);
  }

  if (plan.can_kick_mute_members) {
    featureList.push("Kick/Mute thành viên trong Watch Party");
  }

  if (!featureList.length) {
    featureList.push("Truy cập các tính năng nâng cao");
  }

  return {
    ...plan,
    uiFeatures: featureList,
    badgeColorClass: levelColorClassMap[plan.level] || "bg-slate-700",
    isRecommended: plan.level >= 2,
  };
};

export default function PricingPage() {
  const router = useRouter();
  const { isLoggedIn, isLoading: isAuthLoading } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [isPlansLoading, setIsPlansLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("PAYOS");
  const { initiateCheckout, isCheckingOut } = usePayment();

  useEffect(() => {
    const loadPlans = async () => {
      setIsPlansLoading(true);
      try {
        const data = await subscriptionService.getSubscriptionPlans(true);
        setPlans(data);
      } catch {
        toast.error("Không thể tải danh sách gói");
        setPlans([]);
      } finally {
        setIsPlansLoading(false);
      }
    };

    loadPlans();
  }, []);

  useEffect(() => {
    const loadMySubscription = async () => {
      if (!isLoggedIn) {
        setSubscription(null);
        return;
      }

      try {
        const data = await subscriptionService.getUserSubscription();
        setSubscription(data);
      } catch {
        setSubscription(null);
      }
    };

    loadMySubscription();
  }, [isLoggedIn]);

  const planDisplayList = useMemo(() => {
    return plans
      .filter((plan) => plan.is_active)
      .sort((a, b) => a.level - b.level)
      .map(toDisplayPlan);
  }, [plans]);

  const isActive = !!(
    subscription &&
    subscription.status === "ACTIVE" &&
    new Date(subscription.end_date) > new Date()
  );

  const currentPlanId = isActive ? subscription?.plan_id : null;
  const currentPlanLevel = useMemo(() => {
    if (!currentPlanId) return 0;
    if (subscription?.plan?.level) return subscription.plan.level;
    const plan = plans.find(p => p.id === currentPlanId);
    return plan ? plan.level : 0;
  }, [currentPlanId, subscription, plans]);

  const handleSubscribe = async (planId: string) => {
    const selectedPlan = plans.find((plan) => plan.id === planId);

    if (!selectedPlan) {
      toast.error("Không tìm thấy gói đăng ký");
      return;
    }

    if (selectedPlan.price === 0) {
      toast.info("Gói miễn phí không cần thanh toán");
      return;
    }

    if (currentPlanId === planId) {
      toast.info("Bạn đang sử dụng gói này");
      return;
    }

    if (isActive && selectedPlan.level < currentPlanLevel) {
      toast.error("Bạn không thể hạ cấp xuống gói thấp hơn");
      return;
    }

    if (!isLoggedIn) {
      sessionStorage.setItem("redirectAfterLogin", "/pricing");
      toast.info("Vui lòng đăng nhập để mua gói");
      router.push("/login");
      return;
    }

    const result = await initiateCheckout(planId, paymentMethod);
    if (!result) {
      toast.error("Không thể tạo phiên thanh toán");
      return;
    }

    const paymentUrl = result.paymentData?.paymentUrl;
    if (!paymentUrl || paymentUrl === "undefined") {
      toast.error("Hệ thống chưa trả về URL thanh toán hợp lệ");
      return;
    }

    toast.success(`Dang chuyen den cong thanh toan ${paymentMethod}...`);
    window.location.href = paymentUrl;
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      {/* Navbar Placeholder or Back Button */}
      <div className="p-6 pt-24">
        <Link href="/" className="inline-flex items-center text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại trang chủ
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge className="bg-primary/20 text-primary hover:bg-primary/30 mb-4 px-4 py-1 rounded-full text-sm font-medium border-none">
            Gói dịch vụ linh hoạt
          </Badge>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-6">
            Chọn kế hoạch phù hợp với bạn
          </h1>
          <p className="text-xl text-slate-400">
            Trải nghiệm điện ảnh không giới hạn với chất lượng cao nhất. Nâng cấp hoặc thay đổi gói bất cứ lúc nào.
          </p>

          {isActive && subscription?.plan && (
            <p className="mt-4 text-sm text-emerald-400">
              Bạn đang sử dụng gói {subscription.plan.name}. Nâng cấp để mở khóa thêm quyền lợi.
            </p>
          )}
        </div>

        <div className="mx-auto mb-10 max-w-2xl">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
              Phương thức thanh toán
            </h2>
            <span className="text-xs text-slate-500">Áp dụng cho gói trả phí</span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {PAYMENT_METHODS.map((method) => {
              const Icon = method.icon;
              const isSelected = paymentMethod === method.value;

              return (
                <button
                  key={method.value}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setPaymentMethod(method.value)}
                  className={`flex min-h-20 items-center gap-3 rounded-lg border p-4 text-left transition-colors ${
                    isSelected
                      ? "border-primary bg-primary/10 text-white"
                      : "border-slate-800 bg-zinc-900 text-slate-300 hover:border-slate-600 hover:bg-zinc-800"
                  }`}
                >
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${
                      isSelected ? "bg-primary text-white" : "bg-slate-800 text-slate-300"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">{method.label}</span>
                    <span className="mt-1 block text-xs text-slate-400">{method.description}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start mb-24">
          {(isPlansLoading || isAuthLoading) && (
            <p className="text-slate-400">Đang tải danh sách gói...</p>
          )}

          {!isPlansLoading && !planDisplayList.length && (
            <p className="text-slate-400">Hiện chưa có gói đăng ký khả dụng.</p>
          )}

          {!isPlansLoading && planDisplayList.map((plan) => (
            <div key={plan.id} className="h-full">
              <PricingCard
                plan={plan}
                isCurrentPlan={currentPlanId === plan.id}
                isDowngrade={isActive && plan.level < currentPlanLevel}
                isLoading={isCheckingOut}
                onSubscribe={handleSubscribe}
              />
            </div>
          ))}
        </div>

        {/* Features Comparison or FAQ */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Câu hỏi thường gặp</h2>
          <Accordion type="single" collapsible className="w-full">
            {FAQS.map((faq, idx) => (
              <AccordionItem key={idx} value={`item-${idx}`} className="border-slate-800">
                <AccordionTrigger className="text-lg font-medium text-slate-200 hover:text-white hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-slate-400 text-base">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Start Trial CTA */}
        <div className="mt-24 rounded-2xl bg-gradient-to-r from-blue-900/50 to-purple-900/50 border border-slate-800 p-8 md:p-12 text-center">
           <h2 className="text-3xl font-bold mb-4">Bạn vẫn chưa quyết định?</h2>
           <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
             Bắt đầu với gói Standard miễn phí của chúng tôi và khám phá kho phim khổng lồ ngay hôm nay. Không cần thẻ tín dụng.
           </p>
           <Button
             className="bg-white text-black hover:bg-slate-200 px-8 py-6 text-lg font-bold"
             onClick={() => {
               router.push(isLoggedIn ? "/" : "/register");
             }}
           >
             {isLoggedIn ? "Khám phá ngay" : "Tạo tài khoản miễn phí"}
           </Button>
        </div>

      </div>
    </div>
  );
}
