"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import PricingCard from "@/components/account/subscription/PricingCard";
import { SubscriptionPlan } from "@/types/subscription";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft, Check, HelpCircle } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

// --- MOCK DATA ---
const ACTIVE_PLANS: SubscriptionPlan[] = [
  {
    id: "1",
    name: "Standard",
    description: "Gói miễn phí cơ bản dành cho người mới bắt đầu.",
    price: 0,
    currency: "VND",
    billingCycle: "MONTHLY",
    features: [
      "Xem phim thường, phim cũ",
      "Chất lượng SD 480p",
      "Xem phim có quảng cáo",
      "Xem trên 1 thiết bị",
      "Chỉ được Tham gia phòng Watch Party",
    ],
    isActive: true,
    color: "bg-slate-500",
  },
  {
    id: "2",
    name: "Movix Plus",
    description: "Trải nghiệm nâng cao, không quảng cáo, mở khóa nhiều tính năng.",
    price: 59000,
    currency: "VND",
    billingCycle: "MONTHLY",
    features: [
      "Xem tất cả, bao gồm 'Phim Hot'",
      "Chất lượng HD 720p",
      "Không quảng cáo",
      "Xem trên 2 thiết bị cùng lúc",
      "Được Tạo phòng (Tối đa 5 người)",
      "Cho phép tải về Mobile App",
    ],
    isActive: true,
    color: "bg-blue-600",
    recommended: true
  },
  {
    id: "3",
    name: "Movix Ultimate",
    description: "Quyền năng tối thượng, trải nghiệm điện ảnh 4K cho gia đình.",
    price: 199000,
    currency: "VND",
    billingCycle: "MONTHLY",
    features: [
      "Xem sớm phim mới (Sneak Peek) trước 24h",
      "Chất lượng Full HD 1080p & 4K",
      "Không quảng cáo",
      "Xem trên 4 thiết bị cùng lúc",
      "Tạo phòng Siêu lớn (50 người)",
      "Voice Chat HD: Âm thanh cao, lọc ồn",
      "AI Gợi ý theo cảm xúc & ngữ cảnh",
    ],
    isActive: true,
    color: "bg-amber-500",
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

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"MONTHLY" | "YEARLY">("MONTHLY");

  const handleSubscribe = (planId: string) => {
    toast.success("Đang chuyển đến trang thanh toán...");
    // window.location.href = `/checkout/${planId}?cycle=${billingCycle}`;
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navbar Placeholder or Back Button */}
      <div className="p-6">
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

          {/* Billing Toggle (Visual only for now since mock data is fixed) */}
          <div className="mt-8 flex justify-center items-center gap-4">
             <span className={`text-sm font-medium ${billingCycle === 'MONTHLY' ? 'text-white' : 'text-slate-500'}`}>Thanh toán tháng</span>
             <div 
               className="bg-slate-800 w-14 h-7 rounded-full relative cursor-pointer p-1 transition-colors hover:bg-slate-700"
               onClick={() => setBillingCycle(prev => prev === 'MONTHLY' ? 'YEARLY' : 'MONTHLY')}
             >
                <div className={`w-5 h-5 bg-primary rounded-full shadow-md transition-all duration-300 ${billingCycle === 'YEARLY' ? 'translate-x-7' : 'translate-x-0'}`} />
             </div>
             <span className={`text-sm font-medium ${billingCycle === 'YEARLY' ? 'text-white' : 'text-slate-500'}`}>
               Thanh toán năm <span className="text-green-500 text-xs ml-1 font-bold">-20%</span>
             </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start mb-24">
          {ACTIVE_PLANS.map((plan) => (
            <div key={plan.id} className="h-full">
              <PricingCard 
                plan={{
                  ...plan,
                  price: billingCycle === 'YEARLY' && plan.price > 0 ? plan.price * 12 * 0.8 : plan.price,
                  billingCycle: billingCycle
                }}
                isCurrentPlan={false} 
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
           <Button className="bg-white text-black hover:bg-slate-200 px-8 py-6 text-lg font-bold">
             Tạo tài khoản miễn phí
           </Button>
        </div>

      </div>
    </div>
  );
}