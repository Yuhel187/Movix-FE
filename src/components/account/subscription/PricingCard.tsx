"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Star } from "lucide-react";
import { SubscriptionPlan } from "@/types/subscription";

interface PricingCardProps {
  plan: SubscriptionPlan;
  isCurrentPlan: boolean;
  onSubscribe: (planId: string) => void;
}

export default function PricingCard({ plan, isCurrentPlan, onSubscribe }: PricingCardProps) {
  const formatCurrency = (amount: number, currency: string) => {
    return amount === 0 
      ? "Miễn phí" 
      : new Intl.NumberFormat("vi-VN", { style: "currency", currency }).format(amount);
  };

  return (
    <Card 
      className={`relative flex flex-col bg-[#1e1e1e] border-slate-800 transition-all duration-300 hover:-translate-y-1 
      ${plan.recommended ? 'border-primary shadow-[0_0_30px_-10px_rgba(59,130,246,0.3)]' : 'hover:border-slate-600'}`}
    >
      {/* Nổi bật gói Recommend */}
      {plan.recommended && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 border-none shadow-lg px-3 py-1 text-xs uppercase tracking-wider font-bold">
            <Star className="w-3 h-3 mr-1 fill-current" /> Đề xuất
          </Badge>
        </div>
      )}

      <CardHeader className="pb-4 pt-4 px-5">
        <div className={`w-8 h-8 rounded-lg mb-2 flex items-center justify-center ${plan.color || 'bg-slate-700'}`}>
          <ShieldCheckIcon className="w-5 h-5 text-white" />
        </div>
        <CardTitle className="text-lg font-bold text-white">{plan.name}</CardTitle>
        <CardDescription className="text-slate-400 text-xs h-8 line-clamp-2">{plan.description}</CardDescription>
        
        <div className="mt-2 flex items-baseline text-white">
          <span className="text-2xl font-extrabold tracking-tight">
            {formatCurrency(plan.price, plan.currency)}
          </span>
          {plan.price > 0 && (
            <span className="text-slate-400 ml-1 text-xs font-medium">
              /{plan.billingCycle === "MONTHLY" ? "tháng" : "năm"}
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col justify-between px-5 pb-5 pt-0">
        <ul className="space-y-2 mb-4">
          {plan.features.map((feature, idx) => (
            <li key={idx} className="flex items-start">
              <div className="mt-0.5 bg-primary/20 p-0.5 rounded-full mr-2 shrink-0">
                <Check className="h-2.5 w-2.5 text-primary" />
              </div>
              <span className="text-xs text-slate-300 leading-snug">{feature}</span>
            </li>
          ))}
        </ul>

        <Button 
          onClick={() => onSubscribe(plan.id)}
          disabled={isCurrentPlan}
          size="sm"
          className={`w-full font-bold text-sm transition-all h-9
            ${isCurrentPlan 
              ? 'bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed' 
              : plan.recommended 
                ? 'bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25' 
                : 'bg-white text-black hover:bg-slate-200'}`}
        >
          {isCurrentPlan ? "Đang sử dụng" : plan.price === 0 ? "Bắt đầu ngay" : "Nâng cấp"}
        </Button>
      </CardContent>
    </Card>
  );
}

// Icon helper cho Pricing Card
function ShieldCheckIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2-1 4-2 7-2 2.5 0 4.5 1 6.5 2a1 1 0 0 1 1 1v7z"/>
      <path d="m9 12 2 2 4-4"/>
    </svg>
  );
}