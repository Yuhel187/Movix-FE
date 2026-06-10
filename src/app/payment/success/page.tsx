"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  CheckCircle2,
  CircleX,
  Copy,
  Home,
  ReceiptText,
  Ticket,
} from "lucide-react";
import { toast } from "sonner";

type PaymentState = "success" | "cancelled" | "failed" | "pending";

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

const formatLabel = (value: string | null) => {
  if (!value) return "Không có";
  return value;
};

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();

  const payment = useMemo(() => {
    const code = searchParams.get("code") ?? "";
    const cancel = searchParams.get("cancel") ?? "";
    const status = searchParams.get("status") ?? "";
    const orderCode = searchParams.get("orderCode") ?? "";
    const method = searchParams.get("method") ?? "";

    const normalizedStatus = status.toUpperCase();
    const normalizedMethod = method.toUpperCase();
    const isCancelled = cancel === "true";
    const isSuccess =
      normalizedMethod === "VNPAY" ||
      (code === "00" && !isCancelled && normalizedStatus === "PAID");

    let state: PaymentState = "failed";
    if (isSuccess) {
      state = "success";
    } else if (isCancelled) {
      state = "cancelled";
    } else if (!code || normalizedStatus === "PENDING") {
      state = "pending";
    }

    return {
      orderCode,
      method: normalizedMethod || "PAYOS",
      state,
    };
  }, [searchParams]);

  const statusMeta = {
    success: {
      title: "Thanh toán thành công",
      description: "Giao dịch đã được xác nhận. Gói dịch vụ của bạn sẽ được kích hoạt trong giây lát.",
      badge: "Thành công",
      badgeClassName: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
      icon: CheckCircle2,
      cardClassName: "border-emerald-500/20 bg-emerald-500/5",
      accentClassName: "from-emerald-500/30 via-lime-500/10 to-transparent",
    },
    cancelled: {
      title: "Giao dịch đã bị hủy",
      description: "Bạn đã hủy thanh toán. Giao dịch chưa hoàn tất và sẽ không bị tính phí.",
      badge: "Đã hủy",
      badgeClassName: "bg-amber-500/10 text-amber-300 border-amber-500/20",
      icon: CircleX,
      cardClassName: "border-amber-500/20 bg-amber-500/5",
      accentClassName: "from-amber-500/30 via-orange-500/10 to-transparent",
    },
    pending: {
      title: "Thanh toán đang xử lý",
      description: "Giao dịch đang được xác nhận. Vui lòng chờ trong ít phút trước khi thử lại.",
      badge: "Đang xử lý",
      badgeClassName: "bg-sky-500/10 text-sky-300 border-sky-500/20",
      icon: ReceiptText,
      cardClassName: "border-sky-500/20 bg-sky-500/5",
      accentClassName: "from-sky-500/30 via-cyan-500/10 to-transparent",
    },
    failed: {
      title: "Thanh toán không thành công",
      description: "Giao dịch chưa được hoàn tất. Bạn có thể thử lại hoặc chọn phương thức thanh toán khác.",
      badge: "Thất bại",
      badgeClassName: "bg-rose-500/10 text-rose-300 border-rose-500/20",
      icon: Ticket,
      cardClassName: "border-rose-500/20 bg-rose-500/5",
      accentClassName: "from-rose-500/30 via-red-500/10 to-transparent",
    },
  } as const;

  const meta = statusMeta[payment.state];
  const StatusIcon = meta.icon;

  const statusIconClassName =
    payment.state === "success"
      ? "text-emerald-400"
      : payment.state === "cancelled"
        ? "text-amber-400"
        : payment.state === "pending"
          ? "text-sky-400"
          : "text-rose-400";

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
              <div className="space-y-2">
                <Badge className={meta.badgeClassName}>{meta.badge}</Badge>
                <div className="flex items-center gap-3">
                  <StatusIcon className={`h-8 w-8 ${statusIconClassName}`} />
                  <div>
                    <h1 className="text-2xl font-bold text-white">{meta.title}</h1>
                    <p className="mt-1 text-sm text-slate-300">{meta.description}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-lg border border-slate-800 bg-zinc-900 p-4">
                <p className="text-sm text-slate-400">Cong thanh toan</p>
                <p className="mt-2 font-semibold text-white">{formatLabel(payment.method)}</p>
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
                <p className="mt-2 break-all font-mono text-base text-white">{formatLabel(payment.orderCode)}</p>
              </div>
            </div>

            <div className="mt-6 rounded-lg border border-slate-800 bg-zinc-900 p-4 text-sm text-slate-300">
              <p className="font-medium text-white">Cần hỗ trợ?</p>
              <p className="mt-1">
                Nếu gói chưa được kích hoạt sau vài phút, vui lòng liên hệ hỗ trợ kèm mã đơn hàng.
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button variant="outline" asChild className="border-slate-700 bg-transparent text-white hover:bg-slate-800">
                <Link href="/pricing">Xem gói dịch vụ</Link>
              </Button>
              <Button asChild className="bg-primary text-white hover:bg-primary/90">
                <Link href="/account/subscription">Đi tới quản lý gói</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
