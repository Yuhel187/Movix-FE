"use client";

import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

const stats = [
  { title: "Số lượng người dùng mới (ngày)", value: "707" },
  { title: "Quốc gia được xem nhiều", value: "Top 5" },
  { title: "Thể loại được xem nhiều", value: "Top 5" },
  { title: "Top phim được xem nhiều", value: "707" },
];

export default function DashboardPage() {
  return (
    <div className="bg-transparent">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <Card key={i} className="bg-[#262626] border border-primary shadow-lg">
            <CardHeader>
              <CardTitle className="text-sm text-white">{s.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-white">{s.value}</div>
                <div className="w-20 h-20 sm:w-24 sm:h-24"></div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Biểu đồ người dùng trực tuyến */}
        <Card className="col-span-full bg-[#262626] border border-primary shadow-lg">
          <CardHeader>
            <CardTitle className="text-sm text-white">
              Số lượng người dùng trực tuyến (giờ)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56 sm:h-64 from-slate-800 to-slate-900 rounded-md p-4"></div>
          </CardContent>
        </Card>

        {/* Hoạt động gần đây */}
        <Card className="col-span-1 lg:col-span-2 bg-[#262626] border border-primary shadow-lg">
          <CardHeader>
            <CardTitle className="text-sm text-white">Hoạt động gần đây</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-48">
              <ul className="flex flex-col gap-3 text-white">
                <li>Người dùng A đăng ký</li>
                <li>Phim B được thêm</li>
                <li>Hóa đơn C được thanh toán</li>
                <li>Người dùng D nhận quyền admin</li>
              </ul>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Tổng quan */}
        <Card className="col-span-1 lg:col-span-2 bg-[#262626] border border-primary shadow-lg">
          <CardHeader>
            <CardTitle className="text-sm text-white">Tổng quan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 text-white">
              <div className="text-xs text-white">Tổng phim</div>
              <div className="text-sm font-medium">1,234</div>
              <div className="text-xs text-white">Người dùng</div>
              <div className="text-sm font-medium">12,345</div>
              <div className="text-xs text-white">Doanh thu</div>
              <div className="text-sm font-medium">₫ 456,000,000</div>
              <div className="text-xs text-white">Khách</div>
              <div className="text-sm font-medium">234</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
