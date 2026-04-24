"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, CalendarDays, ShieldCheck } from "lucide-react";
import { UserSubscription } from "@/types/subscription";
import Link from "next/link";
import { RefundRequestModal } from "./RefundRequestModal";

interface CurrentPlanStatusProps {
  subscription: UserSubscription;
  expiryDate: string;
  remainingDays: number;
}

const getStatusLabel = (status: UserSubscription["status"]) => {
  if (status === "ACTIVE") return { text: "Active", className: "bg-green-500/20 text-green-400" };
  if (status === "EXPIRED") return { text: "Expired", className: "bg-yellow-500/20 text-yellow-400" };
  if (status === "CANCELLED") return { text: "Cancelled", className: "bg-red-500/20 text-red-400" };
  return { text: "Trial", className: "bg-blue-500/20 text-blue-400" };
};

const formatBenefit = (key: string, value: unknown) => {
  if (typeof value === "boolean") {
    return value ? key : "";
  }
  if (typeof value === "object" && value !== null) {
    return ""; // Ignore nested objects since their details are usually in `features`
  }

  return `${key}: ${String(value)}`;
};

export default function CurrentPlanStatus({ subscription, expiryDate, remainingDays }: CurrentPlanStatusProps) {
  const planName = subscription.plan?.name || "Subscription";
  const plan = subscription.plan;
  const status = getStatusLabel(subscription.status);

  const rawBenefits = plan?.benefits || {};
  let benefitsList: string[] = [];
  
  if (Array.isArray(rawBenefits.features)) {
    benefitsList = [...rawBenefits.features] as string[];
  } else {
    benefitsList = Object.entries(rawBenefits)
      .map(([key, value]) => formatBenefit(key, value))
      .filter(Boolean);
  }
  
  const displayBenefits = benefitsList.slice(0, 4);

  if (plan?.can_create_watch_party) {
    displayBenefits.push(`Watch Party: tối đa ${plan.max_watch_party_participants} người`);
  }

  if (plan?.can_kick_mute_members) {
    displayBenefits.push("Có quyền kick/mute thành viên");
  }

  return (
    <Card className="bg-[#1e1e1e] border-slate-800 mb-6 border-l-4 shadow-none" style={{ borderLeftColor: '#3b82f6' }}>
      <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="p-2 rounded-full bg-blue-600/20 shrink-0">
            <ShieldCheck className={`h-5 w-5 text-white`} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              Gói hiện tại: {planName}
              <Badge variant="secondary" className={`${status.className} border-none text-[10px] px-1.5 h-5`}>
                {status.text}
              </Badge>
            </h3>
            <p className="text-slate-400 text-xs mt-0.5 flex items-center">
              <CalendarDays className="h-3 w-3 mr-1" />
              Hết hạn: <span className="text-slate-300 ml-1 font-medium">{expiryDate}</span>
            </p>
            <p className="text-slate-400 text-xs mt-1">
              Còn lại: <span className="text-white font-medium">{Math.max(0, remainingDays)} ngày</span>
            </p>
            {displayBenefits.length > 0 && (
              <ul className="mt-2 text-xs text-slate-300 space-y-1">
                {displayBenefits.map((benefit, index) => (
                  <li key={`${benefit}-${index}`}>• {benefit}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto mt-0">
          <RefundRequestModal />
          <Button size="sm" variant="outline" className="h-8 text-xs bg-transparent border-slate-700 text-slate-200 hover:bg-slate-800 w-full sm:w-auto px-3" asChild>
            <Link href="/pricing">
            <CreditCard className="mr-1.5 h-3 w-3" />
            Đổi/Nâng cấp gói
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}