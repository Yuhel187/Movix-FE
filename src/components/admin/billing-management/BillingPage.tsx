"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Filter,
  Download,
  MoreVertical,
  CheckCircle,
  XCircle,
  RefreshCcw,
  CreditCard,
  DollarSign,
  Calendar as CalendarIcon,
  ArrowUpRight,
  ArrowDownLeft,
  FileText
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

// --- TYPES ---
type TransactionStatus = "SUCCESS" | "PENDING" | "FAILED" | "REFUNDED";
type PaymentMethod = "MOMO" | "ZALOPAY" | "CREDIT_CARD" | "BANK_TRANSFER" | "PAYPAL";

interface Transaction {
  id: string;
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  plan: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: TransactionStatus;
  date: string; // ISO string
  transactionCode: string;
}

// --- MOCK DATA ---
const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "TRX-001",
    user: { name: "Nguyễn Văn A", email: "nguyenvana@gmail.com", avatar: "https://github.com/shadcn.png" },
    plan: "Movix Ultimate (1 Năm)",
    amount: 1990000,
    currency: "VND",
    method: "MOMO",
    status: "SUCCESS",
    date: "2025-12-15T10:30:00",
    transactionCode: "MOMO123456789"
  },
  {
    id: "TRX-002",
    user: { name: "Trần Thị B", email: "tranthib@gmail.com" },
    plan: "Movix Plus (1 Tháng)",
    amount: 59000,
    currency: "VND",
    method: "ZALOPAY",
    status: "PENDING",
    date: "2025-12-15T11:15:00",
    transactionCode: "ZALO987654321"
  },
  {
    id: "TRX-003",
    user: { name: "Lê Văn C", email: "levanc@gmail.com" },
    plan: "Movix Plus (1 Tháng)",
    amount: 59000,
    currency: "VND",
    method: "CREDIT_CARD",
    status: "FAILED",
    date: "2025-12-14T09:00:00",
    transactionCode: "VISA456123789"
  },
  {
    id: "TRX-004",
    user: { name: "Phạm Văn D", email: "phamvand@gmail.com" },
    plan: "Movix Ultimate (1 Tháng)",
    amount: 199000,
    currency: "VND",
    method: "BANK_TRANSFER",
    status: "REFUNDED",
    date: "2025-12-13T14:20:00",
    transactionCode: "BIDV789456123"
  },
  {
    id: "TRX-005",
    user: { name: "Hoàng Thị F", email: "hoangthif@gmail.com" },
    plan: "Movix Plus (1 Năm)",
    amount: 590000,
    currency: "VND",
    method: "PAYPAL",
    status: "SUCCESS",
    date: "2025-12-16T08:45:00",
    transactionCode: "PAYPAL55667788"
  },
    {
    id: "TRX-006",
    user: { name: "Đặng Văn G", email: "dangvang@gmail.com" },
    plan: "Movix Ultimate (1 Tháng)",
    amount: 199000,
    currency: "VND",
    method: "MOMO",
    status: "PENDING",
    date: "2025-12-16T09:10:00",
    transactionCode: "MOMO99887766"
  },
];

export default function BillingPage() {
  const [data, setData] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Refund Dialog State
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [refundReason, setRefundReason] = useState("");

  // Approve Dialog State
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);

  // --- ACTIONS ---

  const handleOpenRefundDialog = (trx: Transaction) => {
    setSelectedTransaction(trx);
    setRefundReason("");
    setIsRefundDialogOpen(true);
  };

  const handleRefund = () => {
    if (selectedTransaction) {
      if (!refundReason) {
        toast.error("Vui lòng nhập lý do hoàn tiền");
        return;
      }
      
      const updatedData = data.map((t) =>
        t.id === selectedTransaction.id ? { ...t, status: "REFUNDED" as TransactionStatus } : t
      );
      setData(updatedData);
      toast.success(`Đã hoàn tiền cho giao dịch ${selectedTransaction.id}`);
      setIsRefundDialogOpen(false);
      setSelectedTransaction(null);
    }
  };

  const handleOpenApproveDialog = (trx: Transaction) => {
    setSelectedTransaction(trx);
    setIsApproveDialogOpen(true);
  }

  const handleApprove = () => {
     if (selectedTransaction) {
      const updatedData = data.map((t) =>
        t.id === selectedTransaction.id ? { ...t, status: "SUCCESS" as TransactionStatus } : t
      );
      setData(updatedData);
      toast.success(`Đã duyệt giao dịch ${selectedTransaction.id} thủ công`);
      setIsApproveDialogOpen(false);
      setSelectedTransaction(null);
    }
  }

  // --- HELPERS ---

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getStatusBadge = (status: TransactionStatus) => {
    switch (status) {
      case "SUCCESS":
        return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20">Thành công</Badge>;
      case "PENDING":
        return <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border-yellow-500/20">Chờ xử lý</Badge>;
      case "FAILED":
        return <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20">Thất bại</Badge>;
      case "REFUNDED":
        return <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20">Đã hoàn tiền</Badge>;
      default:
        return <Badge variant="outline">Không xác định</Badge>;
    }
  };

  const getMethodIcon = (method: PaymentMethod) => {
      switch (method) {
          case "MOMO": return <div className="font-bold text-[#A50064]">MoMo</div>
          case "ZALOPAY": return <div className="font-bold text-[#0068FF]">ZaloPay</div>
          case "CREDIT_CARD": return <div className="flex items-center gap-1"><CreditCard className="w-3 h-3"/> Thẻ</div>
          case "BANK_TRANSFER": return <div className="text-xs">Chuyển khoản</div>
          default: return method;
      }
  }

  // Stats
  const totalRevenue = data
    .filter(t => t.status === "SUCCESS")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const pendingCount = data.filter(t => t.status === "PENDING").length;
  const refundCount = data.filter(t => t.status === "REFUNDED").length;

  // Filtered data
  const filteredData = data.filter((item) => {
    const matchesSearch = 
        item.transactionCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.user.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "ALL" || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pt-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
            Quản lý Giao Dịch
          </h1>
          <p className="text-slate-400">
            Theo dõi doanh thu, lịch sử thanh toán và xử lý hoàn tiền.
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
            <Download className="mr-2 h-4 w-4" />
            Xuất Báo Cáo
        </Button>
      </div>

      {/* --- STATS CARDS --- */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-[#1e1e1e] border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-200">Tổng doanh thu</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-slate-500 flex items-center mt-1">
                <ArrowUpRight className="h-3 w-3 mr-1 text-green-500" /> +20.1% so với tháng trước
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-[#1e1e1e] border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-200">Giao dịch chờ duyệt</CardTitle>
            <RefreshCcw className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{pendingCount}</div>
            <p className="text-xs text-slate-500 mt-1">Yêu cầu xử lý thủ công</p>
          </CardContent>
        </Card>

        <Card className="bg-[#1e1e1e] border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-200">Đã hoàn tiền</CardTitle>
            <ArrowDownLeft className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{refundCount}</div>
            <p className="text-xs text-slate-500 mt-1">Trong tháng này</p>
          </CardContent>
        </Card>
      </div>

      {/* --- FILTERS & TABLE --- */}
      <Card className="bg-[#1e1e1e] border-slate-800">
        <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <CardTitle className="text-xl">Lịch sử giao dịch</CardTitle>
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                        <Input
                            placeholder="Tìm theo Mã GD, Email, Tên..."
                            className="pl-9 bg-[#262626] border-slate-700"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                         <SelectTrigger className="w-full sm:w-[150px] bg-[#262626] border-slate-700 text-white">
                             <div className="flex items-center">
                                 <Filter className="mr-2 h-4 w-4 text-slate-400" />
                                 <SelectValue placeholder="Trạng thái" />
                             </div>
                         </SelectTrigger>
                         <SelectContent className="bg-[#262626] border-slate-700 text-white">
                             <SelectItem value="ALL">Tất cả</SelectItem>
                             <SelectItem value="SUCCESS">Thành công</SelectItem>
                             <SelectItem value="PENDING">Chờ xử lý</SelectItem>
                             <SelectItem value="FAILED">Thất bại</SelectItem>
                             <SelectItem value="REFUNDED">Đã hoàn tiền</SelectItem>
                         </SelectContent>
                    </Select>
                </div>
            </div>
        </CardHeader>
        <CardContent>
             <div className="rounded-md border border-slate-700 overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-900">
                        <TableRow className="border-slate-800 hover:bg-slate-900">
                            <TableHead className="text-slate-400">Mã Giao Dịch</TableHead>
                            <TableHead className="text-slate-400">Người dùng</TableHead>
                            <TableHead className="text-slate-400">Gói Dịch Vụ</TableHead>
                            <TableHead className="text-slate-400">Số tiền</TableHead>
                            <TableHead className="text-slate-400">Thanh toán qua</TableHead>
                            <TableHead className="text-slate-400">Ngày giờ</TableHead>
                            <TableHead className="text-slate-400">Trạng thái</TableHead>
                            <TableHead className="text-right text-slate-400">Hành động</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredData.length > 0 ? (
                            filteredData.map((trx) => (
                                <TableRow key={trx.id} className="border-slate-800 hover:bg-slate-800/50">
                                    <TableCell className="font-medium text-slate-300">
                                        <div className="flex items-center gap-1">
                                            <FileText className="w-3 h-3 text-slate-500" />
                                            {trx.transactionCode}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={trx.user.avatar} />
                                                <AvatarFallback className="bg-slate-700 text-xs">
                                                    {trx.user.name.slice(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-white">{trx.user.name}</span>
                                                <span className="text-xs text-slate-400">{trx.user.email}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-slate-300 text-sm">{trx.plan}</TableCell>
                                    <TableCell className="font-semibold text-white">{formatCurrency(trx.amount)}</TableCell>
                                    <TableCell className="text-slate-300 text-sm">{getMethodIcon(trx.method)}</TableCell>
                                    <TableCell className="text-slate-400 text-sm">
                                        {format(new Date(trx.date), "dd/MM/yyyy HH:mm", { locale: vi })}
                                    </TableCell>
                                    <TableCell>{getStatusBadge(trx.status)}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-white">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="bg-[#1e1e1e] border-slate-700 text-white">
                                                <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                                                <DropdownMenuItem className="cursor-pointer hover:bg-slate-800">
                                                    Xem chi tiết
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="bg-slate-700" />
                                                {trx.status === "PENDING" && (
                                                    <DropdownMenuItem 
                                                        className="text-green-500 hover:text-green-400 hover:bg-green-500/10 cursor-pointer"
                                                        onClick={() => handleOpenApproveDialog(trx)}
                                                    >
                                                        <CheckCircle className="mr-2 h-4 w-4" /> Duyệt thủ công
                                                    </DropdownMenuItem>
                                                )}
                                                {trx.status === "SUCCESS" && (
                                                    <DropdownMenuItem 
                                                        className="text-red-500 hover:text-red-400 hover:bg-red-500/10 cursor-pointer"
                                                        onClick={() => handleOpenRefundDialog(trx)}
                                                    >
                                                        <RefreshCcw className="mr-2 h-4 w-4" /> Hoàn tiền (Refund)
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={8} className="h-24 text-center text-slate-500">
                                    Không tìm thấy giao dịch nào.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
             </div>
        </CardContent>
      </Card>

      {/* --- REFUND DIALOG --- */}
      <Dialog open={isRefundDialogOpen} onOpenChange={setIsRefundDialogOpen}>
        <DialogContent className="bg-[#1e1e1e] border-slate-800 text-white">
            <DialogHeader>
                <DialogTitle>Xác nhận hoàn tiền</DialogTitle>
                <DialogDescription className="text-slate-400">
                    Bạn đang thực hiện hoàn tiền cho giao dịch <span className="text-white font-mono font-bold">{selectedTransaction?.transactionCode}</span>.
                    Hành động này sẽ hoàn trả <span className="text-green-500 font-bold">{selectedTransaction && formatCurrency(selectedTransaction.amount)}</span> về phương thức thanh toán gốc.
                </DialogDescription>
            </DialogHeader>

             <div className="grid gap-4 py-4">
                 <div className="space-y-2">
                     <div className="text-sm font-medium">Chi tiết hoàn tiền</div>
                     <div className="rounded-md bg-slate-900 p-3 space-y-1 text-sm border border-slate-800">
                         <div className="flex justify-between">
                             <span className="text-slate-400">Khách hàng:</span>
                             <span>{selectedTransaction?.user.name}</span>
                         </div>
                         <div className="flex justify-between">
                             <span className="text-slate-400">Số tiền:</span>
                             <span>{selectedTransaction && formatCurrency(selectedTransaction.amount)}</span>
                         </div>
                         <div className="flex justify-between">
                             <span className="text-slate-400">Phương thức:</span>
                             <span>{selectedTransaction?.method}</span>
                         </div>
                     </div>
                 </div>
                 <div className="space-y-2">
                     <div className="text-sm font-medium after:content-['*'] after:ml-0.5 after:text-red-500">Lý do hoàn tiền</div>
                     <Textarea 
                        placeholder="Nhập lý do hoàn tiền (VD: Khách hàng yêu cầu, Lỗi hệ thống...)"
                        className="bg-[#262626] border-slate-700 resize-none h-24"
                        value={refundReason}
                        onChange={(e) => setRefundReason(e.target.value)}
                     />
                 </div>
             </div>

            <DialogFooter>
                <Button variant="ghost" onClick={() => setIsRefundDialogOpen(false)} className="hover:bg-slate-800 text-slate-300">
                    Hủy bỏ
                </Button>
                <Button variant="destructive" onClick={handleRefund} className="bg-red-600 hover:bg-red-700">
                    <RefreshCcw className="mr-2 h-4 w-4" /> Xác nhận Hoàn tiền
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- APPROVE DIALOG --- */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent className="bg-[#1e1e1e] border-slate-800 text-white">
             <DialogHeader>
                <DialogTitle>Duyệt giao dịch thủ công</DialogTitle>
                <DialogDescription className="text-slate-400">
                    Xác nhận rằng bạn đã kiểm tra và nhận được khoản thanh toán cho giao dịch <span className="text-white font-mono font-bold">{selectedTransaction?.transactionCode}</span>.
                </DialogDescription>
            </DialogHeader>
            <div className="py-2">
                <div className="rounded-md bg-slate-900 p-4 border border-slate-800 flex items-center gap-4">
                     <div className="bg-yellow-500/10 p-2 rounded-full">
                         <RefreshCcw className="h-6 w-6 text-yellow-500" />
                     </div>
                     <div>
                         <p className="font-semibold text-white">Cảnh báo tác vụ</p>
                         <p className="text-xs text-slate-400 mt-1">Hành động này sẽ kích hoạt gói dịch vụ cho người dùng ngay lập tức.</p>
                     </div>
                </div>
            </div>
            <DialogFooter>
                <Button variant="ghost" onClick={() => setIsApproveDialogOpen(false)} className="hover:bg-slate-800 text-slate-300">
                    Hủy bỏ
                </Button>
                <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700 text-white">
                    <CheckCircle className="mr-2 h-4 w-4" /> Duyệt Giao Dịch
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}