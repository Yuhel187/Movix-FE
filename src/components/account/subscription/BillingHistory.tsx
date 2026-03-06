"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, FileText } from "lucide-react";

interface BillingInvoice {
  id: string;
  date: string;
  amount: number;
  status: "paid" | "pending" | "failed";
  items: string;
}

const MOCK_INVOICES: BillingInvoice[] = [
  { id: "INV-001", date: "01/03/2026", amount: 59000, status: "paid", items: "Gói Movix Plus (Tháng)" },
  { id: "INV-002", date: "01/02/2026", amount: 59000, status: "paid", items: "Gói Movix Plus (Tháng)" },
  { id: "INV-003", date: "01/01/2026", amount: 59000, status: "paid", items: "Gói Movix Plus (Tháng)" },
];

export default function BillingHistory() {
  return (
    <Card className="bg-[#1e1e1e] border-slate-800">
      <CardHeader>
        <CardTitle className="text-lg text-white">Lịch sử thanh toán</CardTitle>
        <CardDescription>Xem và tải xuống các hóa đơn trước đây của bạn.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-slate-800 hover:bg-transparent">
              <TableHead className="text-slate-400">Ngày</TableHead>
              <TableHead className="text-slate-400">Mô tả</TableHead>
              <TableHead className="text-slate-400">Số tiền</TableHead>
              <TableHead className="text-slate-400">Trạng thái</TableHead>
              <TableHead className="text-right text-slate-400">Hóa đơn</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_INVOICES.map((invoice) => (
              <TableRow key={invoice.id} className="border-slate-800 hover:bg-slate-800/50">
                <TableCell className="font-medium text-slate-200">{invoice.date}</TableCell>
                <TableCell className="text-slate-300">{invoice.items}</TableCell>
                <TableCell className="text-slate-200">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(invoice.amount)}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    invoice.status === 'paid' ? 'bg-green-500/10 text-green-500' : 
                    invoice.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-red-500/10 text-red-500'
                  }`}>
                    {invoice.status === 'paid' ? 'Thành công' : invoice.status === 'pending' ? 'Đang xử lý' : 'Thất bại'}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white">
                    <Download className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}