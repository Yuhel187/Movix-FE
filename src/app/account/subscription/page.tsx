"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { ShieldCheck, Zap } from "lucide-react";
import CurrentPlanStatus from "@/components/account/subscription/CurrentPlanStatus";
import BillingHistory from "@/components/account/subscription/BillingHistory";
import WalletBalance from "@/components/account/subscription/WalletBalance";
import { useSubscription } from "@/hooks/useSubscription";
import { getUserTransactionHistory } from "@/services/subscription.service";
import { Transaction, TransactionListMeta, TransactionStatus } from "@/types/subscription";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function UserSubscriptionPage() {
  const {
    subscription,
    isLoading: isSubscriptionLoading,
    remainingDays,
    refresh,
    error: subscriptionError,
  } = useSubscription();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isTransactionLoading, setIsTransactionLoading] = useState(true);
  const [transactionError, setTransactionError] = useState<string | null>(null);
  const [transactionStatus, setTransactionStatus] = useState<"ALL" | TransactionStatus>("ALL");
  const [transactionMeta, setTransactionMeta] = useState<TransactionListMeta>({
    totalItems: 0,
    currentPage: 1,
    limit: 10,
    totalPages: 0,
  });
  const [balance] = useState(120000);

  useEffect(() => {
    const loadTransactions = async () => {
      setIsTransactionLoading(true);
      setTransactionError(null);
      try {
        const result = await getUserTransactionHistory({
          page: transactionMeta.currentPage,
          limit: transactionMeta.limit,
          status: transactionStatus === "ALL" ? undefined : transactionStatus,
        });
        setTransactions(result.items);
        setTransactionMeta(result.meta);
      } catch {
        setTransactions([]);
        setTransactionError("Không thể tải lịch sử giao dịch.");
      } finally {
        setIsTransactionLoading(false);
      }
    };

    loadTransactions();
  }, [transactionMeta.currentPage, transactionMeta.limit, transactionStatus]);

  const formattedExpiryDate = subscription?.end_date
    ? new Date(subscription.end_date).toLocaleDateString("vi-VN")
    : "-";

  return (
    <div className="max-w-4xl">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Quản lý Gói cước</h1>
          <p className="mt-1 text-slate-400">Xem thông tin gói hiện tại, lịch sử thanh toán và thay đổi gói cước.</p>
        </div>
        <div className="flex gap-3">
           <Link href="/pricing">
             <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
               <Zap className="mr-2 h-4 w-4" /> Nâng cấp gói
             </Button>
           </Link>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Plan Status & History */}
        <div className="md:col-span-2 space-y-8">
          
          {/* Current Plan Section */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <ShieldCheck className="mr-2 h-5 w-5 text-blue-500" />
              Gói hiện tại
            </h2>
            {isSubscriptionLoading && (
              <Card className="bg-[#1e1e1e] border-slate-800">
                <CardContent className="p-4 text-slate-400">Đang tải gói hiện tại...</CardContent>
              </Card>
            )}

            {!isSubscriptionLoading && subscription && (
              <CurrentPlanStatus
                subscription={subscription}
                expiryDate={formattedExpiryDate}
                remainingDays={remainingDays}
              />
            )}

            {!isSubscriptionLoading && !subscription && (
              <Card className="bg-[#1e1e1e] border-slate-800">
                <CardContent className="p-4 text-slate-400">
                  Bạn chưa có gói đăng ký đang hoạt động.
                </CardContent>
              </Card>
            )}

            {!isSubscriptionLoading && subscriptionError && (
              <Card className="bg-[#1e1e1e] border-slate-800">
                <CardContent className="p-4 text-sm text-red-400">
                  Không thể tải dữ liệu gói dịch vụ. Vui lòng thử lại.
                  <div className="mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-slate-700 text-slate-200"
                      onClick={async () => {
                        await refresh();
                        toast.success("Đã làm mới thông tin gói");
                      }}
                    >
                      Tải lại gói
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </section>

          {/* Billing History Section */}
          <section>
             <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
               <div className="text-sm text-slate-400">
                 Tổng giao dịch: <span className="text-slate-200">{transactionMeta.totalItems}</span>
               </div>
               <Select
                 value={transactionStatus}
                 onValueChange={(value) => {
                   setTransactionMeta((prev) => ({ ...prev, currentPage: 1 }));
                   setTransactionStatus(value as "ALL" | TransactionStatus);
                 }}
               >
                 <SelectTrigger className="w-full sm:w-[220px] bg-zinc-900 border-slate-700 text-white">
                   <SelectValue placeholder="Lọc trạng thái" />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                   <SelectItem value="PENDING">PENDING</SelectItem>
                   <SelectItem value="COMPLETED">COMPLETED</SelectItem>
                   <SelectItem value="FAILED">FAILED</SelectItem>
                   <SelectItem value="REFUNDED">REFUNDED</SelectItem>
                 </SelectContent>
               </Select>
             </div>

             {transactionError && (
               <p className="mb-3 text-sm text-red-400">{transactionError}</p>
             )}
             <BillingHistory transactions={transactions} isLoading={isTransactionLoading} />

             <div className="mt-4 flex items-center justify-between">
               <p className="text-xs text-slate-500">
                 Trang {transactionMeta.currentPage} / {Math.max(transactionMeta.totalPages, 1)}
               </p>
               <div className="flex items-center gap-2">
                 <Button
                   size="sm"
                   variant="outline"
                   className="border-slate-700 text-slate-200"
                   disabled={transactionMeta.currentPage <= 1 || isTransactionLoading}
                   onClick={() => {
                     setTransactionMeta((prev) => ({
                       ...prev,
                       currentPage: Math.max(1, prev.currentPage - 1),
                     }));
                   }}
                 >
                   Trước
                 </Button>
                 <Button
                   size="sm"
                   variant="outline"
                   className="border-slate-700 text-slate-200"
                   disabled={
                     isTransactionLoading ||
                     transactionMeta.totalPages <= 0 ||
                     transactionMeta.currentPage >= transactionMeta.totalPages
                   }
                   onClick={() => {
                     setTransactionMeta((prev) => ({
                       ...prev,
                       currentPage: prev.currentPage + 1,
                     }));
                   }}
                 >
                   Sau
                 </Button>
               </div>
             </div>
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