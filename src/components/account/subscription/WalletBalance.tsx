"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wallet, Plus, RefreshCw, Smartphone, CreditCard } from "lucide-react";
import { toast } from "sonner"; // Assuming sonner is used for toasts based on previous code

interface WalletBalanceProps {
  balance: number;
}

const TOPUP_OPTIONS = [50000, 100000, 200000, 500000];

export default function WalletBalance({ balance: initialBalance }: WalletBalanceProps) {
  const [balance, setBalance] = useState(initialBalance);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number>(100000);
  const [isProcessing, setIsProcessing] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
  };

  const handleTopUp = () => {
    setIsProcessing(true);
    // Simulate API call
    setTimeout(() => {
      setBalance(prev => prev + selectedAmount);
      setIsProcessing(false);
      setIsTopUpOpen(false);
      toast.success(`Nạp thành công ${formatCurrency(selectedAmount)} vào ví!`);
    }, 1500);
  };

  return (
    <Card className="bg-[#1e1e1e] border-slate-800 mb-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <Wallet className="w-32 h-32 text-emerald-500" />
      </div>

      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <Wallet className="h-5 w-5 text-emerald-500" />
              </div>
              Số dư ví Movix
            </CardTitle>
            
            <Dialog open={isTopUpOpen} onOpenChange={setIsTopUpOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 text-xs font-semibold shadow-lg shadow-emerald-900/20">
                  <Plus className="mr-1 h-3 w-3" /> Nạp tiền
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#1e1e1e] border-slate-800 text-white sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Nạp tiền vào ví</DialogTitle>
                  <DialogDescription className="text-slate-400">
                    Chọn mệnh giá để nạp vào tài khoản. Số dư dùng để gia hạn tự động.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid grid-cols-2 gap-3 py-4">
                  {TOPUP_OPTIONS.map((amount) => (
                    <Button
                      key={amount}
                      variant="outline"
                      className={`h-14 text-sm font-semibold border-slate-700 hover:bg-slate-800 hover:text-white transition-all
                        ${selectedAmount === amount ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500' : 'text-slate-300'}
                      `}
                      onClick={() => setSelectedAmount(amount)}
                    >
                      {formatCurrency(amount)}
                    </Button>
                  ))}
                </div>

                <div className="space-y-4">
                    <Label className="text-xs text-slate-400">Cổng thanh toán</Label>
                    <div className="flex gap-2">
                        <Button variant="ghost" className="flex-1 justify-center border border-slate-700 bg-slate-800/50 h-10 hover:bg-slate-700">
                            <span className="text-xs font-semibold text-blue-400">VNPAY / Banking</span>
                        </Button>
                        <Button variant="ghost" className="flex-1 justify-center border border-slate-700 bg-slate-800/50 h-10 hover:bg-slate-700">
                             <span className="text-xs font-semibold text-pink-500">MoMo QR</span>
                        </Button>
                    </div>
                </div>

                <DialogFooter className="mt-4">
                  <Button 
                    onClick={handleTopUp} 
                    disabled={isProcessing}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                  >
                    {isProcessing ? "Đang tạo giao dịch..." : `Nạp ${formatCurrency(selectedAmount)}`}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
        </div>
        <CardDescription className="text-xs text-slate-400 mt-1">
          Số dư khả dụng để thanh toán dịch vụ.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="mt-2 mb-4">
          <span className="text-3xl font-bold text-white tracking-tight font-mono">
            {formatCurrency(balance)}
          </span>
        </div>
        
        <div className="flex items-start gap-3 p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
           <RefreshCw className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
           <div>
             <p className="text-xs font-medium text-emerald-400">Tự động gia hạn: BẬT</p>
             <p className="text-[10px] text-emerald-500/70 mt-0.5">
               Gói cước sẽ tự động trừ tiền từ ví vào ngày hết hạn.
             </p>
           </div>
        </div>
      </CardContent>
    </Card>
  );
}