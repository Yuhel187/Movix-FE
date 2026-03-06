"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowRight, CreditCard, ShieldCheck, Zap } from "lucide-react";
import CurrentPlanStatus from "@/components/account/subscription/CurrentPlanStatus";
import BillingHistory from "@/components/account/subscription/BillingHistory"; // Assuming I created this
import WalletBalance from "@/components/account/subscription/WalletBalance"; // Component for wallet
import { SubscriptionPlan } from "@/types/subscription";

// --- MOCK DATA ---
const CURRENT_USER_PLAN = {
  id: "2",
  name: "Movix Plus",
  description: "Trải nghiệm nâng cao, không quảng cáo, mở khóa nhiều tính năng.",
  price: 59000,
  currency: "VND",
  billingCycle: "MONTHLY" as const,
  features: ["HD 720p", "No Ads", "2 Device"],
  isActive: true,
  color: "bg-blue-600",
  recommended: true
};

export default function UserSubscriptionPage() {
  const currentPlan = CURRENT_USER_PLAN;
  const [balance, setBalance] = useState(120000);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Quản lý Gói cước</h1>
          <p className="text-slate-400">Xem thông tin gói hiện tại, lịch sử thanh toán và thay đổi gói cước.</p>
        </div>
        <div className="flex gap-3">
           <Link href="/pricing">
             <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
               <Zap className="mr-2 h-4 w-4" /> Nâng cấp gói
             </Button>
           </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Plan Status & History */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Current Plan Section */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <ShieldCheck className="mr-2 h-5 w-5 text-blue-500" />
              Gói hiện tại
            </h2>
            <CurrentPlanStatus 
              currentPlan={currentPlan} 
              expiryDate="15/04/2026" 
            />
          </section>

          {/* Billing History Section */}
          <section>
             <BillingHistory />
          </section>

        </div>

        {/* Right Column: Wallet & Help */}
        <div className="space-y-8">
            {/* Wallet Balance for Auto-Renew */}
            <section>
              <WalletBalance balance={balance} />
            </section>

            {/* Help Block */}
            <Card className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 border-slate-800">
               <CardContent className="p-6">
                  <h3 className="font-semibold text-white mb-2">Cần hỗ trợ?</h3>
                  <p className="text-sm text-slate-400 mb-4">
                    Nếu bạn có thắc mắc về hóa đơn hoặc gói cước, hãy liên hệ với chúng tôi.
                  </p>
                  <Button variant="outline" className="w-full border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800">
                    Liên hệ CSKH
                  </Button>
               </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}