"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { subscriptionService } from "@/services/subscription.service";
import { toast } from "sonner";
import { RotateCcw, Loader2 } from "lucide-react";

export function RefundRequestModal() {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [banks, setBanks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasExistingRequest, setHasExistingRequest] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    fetch('https://api.vietqr.io/v2/banks')
      .then(res => res.json())
      .then(data => {
        if (data.code === '00') {
          setBanks(data.data);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const checkExistingRequest = async () => {
      try {
        const response = await subscriptionService.getRefundRequests();
        const activeRequests = response.data?.filter(
          (req: any) => req.status === "PENDING" || req.status === "APPROVED"
        );
        if (activeRequests && activeRequests.length > 0) {
          setHasExistingRequest(true);
        }
      } catch (error) {
        console.error("Failed to check refund requests:", error);
      } finally {
        setIsChecking(false);
      }
    };
    checkExistingRequest();
  }, []);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const response = await subscriptionService.requestRefund({
        reason: reason.trim() || undefined,
        bank_name: bankName || undefined,
        account_number: accountNumber.trim() || undefined,
      });
      toast.success(response.message || "Đã gửi yêu cầu hoàn tiền thành công!");
      setIsSuccess(true);
      setOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Không thể gửi yêu cầu hoàn tiền");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className={`h-8 text-xs bg-transparent border-red-700 text-red-400 hover:bg-red-950/30 hover:text-red-300 w-full sm:w-auto px-3 disabled:opacity-50 disabled:cursor-not-allowed`}
          disabled={isSuccess || hasExistingRequest || isChecking}
        >
          {isChecking ? (
            <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
          ) : (
            <RotateCcw className="mr-1.5 h-3 w-3" />
          )}
          {hasExistingRequest ? "Đã yêu cầu hoàn tiền" : "Yêu cầu hoàn tiền"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-[#1e1e1e] border-slate-800 text-slate-200">
        <DialogHeader>
          <DialogTitle className="text-white">Yêu cầu hoàn tiền</DialogTitle>
          <DialogDescription className="text-slate-400">
            Bạn có thể gửi yêu cầu hoàn tiền trong vòng 7 ngày kể từ khi đăng ký, nếu chưa sử dụng tính năng Premium (tải offline, tạo watch party).
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-300">
              Ngân hàng nhận tiền hoàn
            </label>
            <Select value={bankName} onValueChange={setBankName} disabled={isLoading}>
              <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                <SelectValue placeholder="Chọn ngân hàng" />
              </SelectTrigger>
              <SelectContent className="max-h-[250px] bg-slate-900 border-slate-700 text-white">
                {banks.map((bank) => (
                  <SelectItem key={bank.id} value={bank.shortName} className="hover:bg-slate-800 focus:bg-slate-800">
                    {bank.shortName} - {bank.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex flex-col gap-2">
            <label htmlFor="accountNumber" className="text-sm font-medium text-slate-300">
              Số tài khoản
            </label>
            <Input
              id="accountNumber"
              placeholder="Nhập số tài khoản nhận tiền..."
              className="col-span-3 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="reason" className="text-sm font-medium text-slate-300">
              Lý do (Tùy chọn)
            </label>
            <Textarea
              id="reason"
              placeholder="Ví dụ: Mua nhầm gói, chưa sử dụng tính năng premium..."
              className="col-span-3 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
              maxLength={500}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={isLoading}
            />
            <span className="text-xs text-slate-500 text-right">
              {reason.length}/500
            </span>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => setOpen(false)}
            disabled={isLoading}
            className="text-slate-300 hover:text-white hover:bg-slate-800"
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Vui lòng chờ...
              </>
            ) : (
              "Gửi yêu cầu"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
