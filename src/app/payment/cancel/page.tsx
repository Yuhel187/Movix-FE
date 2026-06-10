"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, CircleX, Copy, Home, RefreshCcw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const copyText = async (value: string, label: string) => {
  if (!value) {
    toast.error(`${label} không có dữ liệu để sao chép`);
    return;
  }

  try {
    await navigator.clipboard.writeText(value);
    toast.success(`Đã sao chép ${label}`);
  } catch {
    toast.error(`Không thể sao chép ${label}`);
  }
};

const displayValue = (value: string | null) => value || "Không có";

export default function PaymentCancelPage() {
  const searchParams = useSearchParams();

  const payment = useMemo(() => {
    const orderCode = searchParams.get("orderCode") ?? "";
    const method = searchParams.get("method") ?? "";

    return {
      orderCode,
      method: method.toUpperCase() || "PAYOS",
    };
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link href="/pricing" className="inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Quay lại gói dịch vụ
          </Link>
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white">
            <Home className="h-4 w-4" />
            Trang chủ
          </Link>
        </div>

        <Card className="bg-[#1e1e1e] border-slate-800">
          <CardContent className="p-6 sm:p-8">
            <div className="mb-6 space-y-2">
              <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20">Đã hủy</Badge>
              <div className="flex items-center gap-3">
                <CircleX className="h-8 w-8 text-amber-400" />
                <div>
                  <h1 className="text-2xl font-bold text-white">Giao dịch đã bị hủy</h1>
                  <p className="mt-1 text-sm text-slate-300">
                    Bạn đã hủy thanh toán. Giao dịch chưa hoàn tất và sẽ không bị tính phí.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-lg border border-slate-800 bg-zinc-900 p-4">
                <p className="text-sm text-slate-400">Cong thanh toan</p>
                <p className="mt-2 font-semibold text-white">{displayValue(payment.method)}</p>
              </div>
              <div className="rounded-lg border border-slate-800 bg-zinc-900 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-slate-400">Mã đơn hàng</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-slate-300 hover:bg-slate-800 hover:text-white"
                    onClick={() => copyText(payment.orderCode, "mã đơn hàng")}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Sao chép
                  </Button>
                </div>
                <p className="mt-2 break-all font-mono text-base text-white">{displayValue(payment.orderCode)}</p>
              </div>
            </div>

            <div className="mt-6 rounded-lg border border-slate-800 bg-zinc-900 p-4 text-sm text-slate-300">
              <p className="font-medium text-white">Bạn muốn thanh toán lại?</p>
              <p className="mt-1">
                Bạn có thể quay lại trang gói dịch vụ và chọn lại gói phù hợp.
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button variant="outline" asChild className="border-slate-700 bg-transparent text-white hover:bg-slate-800">
                <Link href="/">Về trang chủ</Link>
              </Button>
              <Button asChild className="bg-primary text-white hover:bg-primary/90">
                <Link href="/pricing">
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Mua lại gói
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
