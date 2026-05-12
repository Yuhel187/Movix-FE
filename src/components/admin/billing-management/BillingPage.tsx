"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  Filter,
  Download,
  MoreVertical,
  CheckCircle,
  RefreshCcw,
  DollarSign,
  ArrowDownLeft,
  FileText,
  Eye,
  User as UserIcon,
  CreditCard as PaymentIcon,
  ChevronLeft,
  ChevronRight,
  Printer,
  Database,
  Copy,
  FileQuestion,
  Undo2,
  XCircle
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
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import apiClient from "@/lib/apiClient";

// --- TYPES ---
type TransactionStatus = "COMPLETED" | "PENDING" | "FAILED" | "REFUNDED";

interface Transaction {
  id: string;
  user: {
    id: string;
    display_name: string;
    email: string;
    username: string;
    avatar_url?: string;
  };
  plan: {
    id: string;
    name: string;
    price: number;
    duration_days: number;
  };
  amount: number;
  currency: string;
  payment_method: string;
  transaction_ref: string;
  status: TransactionStatus;
  created_at: string;
  metadata?: any;
}

interface DashboardStats {
  revenue: number;
  pending: number;
  refunded: number;
}

interface RefundRequest {
  id: string;
  user: {
    id: string;
    display_name: string;
    email: string;
    username?: string;
    avatar_url?: string;
  };
  transaction: {
    id: string;
    transaction_ref: string;
    amount: number;
    status: TransactionStatus;
    created_at: string;
  };
  reason: string | null;
  bank_name?: string;
  account_number?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  created_at: string;
  updated_at: string;
}

export default function BillingPage() {
  const [data, setData] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<DashboardStats>({ revenue: 0, pending: 0, refunded: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 15;

  // Detail Modal State
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // Approve Dialog State
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);

  // Refund State
  const [refundData, setRefundData] = useState<RefundRequest[]>([]);
  const [refundLoading, setRefundLoading] = useState(true);
  const [refundStatusFilter, setRefundStatusFilter] = useState("ALL");
  const [refundCurrentPage, setRefundCurrentPage] = useState(1);
  const [refundTotalPages, setRefundTotalPages] = useState(1);
  
  const [isCreateRefundOpen, setIsCreateRefundOpen] = useState(false);
  const [refundReason, setRefundReason] = useState("");
  
  const [isProcessRefundOpen, setIsProcessRefundOpen] = useState(false);
  const [selectedRefund, setSelectedRefund] = useState<RefundRequest | null>(null);
  const [processAction, setProcessAction] = useState<"APPROVE" | "REJECT">("APPROVE");

  const [isRefundDetailOpen, setIsRefundDetailOpen] = useState(false);
  const [selectedRefundDetail, setSelectedRefundDetail] = useState<RefundRequest | null>(null);

  // --- FETCH DATA ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [trxRes, statsRes] = await Promise.all([
        apiClient.get(`/admin/transactions/get-all?page=${currentPage}&take=${itemsPerPage}&q=${searchTerm}&status=${statusFilter}`),
        apiClient.get("/admin/transactions/get-stats")
      ]);
      
      setData(trxRes.data.data || []);
      setTotalPages(trxRes.data.meta?.lastPages || 1);
      setStats(statsRes.data || { revenue: 0, pending: 0, refunded: 0 });
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Không thể tải dữ liệu giao dịch");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, currentPage]);

  useEffect(() => {
    const timer = setTimeout(() => {
        fetchData();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchData]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const fetchRefunds = useCallback(async () => {
    setRefundLoading(true);
    try {
      const res = await apiClient.get(`/admin/transactions/refunds?page=${refundCurrentPage}&take=${itemsPerPage}&status=${refundStatusFilter}`);
      setRefundData(res.data.data || []);
      setRefundTotalPages(res.data.meta?.lastPages || 1);
    } catch (error) {
      console.error("Fetch refunds error:", error);
      toast.error("Không thể tải yêu cầu hoàn tiền");
    } finally {
      setRefundLoading(false);
    }
  }, [refundCurrentPage, refundStatusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
        fetchRefunds();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchRefunds]);
  
  useEffect(() => {
    setRefundCurrentPage(1);
  }, [refundStatusFilter]);


  // --- ACTIONS ---

  const handleOpenDetail = (trx: Transaction) => {
    console.log(">>> [Frontend] Opening Detail for Transaction:", trx);
    setSelectedTransaction(trx);
    setIsDetailOpen(true);
  };

  const handleOpenApproveDialog = (trx: Transaction) => {
    setSelectedTransaction(trx);
    setIsApproveDialogOpen(true);
  }

  const handleApprove = async () => {
     if (selectedTransaction) {
       try {
         await apiClient.patch(`/admin/transactions/update-status/${selectedTransaction.id}`, {
            status: "COMPLETED"
         });
         toast.success(`Đã duyệt giao dịch ${selectedTransaction.transaction_ref} thành công`);
         setIsApproveDialogOpen(false);
         fetchData();
         } catch (error) {
           toast.error("Lỗi khi duyệt giao dịch");
         }
      }
    }

  const handleOpenCreateRefund = (trx: Transaction) => {
    setSelectedTransaction(trx);
    setRefundReason("");
    setIsCreateRefundOpen(true);
  };

  const handleCreateRefund = async () => {
    if (selectedTransaction) {
        try {
            await apiClient.post("/admin/transactions/refunds", {
                transactionId: selectedTransaction.id,
                reason: refundReason
            });
            toast.success("Tạo yêu cầu hoàn tiền thành công");
            setIsCreateRefundOpen(false);
            fetchRefunds();
        } catch(error: any) {
            toast.error(error.response?.data?.message || "Lỗi tạo yêu cầu hoàn tiền");
        }
    }
  };

  const handleOpenProcessRefund = (refund: RefundRequest, action: "APPROVE" | "REJECT") => {
    setSelectedRefund(refund);
    setProcessAction(action);
    setIsProcessRefundOpen(true);
  };

  const handleProcessRefund = async () => {
    if (selectedRefund) {
        try {
            await apiClient.patch(`/admin/transactions/refunds/${selectedRefund.id}/process`, {
                action: processAction
            });
            toast.success(`Đã ${processAction === "APPROVE" ? "chấp nhận" : "từ chối"} yêu cầu hoàn tiền`);
            setIsProcessRefundOpen(false);
            if (isRefundDetailOpen) setIsRefundDetailOpen(false);
            fetchRefunds();
            fetchData();
        } catch(error: any) {
            toast.error(error.response?.data?.message || "Lỗi xử lý yêu cầu hoàn tiền");
        }
    }
  };

  const handleOpenRefundDetail = (refund: RefundRequest) => {
    setSelectedRefundDetail(refund);
    setIsRefundDetailOpen(true);
  };

  const handleExportPDF = async () => {
    const toastId = toast.loading("Đang tải dữ liệu toàn bộ báo cáo...");
    try {
        const response = await apiClient.get(`/admin/transactions/get-all?page=1&take=2000&q=${searchTerm}&status=${statusFilter}`);
        const allData: Transaction[] = response.data.data || [];

        if (allData.length === 0) {
            toast.error("Không có dữ liệu để xuất báo cáo", { id: toastId });
            return;
        }

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            toast.error("Vui lòng cho phép mở cửa sổ mới để in báo cáo", { id: toastId });
            return;
        }

        toast.success("Đang chuẩn bị bản in...", { id: toastId });

        const getStatusText = (status: TransactionStatus) => {
            switch (status) {
                case 'COMPLETED': return 'THÀNH CÔNG';
                case 'PENDING': return 'CHỜ XỬ LÝ';
                case 'FAILED': return 'THẤT BẠI';
                case 'REFUNDED': return 'ĐÃ HOÀN TIỀN';
                default: return status;
            }
        };

        const rows = allData.map(trx => `
            <tr>
                <td style="border: 1px solid black; padding: 8px; font-family: monospace; font-size: 10px;">${trx.transaction_ref}</td>
                <td style="border: 1px solid black; padding: 8px;">
                    <div style="font-weight: bold;">${trx.user.display_name}</div>
                    <small style="color: #666;">${trx.user.email}</small>
                </td>
                <td style="border: 1px solid black; padding: 8px;">${trx.plan?.name}</td>
                <td style="border: 1px solid black; padding: 8px; text-align: right; font-weight: bold;">${formatCurrency(trx.amount)}</td>
                <td style="border: 1px solid black; padding: 8px; text-align: center;">${format(new Date(trx.created_at), "dd/MM/yyyy")}</td>
                <td style="border: 1px solid black; padding: 8px; text-align: center; font-weight: bold;">${getStatusText(trx.status)}</td>
            </tr>
        `).join('');

        printWindow.document.write(`
            <html>
                <head>
                    <title>Báo cáo giao dịch Movix</title>
                    <style>
                        body { font-family: sans-serif; padding: 20px; }
                        .header { text-align: center; border-bottom: 2px solid black; padding-bottom: 20px; margin-bottom: 30px; }
                        .stats { display: flex; justify-content: space-around; margin-bottom: 40px; }
                        .stat-box { border: 1px solid black; padding: 15px; text-align: center; border-radius: 8px; width: 30%; }
                        table { width: 100%; border-collapse: collapse; font-size: 11px; }
                        th { background: #f0f0f0; }
                        .footer { margin-top: 50px; display: flex; justify-content: space-between; padding: 0 50px; }
                        @media print { .no-print { display: none; } }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1 style="text-transform: uppercase; margin: 0;">Báo cáo doanh thu giao dịch Movix</h1>
                        <p>Ngày xuất: ${format(new Date(), "dd/MM/yyyy HH:mm")}</p>
                        <p style="font-size: 12px;">Bộ lọc: ${statusFilter === 'ALL' ? 'Tất cả trạng thái' : getStatusText(statusFilter as any)} | Tìm kiếm: "${searchTerm || 'Không'}"</p>
                    </div>
                    <div class="stats">
                        <div class="stat-box">
                            <p style="font-size: 9px; font-weight: bold; color: #666; margin: 0;">TỔNG DOANH THU</p>
                            <h2 style="color: green; margin: 5px 0;">${formatCurrency(stats.revenue)}</h2>
                        </div>
                        <div class="stat-box">
                            <p style="font-size: 9px; font-weight: bold; color: #666; margin: 0;">CHỜ DUYỆT</p>
                            <h2 style="margin: 5px 0;">${stats.pending}</h2>
                        </div>
                        <div class="stat-box">
                            <p style="font-size: 9px; font-weight: bold; color: #666; margin: 0;">ĐÃ HOÀN TIỀN</p>
                            <h2 style="color: red; margin: 5px 0;">${stats.refunded}</h2>
                        </div>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th style="border: 1px solid black; padding: 10px;">Mã Tham Chiếu</th>
                                <th style="border: 1px solid black; padding: 10px;">Khách hàng</th>
                                <th style="border: 1px solid black; padding: 10px;">Gói dịch vụ</th>
                                <th style="border: 1px solid black; padding: 10px;">Số tiền</th>
                                <th style="border: 1px solid black; padding: 10px;">Ngày</th>
                                <th style="border: 1px solid black; padding: 10px;">Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody>${rows}</tbody>
                    </table>
                    <div class="footer">
                        <div style="text-align: center;"><p><strong>Người lập báo cáo</strong></p><br/><br/><p>(Ký tên)</p></div>
                        <div style="text-align: center;"><p><strong>Quản trị viên</strong></p><br/><br/><p>(Ký và đóng dấu)</p></div>
                    </div>
                    <script>
                        window.onload = function() { window.print(); window.close(); }
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    } catch (error) {
        console.error("Export error:", error);
        toast.error("Lỗi khi tải dữ liệu xuất báo cáo", { id: toastId });
    }
  };

  const handlePrintReceipt = (trx: Transaction) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        toast.error("Vui lòng cho phép mở cửa sổ mới để in biên lai");
        return;
    }

    printWindow.document.write(`
        <html>
            <head>
                <title>Biên lai giao dịch - ${trx.transaction_ref}</title>
                <style>
                    body { font-family: sans-serif; padding: 30px; color: #333; }
                    .container { border: 2px solid #000; padding: 30px; border-radius: 12px; max-width: 600px; margin: 0 auto; }
                    .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 20px; }
                    .row { display: flex; justify-content: space-between; margin-bottom: 15px; border-bottom: 1px dashed #ddd; padding-bottom: 8px; }
                    .label { color: #666; font-size: 13px; font-weight: bold; }
                    .value { font-weight: bold; text-align: right; }
                    .amount { font-size: 24px; color: #000; }
                    .footer { margin-top: 40px; text-align: center; font-style: italic; font-size: 12px; color: #888; }
                    h1 { margin: 0; font-size: 22px; text-transform: uppercase; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Biên lai thanh toán Movix</h1>
                        <p style="margin: 5px 0; font-size: 12px;">Mã hệ thống: ${trx.id}</p>
                    </div>
                    <div class="row">
                        <span class="label">Mã tham chiếu:</span>
                        <span class="value" style="font-family: monospace;">${trx.transaction_ref || 'N/A'}</span>
                    </div>
                    <div class="row">
                        <span class="label">Khách hàng:</span>
                        <span class="value">${trx.user.display_name}</span>
                    </div>
                    <div class="row">
                        <span class="label">Email:</span>
                        <span class="value">${trx.user.email}</span>
                    </div>
                    <div class="row">
                        <span class="label">Gói dịch vụ:</span>
                        <span class="value">${trx.plan?.name}</span>
                    </div>
                    <div class="row">
                        <span class="label">Số tiền thanh toán:</span>
                        <span class="value amount">${formatCurrency(trx.amount)}</span>
                    </div>
                    <div class="row">
                        <span class="label">Phương thức:</span>
                        <span class="value">${trx.payment_method.toUpperCase()}</span>
                    </div>
                    
                    ${trx.metadata?.reference ? `
                    <div class="row">
                        <span class="label">Mã tham chiếu Bank:</span>
                        <span class="value" style="font-family: monospace; color: #003580;">${trx.metadata.reference}</span>
                    </div>
                    ` : ''}

                    ${trx.metadata?.counterAccountNumber ? `
                    <div class="row">
                        <span class="label">Tài khoản thanh toán:</span>
                        <span class="value">${trx.metadata.counterAccountName || ''} (${trx.metadata.counterAccountNumber})</span>
                    </div>
                    <div class="row">
                        <span class="label">Ngân hàng khách:</span>
                        <span class="value">${trx.metadata.counterAccountBankName || 'N/A'}</span>
                    </div>
                    ` : ''}

                    <div class="row">
                        <span class="label">Thời gian:</span>
                        <span class="value">${format(new Date(trx.created_at), "dd/MM/yyyy HH:mm:ss")}</span>
                    </div>
                    <div class="row">
                        <span class="label">Trạng thái:</span>
                        <span class="value" style="color: green;">${getStatusText(trx.status)}</span>
                    </div>
                    <div class="footer">
                        <p>Cảm ơn bạn đã sử dụng dịch vụ xem phim tại Movix!</p>
                        <p>Biên lai này có giá trị xác nhận giao dịch thành công trên hệ thống.</p>
                    </div>
                </div>
                <script>
                    window.onload = function() { window.print(); window.close(); }
                </script>
            </body>
        </html>
    `);
    printWindow.document.close();
  };

  // --- HELPERS ---

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getStatusText = (status: TransactionStatus) => {
    switch (status) {
        case 'COMPLETED': return 'THÀNH CÔNG';
        case 'PENDING': return 'CHỜ XỬ LÝ';
        case 'FAILED': return 'THẤT BẠI';
        case 'REFUNDED': return 'ĐÃ HOÀN TIỀN';
        default: return status;
    }
  };

  const getStatusBadge = (status: TransactionStatus) => {
    switch (status) {
      case "COMPLETED":
        return <Badge className="bg-green-500 text-black border-none font-bold">Thành công</Badge>;
      case "PENDING":
        return <Badge className="bg-yellow-400 text-black border-none font-bold">Chờ xử lý</Badge>;
      case "FAILED":
        return <Badge className="bg-red-500 text-white border-none">Thất bại</Badge>;
      case "REFUNDED":
        return <Badge className="bg-blue-500 text-white border-none">Đã hoàn</Badge>;
      default:
        return <Badge variant="outline">N/A</Badge>;
    }
  };

  const getMethodBadge = (method: string) => {
      const lowerMethod = method.toLowerCase();
      if (lowerMethod.includes("momo")) return <Badge className="bg-[#A50064] text-white border-none px-2 text-[10px]">MoMo</Badge>
      if (lowerMethod.includes("zalo")) return <Badge className="bg-[#0068FF] text-white border-none px-2 text-[10px]">ZaloPay</Badge>
      if (lowerMethod.includes("payos")) return <Badge className="bg-[#003580] text-white border-none px-2 font-bold text-[10px]">PayOS</Badge>
      return <Badge variant="outline" className="text-slate-400 text-[10px]">{method}</Badge>;
  }

  return (
    <div className="space-y-6 pt-6 pb-12">
      
      {/* --- UI CONTENT --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2 font-outfit">
            Quản lý Giao Dịch
          </h1>
          <p className="text-slate-400">
            Theo dõi doanh thu, lịch sử thanh toán và quản lý gói dịch vụ của người dùng.
          </p>
        </div>
        <Button onClick={handleExportPDF} className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
            <Download className="mr-2 h-4 w-4" />
            Xuất Báo Cáo PDF
        </Button>
      </div>

      {/* --- STATS CARDS --- */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-[#1e1e1e] border-slate-800 shadow-xl overflow-hidden relative group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-slate-400">Tổng doanh thu</CardTitle>
            <div className="bg-green-500/20 p-2 rounded-lg">
                <DollarSign className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white font-outfit tracking-tight">{formatCurrency(stats.revenue)}</div>
            <p className="text-xs text-slate-500 flex items-center mt-2">
                Doanh thu thực tế đã nhận
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-[#1e1e1e] border-slate-800 shadow-xl overflow-hidden relative group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-slate-400">Giao dịch chờ duyệt</CardTitle>
            <div className="bg-yellow-500/20 p-2 rounded-lg">
                <RefreshCcw className="h-4 w-4 text-yellow-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white font-outfit tracking-tight">{stats.pending}</div>
            <p className="text-xs text-slate-500 mt-2">Cần xác nhận thủ công</p>
          </CardContent>
        </Card>

        <Card className="bg-[#1e1e1e] border-slate-800 shadow-xl overflow-hidden relative group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-slate-400">Đã hoàn tiền</CardTitle>
            <div className="bg-red-500/20 p-2 rounded-lg">
                <ArrowDownLeft className="h-4 w-4 text-red-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white font-outfit tracking-tight">{stats.refunded}</div>
            <p className="text-xs text-slate-500 mt-2">Yêu cầu đã xử lý hoàn</p>
          </CardContent>
        </Card>
      </div>

      {/* --- TABS --- */}
      <Tabs defaultValue="transactions" className="w-full">
        <TabsList className="bg-[#1e1e1e] border-slate-800 mb-6">
          <TabsTrigger value="transactions" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white text-slate-400">
            Lịch sử giao dịch
          </TabsTrigger>
          <TabsTrigger value="refunds" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white text-slate-400">
            Yêu cầu hoàn tiền
          </TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="m-0 focus-visible:outline-none">
          {/* --- FILTERS & TABLE --- */}
          <Card className="bg-[#1e1e1e] border-slate-800 shadow-sm">
            <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <CardTitle className="text-xl">Lịch sử giao dịch</CardTitle>
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                        <Input
                            placeholder="Tìm theo Mã GD, Email, Tên..."
                            className="pl-9 bg-[#262626] border-slate-700 focus:border-primary focus:ring-primary/20 transition-all text-white"
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
                             <SelectItem value="COMPLETED">Thành công</SelectItem>
                             <SelectItem value="PENDING">Chờ xử lý</SelectItem>
                             <SelectItem value="FAILED">Thất bại</SelectItem>
                             <SelectItem value="REFUNDED">Đã hoàn tiền</SelectItem>
                         </SelectContent>
                    </Select>
                </div>
            </div>
        </CardHeader>
        <CardContent className="space-y-4">
             <div className="rounded-lg border border-slate-800 overflow-hidden bg-slate-900/20">
                <Table>
                    <TableHeader className="bg-slate-900/50">
                        <TableRow className="border-slate-800 hover:bg-transparent">
                            <TableHead className="text-slate-400 h-12">Mã Giao Dịch</TableHead>
                            <TableHead className="text-slate-400 h-12">Người dùng</TableHead>
                            <TableHead className="text-slate-400 h-12">Gói Dịch Vụ</TableHead>
                            <TableHead className="text-slate-400 h-12">Số tiền</TableHead>
                            <TableHead className="text-slate-400 h-12">Ngày giờ</TableHead>
                            <TableHead className="text-slate-400 h-12">Trạng thái</TableHead>
                            <TableHead className="text-right text-slate-400 h-12 pr-6">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                             Array.from({ length: 8 }).map((_, i) => (
                                <TableRow key={i} className="border-slate-800 animate-pulse">
                                    <TableCell colSpan={7} className="h-16 bg-slate-800/10" />
                                </TableRow>
                             ))
                        ) : data.length > 0 ? (
                            data.map((trx) => (
                                <TableRow key={trx.id} className="border-slate-800 hover:bg-slate-800/50 transition-colors">
                                    <TableCell className="font-mono text-[10px] text-slate-400 pl-4">
                                        <div className="flex items-center gap-1.5">
                                            <FileText className="w-3.5 h-3.5 text-slate-500" />
                                            {trx.transaction_ref || "N/A"}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3 py-1">
                                            <Avatar className="h-9 w-9 border border-slate-700 shadow-sm">
                                                <AvatarImage src={trx.user.avatar_url} />
                                                <AvatarFallback className="bg-slate-800 text-xs text-white">
                                                    {(trx.user.display_name || trx.user.username || "??").slice(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-sm font-semibold text-slate-200 truncate">{trx.user.display_name || trx.user.username}</span>
                                                <span className="text-[10px] text-slate-500 truncate">{trx.user.email}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-slate-300 text-sm font-medium">{trx.plan?.name || "Gói cũ"}</TableCell>
                                    <TableCell className="font-bold text-white text-sm">{formatCurrency(trx.amount)}</TableCell>
                                    <TableCell className="text-slate-400 text-[11px]">
                                        {format(new Date(trx.created_at), "dd/MM/yy HH:mm", { locale: vi })}
                                    </TableCell>
                                    <TableCell>{getStatusBadge(trx.status)}</TableCell>
                                    <TableCell className="text-right pr-6">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="bg-[#1e1e1e] border-slate-700 text-white shadow-2xl">
                                                <DropdownMenuLabel className="text-xs text-slate-500">Hành động</DropdownMenuLabel>
                                                <DropdownMenuItem 
                                                    className="cursor-pointer hover:bg-slate-800 py-2"
                                                    onClick={() => handleOpenDetail(trx)}
                                                >
                                                    <Eye className="mr-2 h-4 w-4 text-primary" /> Xem chi tiết
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="bg-slate-800" />
                                                {trx.status === "PENDING" && (
                                                    <DropdownMenuItem 
                                                        className="text-green-500 hover:text-green-400 hover:bg-green-500/10 cursor-pointer py-2"
                                                        onClick={() => handleOpenApproveDialog(trx)}
                                                    >
                                                        <CheckCircle className="mr-2 h-4 w-4" /> Duyệt giao dịch
                                                    </DropdownMenuItem>
                                                )}
                                                {(trx.status === "COMPLETED") && (
                                                    <DropdownMenuItem 
                                                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer py-2"
                                                        onClick={() => handleOpenCreateRefund(trx)}
                                                    >
                                                        <Undo2 className="mr-2 h-4 w-4" /> Yêu cầu hoàn tiền
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} className="h-32 text-center text-slate-500">
                                    Không có dữ liệu giao dịch nào.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
             </div>

             {/* --- PAGINATION CONTROLS --- */}
             <div className="flex items-center justify-between py-2">
                <div className="text-xs text-slate-500">
                    Trang {currentPage} / {totalPages}
                </div>
                <div className="flex gap-2">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="bg-slate-900 border-slate-800 text-slate-300 h-8 px-3 hover:bg-slate-800"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft className="w-4 h-4 mr-1" /> Trước
                    </Button>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="bg-slate-900 border-slate-800 text-slate-300 h-8 px-3 hover:bg-slate-800"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                    >
                        Sau <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                </div>
             </div>
        </CardContent>
      </Card>
      </TabsContent>

      <TabsContent value="refunds" className="m-0 focus-visible:outline-none">
          <Card className="bg-[#1e1e1e] border-slate-800 shadow-sm">
            <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <CardTitle className="text-xl">Yêu cầu hoàn tiền</CardTitle>
                    <div className="flex gap-3">
                        <Select value={refundStatusFilter} onValueChange={setRefundStatusFilter}>
                             <SelectTrigger className="w-[150px] bg-[#262626] border-slate-700 text-white">
                                 <div className="flex items-center">
                                     <Filter className="mr-2 h-4 w-4 text-slate-400" />
                                     <SelectValue placeholder="Trạng thái" />
                                 </div>
                             </SelectTrigger>
                             <SelectContent className="bg-[#262626] border-slate-700 text-white">
                                 <SelectItem value="ALL">Tất cả</SelectItem>
                                 <SelectItem value="PENDING">Đang chờ</SelectItem>
                                 <SelectItem value="APPROVED">Đã duyệt</SelectItem>
                                 <SelectItem value="REJECTED">Từ chối</SelectItem>
                             </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="rounded-lg border border-slate-800 overflow-hidden bg-slate-900/20">
                    <Table>
                        <TableHeader className="bg-slate-900/50">
                            <TableRow className="border-slate-800 hover:bg-transparent">
                                <TableHead className="text-slate-400 h-12">Mã Tham Chiếu</TableHead>
                                <TableHead className="text-slate-400 h-12">Người dùng</TableHead>
                                <TableHead className="text-slate-400 h-12">Lý do</TableHead>
                                <TableHead className="text-slate-400 h-12">Số tiền</TableHead>
                                <TableHead className="text-slate-400 h-12">Ngày yêu cầu</TableHead>
                                <TableHead className="text-slate-400 h-12">Trạng thái</TableHead>
                                <TableHead className="text-right text-slate-400 h-12 pr-6">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {refundLoading ? (
                                 <TableRow className="border-slate-800">
                                     <TableCell colSpan={7} className="h-32 text-center text-slate-500">
                                         Đang tải...
                                     </TableCell>
                                 </TableRow>
                            ) : refundData.length > 0 ? (
                                refundData.map((refund) => (
                                    <TableRow key={refund.id} className="border-slate-800 hover:bg-slate-800/50">
                                        <TableCell className="font-mono text-xs text-slate-400 pl-4">{refund.transaction.transaction_ref}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-slate-200">{refund.user.display_name}</span>
                                                <span className="text-[10px] text-slate-500">{refund.user.email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-slate-300 text-xs max-w-[200px] truncate" title={refund.reason || ""}>
                                            {refund.reason || "Không có lý do"}
                                        </TableCell>
                                        <TableCell className="font-bold text-white text-sm">{formatCurrency(refund.transaction.amount)}</TableCell>
                                        <TableCell className="text-slate-400 text-[11px]">
                                            {format(new Date(refund.created_at), "dd/MM/yy HH:mm", { locale: vi })}
                                        </TableCell>
                                        <TableCell>
                                            {refund.status === 'APPROVED' && <Badge className="bg-green-500 text-black border-none font-bold">Đã duyệt</Badge>}
                                            {refund.status === 'PENDING' && <Badge className="bg-yellow-400 text-black border-none font-bold">Đang chờ</Badge>}
                                            {refund.status === 'REJECTED' && <Badge className="bg-red-500 text-white border-none">Từ chối</Badge>}
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            <div className="flex justify-end items-center gap-2">
                                                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-primary hover:text-primary hover:bg-primary/10" onClick={() => handleOpenRefundDetail(refund)}>
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-32 text-center text-slate-500">
                                        Không có yêu cầu hoàn tiền nào.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                 </div>
                 
                 {/* Pagination refunds */}
                 <div className="flex items-center justify-between py-2">
                    <div className="text-xs text-slate-500">
                        Trang {refundCurrentPage} / {refundTotalPages}
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="bg-slate-900 border-slate-800 text-slate-300 h-8 hover:bg-slate-800" onClick={() => setRefundCurrentPage(p => Math.max(1, p - 1))} disabled={refundCurrentPage === 1}>Trước</Button>
                        <Button variant="outline" size="sm" className="bg-slate-900 border-slate-800 text-slate-300 h-8 hover:bg-slate-800" onClick={() => setRefundCurrentPage(p => Math.min(refundTotalPages, p + 1))} disabled={refundCurrentPage === refundTotalPages}>Sau</Button>
                    </div>
                 </div>
            </CardContent>
          </Card>
      </TabsContent>
      </Tabs>

      {/* --- DETAIL MODAL --- */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent id="transaction-detail" className="bg-[#1e1e1e] border-slate-800 text-white max-w-[95vw] md:max-w-[1000px] overflow-hidden flex flex-col max-h-[90vh] shadow-2xl p-0">
            <div className="p-6 overflow-y-auto custom-scrollbar">
                <DialogHeader className="mb-6">
                    <div className="flex justify-between items-start">
                        <DialogTitle className="flex items-center gap-3 text-2xl font-bold font-outfit">
                            <div className="bg-primary/20 p-2 rounded-lg">
                                <FileText className="w-6 h-6 text-primary" />
                            </div>
                            <span>Chi tiết giao dịch</span>
                        </DialogTitle>
                        {(selectedTransaction?.status === 'COMPLETED' || selectedTransaction?.status === 'REFUNDED') && (
                            <Button variant="outline" size="sm" onClick={() => selectedTransaction && handlePrintReceipt(selectedTransaction)} className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-xs h-8 text-white">
                                <Printer className="w-3.5 h-3.5 mr-1.5" /> In biên lai
                            </Button>
                        )}
                    </div>
                    <DialogDescription className="text-slate-400 mt-2">
                        Mã hệ thống: <span className="font-mono text-slate-200 select-all">{selectedTransaction?.id}</span>
                    </DialogDescription>
                </DialogHeader>

                {selectedTransaction && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-2">
                        {/* Thông tin khách hàng */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wider">
                                <UserIcon className="w-4 h-4" /> Thông tin khách hàng
                            </div>
                            <div className="rounded-xl bg-slate-900/40 p-5 border border-slate-800/60 shadow-inner space-y-4">
                                <div className="flex items-center gap-4">
                                    <Avatar className="w-14 h-14 border-2 border-slate-700 shadow-md">
                                        <AvatarImage src={selectedTransaction.user.avatar_url} />
                                        <AvatarFallback className="bg-slate-800 text-lg">{(selectedTransaction.user.display_name || "??").slice(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0">
                                        <p className="text-lg font-bold text-white truncate">{selectedTransaction.user.display_name}</p>
                                        <p className="text-sm text-slate-500 truncate">@{selectedTransaction.user.username}</p>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-slate-800 space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500 font-bold">Email:</span>
                                        <span className="text-slate-200 font-medium">{selectedTransaction.user.email}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500 font-bold">Mã User:</span>
                                        <span className="text-slate-400 font-mono text-xs">{selectedTransaction.user.id}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Thông tin thanh toán */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wider">
                                <PaymentIcon className="w-4 h-4" /> Chi tiết thanh toán
                            </div>
                            <div className="rounded-xl bg-slate-900/40 p-5 border border-slate-800/60 shadow-inner space-y-4">
                                <div className="grid grid-cols-2 gap-y-4">
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-slate-500 uppercase font-bold">Mã tham chiếu</p>
                                        <p className="font-mono text-white bg-slate-800 px-2 py-0.5 rounded inline-block text-xs">{selectedTransaction.transaction_ref || "N/A"}</p>
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <p className="text-[10px] text-slate-500 uppercase font-bold">Gói đăng ký</p>
                                        <p className="font-bold text-primary">{selectedTransaction.plan?.name}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-slate-500 uppercase font-bold">Số tiền</p>
                                        <p className="font-bold text-green-400 text-xl">{formatCurrency(selectedTransaction.amount)}</p>
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <p className="text-[10px] text-slate-500 uppercase font-bold">Phương thức</p>
                                        <div className="flex justify-end font-bold uppercase">{selectedTransaction.payment_method}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-slate-500 uppercase font-bold">Trạng thái</p>
                                        <div>{getStatusBadge(selectedTransaction.status)}</div>
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <p className="text-[10px] text-slate-500 uppercase font-bold">Ngày tạo</p>
                                        <p className="text-xs text-slate-300">{format(new Date(selectedTransaction.created_at), "dd/MM/yyyy HH:mm:ss")}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Metadata Section */}
                        <div className="md:col-span-2 space-y-3">
                            <div className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                               <Database className="w-4 h-4 text-primary" /> Thông tin đối soát hệ thống (Metadata)
                            </div>
                            <div className="bg-slate-900/40 rounded-xl p-5 border border-slate-800 shadow-inner">
                                {selectedTransaction.metadata ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                        <MetadataItem 
                                            label="Mã tham chiếu Bank" 
                                            value={selectedTransaction.metadata.reference} 
                                            isCopyable 
                                        />
                                        <MetadataItem 
                                            label="Số tài khoản nhận" 
                                            value={selectedTransaction.metadata.accountNumber} 
                                        />
                                        <MetadataItem 
                                            label="Tên tài khoản khách" 
                                            value={selectedTransaction.metadata.counterAccountName} 
                                        />
                                        <MetadataItem 
                                            label="Số tài khoản khách" 
                                            value={selectedTransaction.metadata.counterAccountNumber} 
                                        />
                                        <MetadataItem 
                                            label="Ngân hàng khách" 
                                            value={selectedTransaction.metadata.counterAccountBankName} 
                                        />
                                        <MetadataItem 
                                            label="Thời gian giao dịch" 
                                            value={selectedTransaction.metadata.transactionDateTime} 
                                        />
                                        <div className="sm:col-span-2 md:col-span-3 pt-2">
                                            <MetadataItem 
                                                label="Mã Link thanh toán (PayOS)" 
                                                value={selectedTransaction.metadata.paymentLinkId} 
                                                className="font-mono text-[10px]"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-10 italic text-slate-600 flex flex-col items-center gap-2">
                                        <FileQuestion className="w-8 h-8 opacity-20" />
                                        Không có dữ liệu đối soát cho giao dịch này.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <DialogFooter className="bg-slate-900/60 p-5 border-t border-slate-800 flex flex-col sm:flex-row gap-3 sm:justify-between items-center">
                <Button 
                    variant="default" 
                    onClick={() => setIsDetailOpen(false)} 
                    className="bg-white hover:bg-slate-200 text-black font-bold transition-all order-2 sm:order-1 min-w-[120px] shadow-lg"
                >
                    Đóng cửa sổ
                </Button>
                <div className="flex gap-3 order-1 sm:order-2 w-full sm:w-auto">
                    {selectedTransaction?.status === "PENDING" && (
                        <Button 
                            className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 shadow-lg shadow-green-900/20 w-full sm:w-auto"
                            onClick={() => {
                                setIsDetailOpen(false);
                                handleOpenApproveDialog(selectedTransaction);
                            }}
                        >
                            <CheckCircle className="mr-2 h-4 w-4" /> Duyệt Giao Dịch
                        </Button>
                    )}
                </div>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- APPROVE CONFIRMATION DIALOG --- */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent className="bg-[#1e1e1e] border-slate-800 text-white shadow-2xl">
             <DialogHeader>
                <DialogTitle className="flex items-center gap-3 text-xl font-bold text-white">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                    Xác nhận duyệt giao dịch
                </DialogTitle>
                <DialogDescription className="text-slate-400 mt-2">
                    Xác nhận đã nhận thanh toán cho mã <span className="text-white font-mono font-bold bg-slate-800 px-1 rounded">{selectedTransaction?.transaction_ref}</span>.
                </DialogDescription>
            </DialogHeader>
            <div className="py-6">
                <div className="rounded-xl bg-yellow-500/5 p-5 border border-yellow-500/20 flex items-start gap-4 shadow-inner">
                     <div className="bg-yellow-500/10 p-2.5 rounded-full mt-0.5 shadow-sm">
                         <RefreshCcw className="h-5 w-5 text-yellow-500" />
                     </div>
                     <div className="space-y-1.5">
                         <p className="font-bold text-sm text-yellow-500 uppercase tracking-tight">Cảnh báo hệ thống</p>
                         <p className="text-xs text-slate-400 leading-relaxed">
                            Việc duyệt sẽ kích hoạt ngay gói <span className="text-white font-bold">{selectedTransaction?.plan?.name}</span> cho <span className="text-white">{selectedTransaction?.user.display_name}</span>. Hành động này sẽ cập nhật trực tiếp vào bản ghi Subscription của người dùng.
                         </p>
                     </div>
                </div>
            </div>
            <DialogFooter className="gap-3">
                <Button variant="ghost" onClick={() => setIsApproveDialogOpen(false)} className="text-slate-400 hover:bg-slate-800 hover:text-white">
                    Hủy bỏ
                </Button>
                <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700 text-white font-bold px-8">
                    Xác nhận
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- CREATE REFUND DIALOG --- */}
      <Dialog open={isCreateRefundOpen} onOpenChange={setIsCreateRefundOpen}>
        <DialogContent className="bg-[#1e1e1e] border-slate-800 text-white">
             <DialogHeader>
                <DialogTitle>Yêu cầu hoàn tiền</DialogTitle>
                <DialogDescription className="text-slate-400">
                    Bạn đang tạo yêu cầu hoàn tiền cho giao dịch <span className="text-white font-mono">{selectedTransaction?.transaction_ref}</span>.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
                <div className="space-y-2">
                    <label className="text-sm text-slate-300">Lý do hoàn tiền</label>
                    <Textarea 
                        placeholder="Nhập lý do hoàn tiền (tùy chọn)..."
                        className="bg-[#262626] border-slate-700 text-white min-h-[100px]"
                        value={refundReason}
                        onChange={(e) => setRefundReason(e.target.value)}
                    />
                </div>
            </div>
            <DialogFooter>
                <Button variant="ghost" onClick={() => setIsCreateRefundOpen(false)} className="text-slate-400 hover:bg-slate-800 hover:text-white">Hủy</Button>
                <Button onClick={handleCreateRefund} className="bg-red-600 hover:bg-red-700 text-white">Tạo yêu cầu</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- PROCESS REFUND DIALOG --- */}
      <Dialog open={isProcessRefundOpen} onOpenChange={setIsProcessRefundOpen}>
        <DialogContent className="bg-[#1e1e1e] border-slate-800 text-white">
             <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                    {processAction === 'APPROVE' ? <CheckCircle className="text-green-500 w-5 h-5"/> : <XCircle className="text-red-500 w-5 h-5"/>}
                    {processAction === 'APPROVE' ? 'Duyệt hoàn tiền' : 'Từ chối hoàn tiền'}
                </DialogTitle>
                <DialogDescription className="text-slate-400">
                    Xác nhận thao tác cho yêu cầu của <span className="text-white font-bold">{selectedRefund?.user.display_name}</span>.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4">
                <p className="text-sm text-slate-300">
                    {processAction === 'APPROVE' 
                        ? 'Hành động này sẽ hủy gói đăng ký của người dùng và đánh dấu giao dịch là ĐÃ HOÀN TIỀN.' 
                        : 'Yêu cầu hoàn tiền này sẽ bị đánh dấu là TỪ CHỐI.'}
                </p>
                {selectedRefund?.reason && (
                    <div className="mt-4 p-3 bg-slate-900/50 rounded-lg border border-slate-800">
                        <span className="text-xs text-slate-500 uppercase font-bold">Lý do từ khách hàng:</span>
                        <p className="text-sm text-slate-300 mt-1">{selectedRefund.reason}</p>
                    </div>
                )}
            </div>
            <DialogFooter>
                <Button variant="ghost" onClick={() => setIsProcessRefundOpen(false)} className="text-slate-400 hover:bg-slate-800 hover:text-white">Hủy</Button>
                <Button 
                    onClick={handleProcessRefund} 
                    className={processAction === 'APPROVE' ? "bg-green-600 hover:bg-green-700 text-white" : "bg-red-600 hover:bg-red-700 text-white"}
                >
                    Xác nhận
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- REFUND DETAIL MODAL --- */}
      <Dialog open={isRefundDetailOpen} onOpenChange={setIsRefundDetailOpen}>
        <DialogContent className="bg-[#1e1e1e] border-slate-800 text-white max-w-[95vw] md:max-w-[700px]">
            <DialogHeader>
                <DialogTitle className="text-2xl font-bold font-outfit flex items-center gap-2">
                    <ArrowDownLeft className="text-primary w-6 h-6" /> Chi tiết hoàn tiền
                </DialogTitle>
                <DialogDescription className="text-slate-400">
                    Yêu cầu hoàn tiền được tạo vào lúc {selectedRefundDetail?.created_at && format(new Date(selectedRefundDetail.created_at), "dd/MM/yyyy HH:mm:ss")}
                </DialogDescription>
            </DialogHeader>
            
            {selectedRefundDetail && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                    {/* User info */}
                    <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                        <h4 className="text-xs text-slate-500 font-bold uppercase mb-3 flex items-center gap-2">
                            <UserIcon className="w-4 h-4" /> Người yêu cầu
                        </h4>
                        <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border border-slate-700">
                                <AvatarImage src={selectedRefundDetail.user.avatar_url} />
                                <AvatarFallback className="bg-slate-800 text-xs">{(selectedRefundDetail.user.display_name || "??").slice(0,2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-bold text-slate-200">{selectedRefundDetail.user.display_name}</p>
                                <p className="text-xs text-slate-400">{selectedRefundDetail.user.email}</p>
                            </div>
                        </div>
                    </div>

                    {/* Bank Info */}
                    <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                        <h4 className="text-xs text-slate-500 font-bold uppercase mb-3 flex items-center gap-2">
                            <Database className="w-4 h-4" /> Thông tin nhận tiền
                        </h4>
                        <div className="space-y-2">
                            <div>
                                <span className="text-[10px] text-slate-500 block">Ngân hàng</span>
                                <p className="text-sm font-semibold text-slate-200">{selectedRefundDetail.bank_name || "Không cung cấp"}</p>
                            </div>
                            <div>
                                <span className="text-[10px] text-slate-500 block">Số tài khoản</span>
                                <p className="text-sm font-semibold text-slate-200 font-mono">{selectedRefundDetail.account_number || "Không cung cấp"}</p>
                            </div>
                        </div>
                    </div>

                    {/* Transaction Info */}
                    <div className="md:col-span-2 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                        <h4 className="text-xs text-slate-500 font-bold uppercase mb-3 flex items-center gap-2">
                            <PaymentIcon className="w-4 h-4" /> Thông tin giao dịch gốc
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <span className="text-[10px] text-slate-500 block">Mã giao dịch</span>
                                <p className="text-xs font-mono font-bold text-slate-300">{selectedRefundDetail.transaction.transaction_ref}</p>
                            </div>
                            <div>
                                <span className="text-[10px] text-slate-500 block">Số tiền</span>
                                <p className="text-sm font-bold text-green-400">{formatCurrency(selectedRefundDetail.transaction.amount)}</p>
                            </div>
                            <div>
                                <span className="text-[10px] text-slate-500 block">Trạng thái H.Tiền</span>
                                <p className="text-sm font-semibold mt-1">
                                    {selectedRefundDetail.status === 'APPROVED' && <span className="text-green-500">Đã duyệt</span>}
                                    {selectedRefundDetail.status === 'PENDING' && <span className="text-yellow-500">Đang chờ</span>}
                                    {selectedRefundDetail.status === 'REJECTED' && <span className="text-red-500">Từ chối</span>}
                                </p>
                            </div>
                            <div>
                                <span className="text-[10px] text-slate-500 block">Ngày GD gốc</span>
                                <p className="text-xs text-slate-300">{format(new Date(selectedRefundDetail.transaction.created_at), "dd/MM/yyyy HH:mm")}</p>
                            </div>
                        </div>
                    </div>

                    {/* Reason */}
                    {selectedRefundDetail.reason && (
                        <div className="md:col-span-2 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                            <h4 className="text-xs text-slate-500 font-bold uppercase mb-2">Lý do từ khách hàng</h4>
                            <p className="text-sm text-slate-300 italic">"{selectedRefundDetail.reason}"</p>
                        </div>
                    )}
                </div>
            )}

            <DialogFooter className="mt-4 gap-2">
                <Button variant="ghost" onClick={() => setIsRefundDetailOpen(false)} className="text-slate-400 hover:text-white">Đóng</Button>
                {selectedRefundDetail?.status === "PENDING" && (
                    <>
                        <Button variant="outline" className="border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white" onClick={() => {
                            setSelectedRefund(selectedRefundDetail);
                            setProcessAction("REJECT");
                            setIsProcessRefundOpen(true);
                        }}>Từ chối</Button>
                        <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => {
                            setSelectedRefund(selectedRefundDetail);
                            setProcessAction("APPROVE");
                            setIsProcessRefundOpen(true);
                        }}>Duyệt hoàn tiền</Button>
                    </>
                )}
            </DialogFooter>
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #475569;
        }
      `}</style>
    </div>
  );
}
function MetadataItem({ label, value, isCopyable, className = '' }: { label: string, value: any, isCopyable?: boolean, className?: string }) {
    const displayValue = value === null || value === undefined || value === '' ? '---' : String(value);
    return (
        <div className='flex flex-col gap-1.5'>
            <span className='text-[10px] text-slate-500 uppercase font-bold tracking-wider'>{label}</span>
            <div className='flex items-center gap-2 group'>
                <span className={'text-sm text-slate-200 font-medium break-all '}>
                    {displayValue}
                </span>
                {isCopyable && value && (
                    <button 
                        onClick={() => {
                            navigator.clipboard.writeText(displayValue);
                        }}
                        className='p-1 hover:bg-slate-700 rounded transition-all text-slate-600 hover:text-primary opacity-0 group-hover:opacity-100'
                    >
                        <Copy className='w-3 h-3' />
                    </button>
                )}
            </div>
        </div>
    );
}
