/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import {
  LineChart, Line, BarChart, Bar, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LabelList, AreaChart, Area,
} from "recharts";
import { addDays, format, eachDayOfInterval } from "date-fns";
import { vi } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  ChartConfig, ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Download, CalendarIcon, Users, Eye, Film, TrendingUp,
  MessageSquare, Loader2, Heart, FileText
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import apiClient from "@/lib/apiClient"; 
import { useAuth } from "@/contexts/AuthContext";

// --- Import thư viện PDF ---
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// --- Config màu sắc biểu đồ ---
const COLORS: string[] = [
  "var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)",
];

const chartConfig = {
  users: { label: "Người dùng mới", color: "var(--chart-2)" },
  views: { label: "Lượt xem", color: "var(--chart-1)" },
  favorites: { label: "Lượt thích", color: "var(--chart-1)" },
  comments: { label: "Bình luận", color: "var(--chart-4)" },
  count: { label: "Số lượng", color: "var(--chart-3)" },
} satisfies ChartConfig;

// --- Component Tooltip ---
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 bg-gray-900/95 border border-gray-700 rounded-lg shadow-xl text-xs">
        <p className="font-bold text-white mb-1">{label}</p>
        {payload.map((pld: any, index: number) => (
          <div key={index} className="flex items-center gap-2 mb-1 last:mb-0">
             <span className="w-2 h-2 rounded-full" style={{ backgroundColor: pld.color }}></span>
             <span className="text-gray-300 capitalize">
                {chartConfig[pld.dataKey as keyof typeof chartConfig]?.label || pld.name}:
             </span>
             <span className="font-mono font-medium text-white">
               {pld.value.toLocaleString("vi-VN")}
             </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

type ReportTabId = "overview" | "content" | "users";
const tabs: { id: ReportTabId; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Tổng quan", icon: TrendingUp },
  { id: "content", label: "Báo cáo Nội dung", icon: Film },
  { id: "users", label: "Báo cáo Người dùng", icon: Users },
];

export default function ReportPage() {
  const { user } = useAuth(); 
  const [view, setView] = useState<"day" | "month" | "year">("month");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  const [activeTab, setActiveTab] = useState<ReportTabId>("overview");
  
  const [loading, setLoading] = useState(true);
  const [kpiData, setKpiData] = useState<any>({});
  const [trendData, setTrendData] = useState<any[]>([]); 
  const [topMoviesData, setTopMoviesData] = useState<any[]>([]);
  const [topUsersData, setTopUsersData] = useState<any[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const params = {
            viewType: view,
            from: dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined,
            to: dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined,
        };

        const [reportRes, topMoviesRes, statsRes] = await Promise.allSettled([
            apiClient.get('/dashboard/report-all', { params }),
            apiClient.get('/dashboard/top-movies'),
            apiClient.get('/dashboard/stats'),
        ]);

        const data = reportRes.status === 'fulfilled' ? reportRes.value.data : {};
        const topMovies = topMoviesRes.status === 'fulfilled' ? topMoviesRes.value.data : [];
        const stats = statsRes.status === 'fulfilled' ? statsRes.value.data : {};

        if (reportRes.status === 'rejected') {
            console.error("Lỗi tải report-all:", reportRes.reason);
            toast.error("Không thể tải dữ liệu báo cáo chi tiết.");
        }

        // Map KPI data from stats endpoint if available, otherwise fallback to report-all
        setKpiData({
            totalUsers: stats.users || data.kpi?.totalUsers || 0,
            totalMovies: stats.movies || data.kpi?.totalMovies || 0,
            totalViews: stats.views || data.kpi?.totalViews || 0,
            totalComments: data.kpi?.totalComments || 0 // stats only has comments_today
        });

        let formattedTrend = [];

        if (view === 'day' && dateRange?.from && dateRange?.to) {
            try {
                const allDays = eachDayOfInterval({ start: dateRange.from, end: dateRange.to });
                const dailyMap = new Map();
                
                (data.dailyData || []).forEach((item: any) => {
                    if (item.date) {
                        if (typeof item.date === 'string' && /^\d{1,2}\/\d{1,2}$/.test(item.date)) {
                             dailyMap.set(item.date, item);
                        } else {
                            let d = new Date(item.date);
                            if (typeof item.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(item.date)) {
                                 d = new Date(item.date + 'T00:00:00');
                            }
                            
                            if (!isNaN(d.getTime())) {
                                dailyMap.set(format(d, 'yyyy-MM-dd'), item);
                            }
                        }
                    }
                });

                formattedTrend = allDays.map(day => {
                    let item = dailyMap.get(format(day, 'dd/MM'));
                    if (!item) {
                        item = dailyMap.get(format(day, 'yyyy-MM-dd'));
                    }

                    return {
                        label: format(day, 'dd/MM'),
                        rawDate: format(day, 'yyyy-MM-dd'),
                        users: item ? (item.users || item.count || item.new_users || 0) : 0
                    };
                });
            } catch (e) {
                console.error("Error generating daily trend:", e);
                formattedTrend = [];
            }
        } else {
            let rawData = [];
            if (view === 'month') {
                rawData = data.monthlyData || [];
            } else if (view === 'year') {
                rawData = data.yearlyData || data.monthlyData || [];
            }

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formattedTrend = rawData.map((item: any) => {
                let label = item.date || item.month || item.year || "";
                const rawDate = label;

                if (view === 'month') {
                    if (item.month && item.month.includes('/')) {
                        const parts = item.month.split('/');
                        if (parts.length >= 2) {
                            label = `Thg ${parts[0]}/${parts[1]}`;
                        }
                    }
                } else if (view === 'year') {
                    if (item.year) {
                        label = `Năm ${item.year}`;
                    } else if (item.month && item.month.includes('/')) {
                        label = `Năm ${item.month.split('/')[1]}`;
                    }
                }

                return {
                    label: label,
                    rawDate: rawDate,
                    users: item.users || item.count || item.new_users || 0,
                };
            });
        }

        setTrendData(formattedTrend);
        setTopMoviesData(topMovies.length > 0 ? topMovies : (data.topMoviesData || [])); 
        
        setTopUsersData(data.topUsersData || []);

      } catch (error) {
        console.error("Lỗi tải báo cáo:", error);
        toast.error("Không thể tải dữ liệu báo cáo. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [view, dateRange]); 

  const loadStaticFont = async (doc: jsPDF) => {
    try {
      const fontUrl = "/fonts/Roboto/static/Roboto-Regular.ttf"; 
      
      const response = await fetch(fontUrl);
      if (!response.ok) {
        throw new Error(`Không tìm thấy file font tại ${fontUrl}`);
      }
      
      const blob = await response.blob();
      const reader = new FileReader();
      
      return new Promise<void>((resolve, reject) => {
        reader.onloadend = () => {
          const base64data = reader.result as string;
          const base64Content = base64data.split(',')[1];
          
          if (base64Content) {
            doc.addFileToVFS("Roboto-Regular.ttf", base64Content);
            doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
            doc.addFont("Roboto-Regular.ttf", "Roboto", "bold");

            doc.setFont("Roboto"); 
            resolve();
          } else {
            reject(new Error("Lỗi đọc file font"));
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("Lỗi load font:", error);
      toast.error("Lỗi tải Font Tiếng Việt. Hãy kiểm tra đường dẫn file font.");
    }
  };

  const handleExportReport = async () => {
    if (!kpiData.totalUsers && !trendData.length) {
        toast.warning("Chưa có dữ liệu để xuất.");
        return;
    }
    
    setIsExporting(true);
    const toastId = toast.loading("Đang tạo file PDF...");

    try {
        const doc = new jsPDF();

        // 1. Load Font
        await loadStaticFont(doc);

        // 2. Chuẩn bị Metadata
        const now = new Date();
        const exportTime = format(now, "HH:mm dd/MM/yyyy");
        const fileNameTime = format(now, "dd-MM-yyyy_HH-mm"); 
        const adminName = user?.display_name || user?.username || "Quản trị viên";
        
        let reportTitle = "BÁO CÁO TỔNG QUAN";
        let reportTypeSlug = "TongQuan";
        if (activeTab === 'content') {
            reportTitle = "BÁO CÁO NỘI DUNG";
            reportTypeSlug = "NoiDung";
        } else if (activeTab === 'users') {
            reportTitle = "BÁO CÁO NGƯỜI DÙNG";
            reportTypeSlug = "NguoiDung";
        }

        let viewLabel = "THEO THÁNG";
        let viewSlug = "TheoThang";
        if (view === 'day') {
            viewLabel = "THEO NGÀY";
            viewSlug = "TheoNgay";
        } else if (view === 'year') {
            viewLabel = "THEO NĂM";
            viewSlug = "TheoNam";
        }

        const rangeLabel = dateRange?.from 
            ? `${format(dateRange.from, "dd/MM/yyyy")} - ${dateRange.to ? format(dateRange.to, "dd/MM/yyyy") : "Nay"}`
            : "Toàn bộ thời gian";

        doc.setFontSize(22);
        doc.setTextColor(229, 9, 20);
        doc.text("MOVIX REPORT", 105, 20, { align: "center" });
        
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0); 
        doc.text(`${reportTitle} - ${viewLabel}`, 105, 30, { align: "center" });

        doc.setFontSize(10);
        doc.setTextColor(80); 
        
        doc.text(`Người xuất: ${adminName}`, 14, 42);
        doc.text(`Thời gian xuất: ${exportTime}`, 14, 48);
        
        doc.text(`Kiểu xem: ${viewLabel}`, 130, 42);
        doc.text(`Phạm vi: ${rangeLabel}`, 130, 48);

        doc.setDrawColor(200);
        doc.setLineWidth(0.5);
        doc.line(14, 55, 196, 55);

        let currentY = 65;

        const tableStyles = {
            font: "Roboto", 
            fontStyle: "normal" as const,
        };

        
        if (activeTab === 'overview') {
            doc.setFontSize(12);
            doc.setTextColor(0);
            doc.text("1. Tổng quan hệ thống (KPI)", 14, currentY);
            currentY += 6;

            autoTable(doc, {
                startY: currentY,
                head: [['Tổng Người Dùng', 'Tổng Phim', 'Tổng Lượt Xem', 'Bình Luận']],
                body: [[
                    kpiData.totalUsers?.toLocaleString('vi-VN') || "0",
                    kpiData.totalMovies?.toLocaleString('vi-VN') || "0",
                    kpiData.totalViews?.toLocaleString('vi-VN') || "0",
                    kpiData.totalComments?.toLocaleString('vi-VN') || "0"
                ]],
                theme: 'grid',
                headStyles: { fillColor: [50, 50, 50], textColor: 255, ...tableStyles, fontStyle: 'bold' as const },
                bodyStyles: { textColor: 0, fontSize: 11, halign: 'center', ...tableStyles },
                styles: { ...tableStyles }
            });
            
            // @ts-ignore
            currentY = doc.lastAutoTable.finalY + 15;

            doc.setFontSize(12);
            doc.text(`2. Dữ liệu Tăng trưởng Người dùng (${viewLabel})`, 14, currentY);
            currentY += 6;

            const trendRows = trendData.map(item => [item.label, item.users.toLocaleString('vi-VN')]);
            autoTable(doc, {
                startY: currentY,
                head: [['Thời Gian', 'Người Dùng Mới']],
                body: trendRows,
                theme: 'striped',
                headStyles: { fillColor: [229, 9, 20], ...tableStyles, fontStyle: 'bold' as const },
                bodyStyles: { ...tableStyles },
                styles: { ...tableStyles },
            });
        } 
        else if (activeTab === 'content') {
            doc.setFontSize(12);
            doc.setTextColor(0);
            doc.text("1. Top Phim Được Yêu Thích Nhất", 14, currentY);
            currentY += 6;

            const movieRows = topMoviesData.map((m, i) => [i + 1, m.movie, (m.favorites || m.views || 0).toLocaleString('vi-VN')]);
            autoTable(doc, {
                startY: currentY,
                head: [['#', 'Tên Phim', 'Lượt Thích']],
                body: movieRows,
                theme: 'striped',
                headStyles: { fillColor: [229, 9, 20], ...tableStyles, fontStyle: 'bold' as const },
                bodyStyles: { ...tableStyles },
                styles: { ...tableStyles },
                columnStyles: {
                    0: { cellWidth: 15, halign: 'center' },
                    2: { halign: 'center' }
                }
            });
        }
        else if (activeTab === 'users') {
             doc.setFontSize(12);
             doc.setTextColor(0);
             doc.text(`1. Chi tiết Tăng trưởng Người dùng (${viewLabel})`, 14, currentY);
             currentY += 6;
     
             const trendRows = trendData.map(item => [item.label, item.users.toLocaleString('vi-VN')]);
             autoTable(doc, {
                 startY: currentY,
                 head: [['Thời Gian', 'Đăng Ký Mới']],
                 body: trendRows,
                 theme: 'striped',
                 headStyles: { fillColor: [229, 9, 20], ...tableStyles, fontStyle: 'bold' as const },
                 bodyStyles: { ...tableStyles },
                 styles: { ...tableStyles },
             });

             // @ts-ignore
            currentY = doc.lastAutoTable.finalY + 15;

             doc.setFontSize(12);
             doc.text("2. Top Người Dùng Tích Cực (Bình luận)", 14, currentY);
             currentY += 6;

             const userRows = topUsersData.map((u, i) => [i+1, u.user, u.comments.toLocaleString('vi-VN')]);
             autoTable(doc, {
                startY: currentY,
                head: [['#', 'Tên Đăng Nhập', 'Số Bình Luận']],
                body: userRows,
                theme: 'grid',
                headStyles: { fillColor: [50, 50, 50], ...tableStyles, fontStyle: 'bold' as const },
                bodyStyles: { ...tableStyles },
                styles: { ...tableStyles },
                columnStyles: { 0: { cellWidth: 15, halign: 'center' } }
            });
        }

        const pageCount = doc.getNumberOfPages();
        for(let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(9);
            doc.setTextColor(150);
            doc.text(`Trang ${i} / ${pageCount}`, 105, 290, { align: "center" });
            doc.text("Hệ thống Quản trị Movix", 14, 290);
        }

        const finalFileName = `BaoCao_${reportTypeSlug}_${viewSlug}_${fileNameTime}.pdf`;
        doc.save(finalFileName);
        
        toast.success(`Đã xuất file: ${finalFileName}`, { id: toastId });

    } catch (error) {
        console.error("Export PDF error:", error);
        toast.error("Có lỗi khi xuất file PDF.", { id: toastId });
    } finally {
        setIsExporting(false);
    }
  };

  if (loading) {
      return <div className="flex h-[80vh] w-full items-center justify-center text-white gap-2">
        <Loader2 className="animate-spin w-6 h-6"/> 
        <span className="text-lg">Đang tổng hợp số liệu...</span>
      </div>
  }
  // ... (Phần Return JSX giữ nguyên không đổi)
  return (
    <div className="w-full text-white p-4 md:p-6 space-y-6 pb-20">
      {/* --- Header Page --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-5">
        <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
                <FileText className="h-8 w-8 text-primary" />
                Báo Cáo & Thống Kê
            </h1>
            <p className="text-slate-400 mt-1">
                Tổng hợp số liệu hoạt động của hệ thống Movix
            </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          
          {/* 1. Chọn kiểu xem */}
          <div className="flex items-center gap-2 bg-[#262626] p-1 rounded-lg border border-slate-700">
              <span className="text-xs text-gray-400 px-2">Xem theo:</span>
              <Select value={view} onValueChange={(v) => setView(v as "day" | "month" | "year")}>
                <SelectTrigger className="w-[110px] h-8 border-none bg-transparent focus:ring-0">
                  <SelectValue placeholder="Chọn" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1b1f] border-slate-700 text-white">
                  <SelectItem value="day">Ngày</SelectItem>
                  <SelectItem value="month">Tháng</SelectItem>
                  <SelectItem value="year">Năm</SelectItem>
                </SelectContent>
              </Select>
          </div>
          
           {/* 2. DateRange Picker */}
           <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full sm:w-[240px] justify-start text-left font-normal bg-[#262626] border-slate-700 hover:bg-slate-700 hover:text-white h-10",
                  !dateRange && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "dd/MM/yyyy", { locale: vi })} -{" "}
                      {format(dateRange.to, "dd/MM/yyyy", { locale: vi })}
                    </>
                  ) : (
                    format(dateRange.from, "dd/MM/yyyy", { locale: vi })
                  )
                ) : (
                  <span>Chọn khoảng ngày</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-[#1a1b1f] border-slate-700 text-white" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
                locale={vi}
              />
            </PopoverContent>
          </Popover>

          {/* 3. Nút Xuất PDF */}
          <Button 
             className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white h-10 shadow-lg shadow-red-900/20" 
             onClick={handleExportReport}
             disabled={isExporting}
          >
            {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            Xuất PDF
          </Button>
        </div>
      </div>

      {/* --- Tabs --- */}
      <div className="flex items-center gap-2 border-b border-slate-700">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant="ghost"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "gap-2 px-6 py-2 h-11 rounded-none rounded-t-md transition-all text-base",
              activeTab === tab.id 
                ? "text-white border-b-2 border-primary bg-white/5 font-medium" 
                : "text-gray-400 hover:text-white hover:bg-white/5"
            )}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </Button>
        ))}
      </div>

      {/* --- Content --- */}
      <div className="animate-fade-in pt-2">
        {/* Tab: TỔNG QUAN */}
        {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-[#262626] border-slate-800 text-white hover:border-slate-600 transition-colors">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-300">Tổng Người dùng</CardTitle>
                    <Users className="h-4 w-4 text-[var(--chart-2)]" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{kpiData.totalUsers?.toLocaleString()}</div>
                    <p className="text-xs text-gray-400 mt-1">Tài khoản đã đăng ký</p>
                  </CardContent>
                </Card>

                <Card className="bg-[#262626] border-slate-800 text-white hover:border-slate-600 transition-colors">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-300">Tổng Phim</CardTitle>
                    <Film className="h-4 w-4 text-[var(--chart-1)]" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{kpiData.totalMovies?.toLocaleString()}</div>
                    <p className="text-xs text-gray-400 mt-1">Phim đang hiển thị</p>
                  </CardContent>
                </Card>

                <Card className="bg-[#262626] border-slate-800 text-white hover:border-slate-600 transition-colors">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-300">Tổng Lượt xem</CardTitle>
                    <Eye className="h-4 w-4 text-[var(--chart-3)]" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{kpiData.totalViews?.toLocaleString()}</div>
                    <p className="text-xs text-gray-400 mt-1">Dựa trên lịch sử xem</p>
                  </CardContent>
                </Card>

                <Card className="bg-[#262626] border-slate-800 text-white hover:border-slate-600 transition-colors">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-300">Tổng Bình luận</CardTitle>
                    <MessageSquare className="h-4 w-4 text-[var(--chart-4)]" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{kpiData.totalComments?.toLocaleString()}</div>
                    <p className="text-xs text-gray-400 mt-1">Tương tác cộng đồng</p>
                  </CardContent>
                </Card>
              </div>

              {/* Biểu đồ Line: Tăng trưởng User */}
              <Card className="bg-[#262626] border-slate-800 text-white">
                <CardHeader>
                  <CardTitle className="text-lg">
                     Biểu đồ Tăng trưởng Người dùng 
                     <span className="text-primary ml-2 text-base font-normal">
                       ({view === 'day' ? 'Theo Ngày' : view === 'month' ? 'Theo Tháng' : 'Theo Năm'})
                     </span>
                  </CardTitle>
                  <CardDescription>Số lượng người dùng đăng ký mới theo thời gian.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} vertical={false} />
                        <XAxis 
                            dataKey="label" 
                            stroke="#888888" 
                            fontSize={12} 
                            tickLine={false} 
                            axisLine={false}
                            dy={10}
                        />
                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Line 
                            type="monotone" 
                            dataKey="users" 
                            name="Người dùng mới"
                            strokeWidth={4} 
                            stroke="var(--color-users)" 
                            dot={{ r: 4, fill: "#1a1b1f", strokeWidth: 2 }} 
                            activeDot={{ r: 7, fill: "var(--color-users)" }} 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
        )}

        {/* Tab: NỘI DUNG (Content) */}
        {activeTab === 'content' && (
            <div className="grid grid-cols-1 gap-6">
              {/* Bar Chart: Top Movies (Favorites) */}
              <Card className="bg-[#262626] border-slate-800 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                     <Heart className="w-5 h-5 text-red-500" /> Top Phim Yêu Thích Nhất
                  </CardTitle>
                  <CardDescription>Dựa trên số lượng người dùng thêm vào danh sách yêu thích.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={topMoviesData} layout="vertical" margin={{ left: 0, right: 40 }}>
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} horizontal={false} />
                        <XAxis type="number" stroke="#888" fontSize={12} hide />
                        <YAxis 
                            dataKey="movie" 
                            type="category" 
                            stroke="#fff" 
                            fontSize={13} 
                            width={140} 
                            tickLine={false} 
                            axisLine={false} 
                            tickFormatter={(val) => val.length > 20 ? val.substring(0, 20) + '...' : val}
                        />
                        <RechartsTooltip 
                            cursor={{ fill: "var(--chart-1) / 0.1" }} 
                            content={<ChartTooltipContent indicator="line" hideLabel />} 
                        />
                        <Bar dataKey="favorites" name="Lượt thích" radius={[0, 4, 4, 0]} barSize={32}>
                          {topMoviesData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                          <LabelList dataKey="favorites" position="right" offset={10} className="fill-white font-bold" fontSize={12} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
        )}

        {/* Tab: NGƯỜI DÙNG (Users) */}
        {activeTab === 'users' && (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Area Chart: User Growth */}
              <Card className="lg:col-span-3 bg-[#262626] border-slate-800 text-white">
                <CardHeader>
                  <CardTitle>Xu hướng Đăng ký Mới</CardTitle>
                  <CardDescription>Biểu đồ vùng thể hiện lượng người dùng tham gia hệ thống.</CardDescription>
                </CardHeader>
                <CardContent>
                   <ChartContainer config={chartConfig} className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trendData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-users)" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="var(--color-users)" stopOpacity={0.05}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} vertical={false} />
                        <XAxis dataKey="label" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Area 
                            type="monotone" 
                            dataKey="users" 
                            name="Người dùng"
                            strokeWidth={3} 
                            stroke="var(--color-users)" 
                            fill="url(#colorUsers)" 
                            dot={{ r: 4, fill: "#1a1b1f", strokeWidth: 2, stroke: "var(--color-users)" }}
                            activeDot={{ r: 6, fill: "var(--color-users)" }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
        
              {/* Bar Chart: Top Active Users */}
              <Card className="lg:col-span-2 bg-[#262626] border-slate-800 text-white">
                <CardHeader>
                  <CardTitle>Người dùng Tích cực nhất</CardTitle>
                  <CardDescription>Xếp hạng theo số lượng bình luận đã đăng.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={topUsersData} layout="horizontal" margin={{ top: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} vertical={false} />
                        <XAxis 
                            dataKey="user" 
                            type="category" 
                            stroke="#FFFFFF" 
                            fontSize={11} 
                            tickLine={false} 
                            axisLine={false}
                            interval={0}
                        />
                        <YAxis type="number" stroke="#888888" fontSize={12} axisLine={false} tickLine={false} />
                        <RechartsTooltip 
                            cursor={{ fill: "var(--chart-5) / 0.1" }} 
                            content={<ChartTooltipContent indicator="line" hideLabel />} 
                        />
                        <Bar dataKey="comments" name="Bình luận" radius={[4, 4, 0, 0]} barSize={40}>
                          {topUsersData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                           <LabelList dataKey="comments" position="top" className="fill-white" fontSize={12} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
        )}
      </div>
    </div>
  );
}