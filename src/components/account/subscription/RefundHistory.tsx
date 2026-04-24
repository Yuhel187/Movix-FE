"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { subscriptionService } from "@/services/subscription.service";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const formatCurrency = (amount: number, currency: string = "VND") => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency }).format(amount);
};

interface RefundRequest {
  id: string;
  reason: string;
  status: string;
  created_at: string;
  transaction?: {
    amount: number;
    currency: string;
    plan?: {
      name: string;
    };
  };
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "PENDING":
      return <Badge className="bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/20 border-none transition-colors">Chờ duyệt</Badge>;
    case "APPROVED":
      return <Badge className="bg-green-500/20 text-green-500 hover:bg-green-500/20 border-none transition-colors">Đã chấp thuận</Badge>;
    case "REJECTED":
      return <Badge className="bg-red-500/20 text-red-500 hover:bg-red-500/20 border-none transition-colors">Đã từ chối</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export default function RefundHistory() {
  const [requests, setRequests] = useState<RefundRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await subscriptionService.getRefundRequests();
        setRequests(response.data || []);
      } catch (err: any) {
        setError(err.message || "Không thể tải danh sách yêu cầu hoàn tiền");
      } finally {
        setIsLoading(false);
      }
    };
    fetchRequests();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="bg-red-950/20 border-red-500/50">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (requests.length === 0) {
    return (
      <Card className="bg-[#1e1e1e] border-slate-800">
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          <p className="text-slate-400 text-sm">Chưa có yêu cầu hoàn tiền nào</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#1e1e1e] border-slate-800 overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-900 border-b border-slate-800">
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-slate-300">Gói</TableHead>
              <TableHead className="text-slate-300">Số tiền</TableHead>
              <TableHead className="text-slate-300">Lý do</TableHead>
              <TableHead className="text-slate-300">Trạng thái</TableHead>
              <TableHead className="text-slate-300 text-right">Ngày yêu cầu</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                <TableCell className="font-medium text-slate-200">
                  {request.transaction?.plan?.name || "N/A"}
                </TableCell>
                <TableCell className="text-slate-300">
                  {request.transaction?.amount ? formatCurrency(request.transaction.amount, request.transaction.currency) : "N/A"}
                </TableCell>
                <TableCell className="text-slate-400 max-w-[200px] truncate" title={request.reason}>
                  {request.reason || "Không có lý do"}
                </TableCell>
                <TableCell>{getStatusBadge(request.status)}</TableCell>
                <TableCell className="text-right text-slate-400 whitespace-nowrap">
                  {new Date(request.created_at).toLocaleDateString("vi-VN")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
