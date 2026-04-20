"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Receipt } from "lucide-react";
import { Transaction } from "@/types/subscription";

interface BillingHistoryProps {
  transactions: Transaction[];
  isLoading?: boolean;
}

const mapStatusLabel = (status: Transaction["status"]) => {
  if (status === "COMPLETED") return { text: "Thành công", className: "bg-green-500/10 text-green-500" };
  if (status === "PENDING") return { text: "Đang xử lý", className: "bg-yellow-500/10 text-yellow-500" };
  if (status === "REFUNDED") return { text: "Hoàn tiền", className: "bg-blue-500/10 text-blue-500" };
  return { text: "Thất bại", className: "bg-red-500/10 text-red-500" };
};

export default function BillingHistory({ transactions, isLoading = false }: BillingHistoryProps) {
  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return (
    <Card className="bg-[#1e1e1e] border-slate-800">
      <CardHeader>
        <CardTitle className="text-lg text-white">Lịch sử thanh toán</CardTitle>
        <CardDescription>Xem và tải xuống các hóa đơn trước đây của bạn.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-slate-400">Đang tải giao dịch...</p>
        ) : transactions.length === 0 ? (
          <p className="text-sm text-slate-400">Bạn chưa có giao dịch thanh toán nào.</p>
        ) : (
        <Table>
          <TableHeader>
            <TableRow className="border-slate-800 hover:bg-transparent">
              <TableHead className="text-slate-400">Mã GD</TableHead>
              <TableHead className="text-slate-400">Ngày</TableHead>
              <TableHead className="text-slate-400">Mô tả</TableHead>
              <TableHead className="text-slate-400">Phương thức</TableHead>
              <TableHead className="text-slate-400">Số tiền</TableHead>
              <TableHead className="text-slate-400">Trạng thái</TableHead>
              <TableHead className="text-right text-slate-400">Chi tiết</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTransactions.map((transaction) => {
              const status = mapStatusLabel(transaction.status);

              return (
              <TableRow key={transaction.id} className="border-slate-800 hover:bg-slate-800/50">
                <TableCell className="font-mono text-xs text-slate-300">
                  {transaction.transaction_ref || transaction.id.slice(0, 8)}
                </TableCell>
                <TableCell className="font-medium text-slate-200">
                  <div>{new Date(transaction.created_at).toLocaleDateString("vi-VN")}</div>
                  <div className="text-xs text-slate-500">
                    {new Date(transaction.created_at).toLocaleTimeString("vi-VN")}
                  </div>
                </TableCell>
                <TableCell className="text-slate-300">
                  {transaction.plan?.name || "Thanh toán gói đăng ký"}
                </TableCell>
                <TableCell className="text-slate-300 uppercase text-xs">
                  {transaction.payment_method || "PAYOS"}
                </TableCell>
                <TableCell className="text-slate-200">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: transaction.currency }).format(transaction.amount)}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${status.className}`}>
                    {status.text}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white" title={`Transaction ID: ${transaction.id}`}>
                    <Receipt className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
              );
            })}
          </TableBody>
        </Table>
        )}
      </CardContent>
    </Card>
  );
}