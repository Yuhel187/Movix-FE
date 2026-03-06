"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, CalendarDays, ShieldCheck } from "lucide-react";
import { SubscriptionPlan } from "@/types/subscription"; 
interface CurrentPlanStatusProps {
  currentPlan: SubscriptionPlan;
  expiryDate: string;
}

export default function CurrentPlanStatus({ currentPlan, expiryDate }: CurrentPlanStatusProps) {
  return (
    <Card className="bg-[#1e1e1e] border-slate-800 mb-6 border-l-4 shadow-none" style={{ borderLeftColor: currentPlan.color?.replace('bg-', '') || '#3b82f6' }}>
      <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className={`p-2 rounded-full ${currentPlan.color || 'bg-slate-700'} bg-opacity-20 shrink-0`}>
            <ShieldCheck className={`h-5 w-5 text-white`} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              Gói hiện tại: {currentPlan.name}
              <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-none text-[10px] px-1.5 h-5">
                Active
              </Badge>
            </h3>
            <p className="text-slate-400 text-xs mt-0.5 flex items-center">
              <CalendarDays className="h-3 w-3 mr-1" />
              Hết hạn: <span className="text-slate-300 ml-1 font-medium">{expiryDate}</span>
            </p>
          </div>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto mt-0">
          <Button variant="ghost" size="sm" className="h-8 text-xs text-slate-300 hover:text-white hover:bg-slate-800 w-1/2 sm:w-auto px-2">
            Hủy gia hạn
          </Button>
          <Button size="sm" variant="outline" className="h-8 text-xs bg-transparent border-slate-700 text-slate-200 hover:bg-slate-800 w-1/2 sm:w-auto px-3">
            <CreditCard className="mr-1.5 h-3 w-3" />
            Thanh toán
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}