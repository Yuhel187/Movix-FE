"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  FileText, 
  Flag, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Trash2, 
  Filter, 
  Search,
  MessageSquareWarning,
  User,
  MoreHorizontal
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

// --- MOCK DATA ---

type BlogStatus = "PUBLISHED" | "HIDDEN" | "PENDING" | "DRAFT";
type ReportStatus = "PENDING" | "RESOLVED" | "REJECTED";

interface BlogPost {
  id: string;
  title: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  excerpt: string;
  content: string;
  thumbnail?: string;
  images?: string[];
  status: BlogStatus;
  view_count: number;
  report_count: number;
  created_at: string;
}

interface Report {
  id: string;
  target_id: string; // Blog ID
  target_title: string;
  reporter: {
    id: string;
    name: string;
  };
  reason: string;
  status: ReportStatus;
  created_at: string;
}

const MOCK_BLOGS: BlogPost[] = [
  {
    id: "b1",
    title: "Review: Dune Part Two - Kiệt tác điện ảnh",
    author: { id: "u1", name: "Cinephile99" },
    excerpt: "Một trải nghiệm hình ảnh và âm thanh choáng ngợp mà bạn không thể bỏ lỡ tại rạp.",
    content: `Dune: Part Two không chỉ là một bộ phim, nó là một trải nghiệm điện ảnh thuần túy. Denis Villeneuve đã chứng minh ông là một trong những đạo diễn sci-fi vĩ đại nhất thời đại.
    
    Về hình ảnh: Greig Fraser tiếp tục mang đến những khung hình đẹp đến nghẹt thở. Cát vàng Arrakis chưa bao giờ trông hùng vĩ và đáng sợ đến thế.
    
    Về âm thanh: Hans Zimmer tiếp tục làm rung chuyển khán phòng với những bản nhạc nền bi tráng.
    
    Diễn xuất: Timothée Chalamet đã hoàn toàn lột xác từ một chàng trai Paul Atreides ngây thơ thành một Lisan al Gaib đầy quyền năng và đáng sợ. Austin Butler cũng là một điểm sáng với vai Feyd-Rautha.`,
    thumbnail: "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
    images: [
        "https://image.tmdb.org/t/p/w500/8RpDcs6KTProjectwrlmTIVt76.jpg",
        "https://image.tmdb.org/t/p/w500/xZ7tq9a5tq9a5tq9.jpg"
    ],
    status: "PUBLISHED",
    view_count: 1540,
    report_count: 0,
    created_at: "2024-03-10T08:00:00Z",
  },
  {
    id: "b2",
    title: "Tại sao phim Marvel đang đi xuống?",
    author: { id: "u2", name: "MarvelFanboy" },
    excerpt: "Phân tích các lý do khiến MCU mất đi sức hút: Kịch bản yếu, CGI tệ và sự mệt mỏi của khán giả.",
    content: `MCU giai đoạn 4 và 5 đang gặp khủng hoảng nghiêm trọng.
    1. Số lượng hơn chất lượng: Việc ra mắt quá nhiều series Disney+ khiến CGI không được chăm chút kỹ lưỡng (Ví dụ: She-Hulk, Ant-Man 3).
    2. Kịch bản lười biếng: Đa vũ trụ đang bị lạm dụng để giải quyết mọi vấn đề cốt truyện một cách dễ dãi.
    3. Nhân vật thiếu chiều sâu: Các nhân vật mới chưa đủ sức thay thế các tượng đài cũ như Iron Man hay Captain America.`,
    thumbnail: "https://image.tmdb.org/t/p/w500/wwemzKWzjKYJFfCeiB57q3r4Bcm.jpg",
    status: "PUBLISHED",
    view_count: 8500,
    report_count: 5,
    created_at: "2024-03-12T14:30:00Z",
  },
  {
    id: "b3",
    title: "Spoil: Cái kết của Joker 2",
    author: { id: "u3", name: "SpoilerKing" },
    excerpt: "Đừng đọc nếu chưa xem phim. Arthur Fleck đã chết như thế nào?",
    content: `CẢNH BÁO SPOILER CỰC MẠNH!
    
    Ở cuối phim, Arthur Fleck không trở thành biểu tượng tội phạm như phần 1 gợi mở. Thay vào đó, hắn bị một bạn tù đâm chết ngay trong trại giam Arkham. Kẻ đâm hắn sau đó tự rạch miệng mình, ám chỉ hắn mới chính là Joker thực sự mà chúng ta biết trong truyện tranh.
    
    Lady Gaga (Harley Quinn) cũng bỏ rơi Arthur khi nhận ra hắn chỉ là một gã yếu đuối chứ không phải Joker mà cô tôn thờ.`,
    status: "HIDDEN",
    view_count: 200,
    report_count: 12,
    created_at: "2024-03-15T09:15:00Z",
  },
  {
    id: "b4",
    title: "10 bộ phim Hàn Quốc đáng xem nhất 2024",
    author: { id: "u4", name: "KDramaLover" },
    excerpt: "Danh sách tổng hợp các bộ phim drama: Queen of Tears, Exhuma...",
    content: `Năm 2024 là một năm bùng nổ của phim Hàn. Dưới đây là top 10:
    1. Queen of Tears: Kim Soo Hyun và Kim Ji Won quá đẹp đôi.
    2. Exhuma: Phim kinh dị tâm linh xuất sắc nhất năm.
    3. Parasyte: The Grey: Một bản chuyển thể thú vị từ manga Nhật.
    ...`,
    thumbnail: "https://image.tmdb.org/t/p/w500/kDp1vUBnMpe8ak4rjgl3cLELqjU.jpg",
    images: [
        "https://image.tmdb.org/t/p/w500/uQ335GkgM6d2x1z.jpg",
        "https://image.tmdb.org/t/p/w500/qJ2tW6a5z.jpg"
    ],
    status: "PENDING",
    view_count: 0,
    report_count: 0,
    created_at: "2024-03-18T10:00:00Z",
  },
];

const MOCK_REPORTS: Report[] = [
  {
    id: "r1",
    target_id: "b2",
    target_title: "Tại sao phim Marvel đang đi xuống?",
    reporter: { id: "u5", name: "IronManFan" },
    reason: "Bài viết mang tính kích động, xúc phạm cộng đồng fan.",
    status: "PENDING",
    created_at: "2024-03-13T11:00:00Z",
  },
  {
    id: "r2",
    target_id: "b3",
    target_title: "Spoil: Cái kết của Joker 2",
    reporter: { id: "u6", name: "BatmanFan" },
    reason: "Spoil nội dung phim mà không có cảnh báo.",
    status: "PENDING",
    created_at: "2024-03-16T15:20:00Z",
  },
  {
    id: "r3",
    target_id: "b3",
    target_title: "Spoil: Cái kết của Joker 2",
    reporter: { id: "u7", name: "CinemaProtect" },
    reason: "Vi phạm quy tắc cộng đồng về spoil.",
    status: "RESOLVED",
    created_at: "2024-03-16T16:00:00Z",
  },
];

export default function BlogManager() {
  const [activeTab, setActiveTab] = useState("blogs");
  const [blogs, setBlogs] = useState(MOCK_BLOGS);
  const [reports, setReports] = useState(MOCK_REPORTS);
  
  // States to manage interactions
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [reportActionOpen, setReportActionOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [resolutionNote, setResolutionNote] = useState("");

  // Filter States
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Helpers
  const getStatusBadge = (status: BlogStatus) => {
    switch (status) {
      case "PUBLISHED": return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20">Đã đăng</Badge>;
      case "HIDDEN": return <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20">Đã ẩn</Badge>;
      case "PENDING": return <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border-yellow-500/20">Chờ duyệt</Badge>;
      default: return <Badge variant="secondary">Lưu nháp</Badge>;
    }
  };

  const getReportStatusBadge = (status: ReportStatus) => {
    switch (status) {
      case "PENDING": return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Chờ xử lý</Badge>;
      case "RESOLVED": return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Đã giải quyết</Badge>;
      case "REJECTED": return <Badge className="bg-gray-500/10 text-gray-400 border-gray-500/20">Đã từ chối</Badge>;
    }
  };

  // Actions
  const handleUpdateStatus = (blogId: string, newStatus: BlogStatus) => {
    setBlogs(prev => prev.map(b => b.id === blogId ? { ...b, status: newStatus } : b));
    toast.success(`Đã cập nhật trạng thái bài viết thành: ${newStatus}`);
    setViewDialogOpen(false);
  };

  const handleResolveReport = (reportId: string, action: "RESOLVE" | "REJECT") => {
    // In a real app, this would also likely trigger an action on the blog itself (e.g., Hide it)
    setReports(prev => prev.map(r => r.id === reportId ? { 
        ...r, 
        status: action === "RESOLVE" ? "RESOLVED" : "REJECTED" 
    } : r));
    
    toast.success(action === "RESOLVE" ? "Đã xử lý báo cáo" : "Đã từ chối báo cáo");
    setReportActionOpen(false);
    setSelectedReport(null);
  };

  // Filter logic
  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          blog.author.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || blog.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingReports = reports.filter(r => r.status === "PENDING");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-3xl font-bold tracking-tight text-white/90">Quản lý Blog & Đánh giá</h2>
           <p className="text-gray-400 mt-1">Duyệt bài viết của cộng đồng và xử lý các báo cáo vi phạm.</p>
        </div>
      </div>

      <Tabs defaultValue="blogs" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-[#1F1F1F] border-slate-800">
          <TabsTrigger value="blogs" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            <FileText className="h-4 w-4 mr-2" />
            Danh sách bài viết
          </TabsTrigger>
          <TabsTrigger value="reports" className="data-[state=active]:bg-red-600 data-[state=active]:text-white relative">
            <Flag className="h-4 w-4 mr-2" />
            Báo cáo vi phạm
            {pendingReports.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                    {pendingReports.length}
                </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* --- BLOGS TAB --- */}
        <TabsContent value="blogs" className="space-y-4">
            <Card className="bg-[#1F1F1F] border-slate-800 text-white">
                <CardHeader className="pb-3">
                    <div className="flex md:flex-row flex-col gap-4 justify-between">
                        <div className="relative w-full md:w-1/3">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                            <Input
                                placeholder="Tìm theo tiêu đề, tác giả..."
                                className="pl-9 bg-[#262626] border-slate-700 focus:border-purple-500"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                             <Filter className="h-4 w-4 text-gray-400" />
                             <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[180px] bg-[#262626] border-slate-700">
                                    <SelectValue placeholder="Trạng thái" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#262626] border-slate-700 text-white">
                                    <SelectItem value="ALL">Tất cả</SelectItem>
                                    <SelectItem value="PUBLISHED">Đã đăng</SelectItem>
                                    <SelectItem value="PENDING">Chờ duyệt</SelectItem>
                                    <SelectItem value="HIDDEN">Đã ẩn</SelectItem>
                                </SelectContent>
                             </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader className="bg-[#141414] hover:bg-[#141414]">
                            <TableRow className="border-slate-800 hover:bg-[#141414]">
                                <TableHead className="text-gray-400">Tiêu đề / Tóm tắt</TableHead>
                                <TableHead className="text-gray-400">Tác giả</TableHead>
                                <TableHead className="text-gray-400">Trạng thái</TableHead>
                                <TableHead className="text-gray-400 text-center">Báo cáo</TableHead>
                                <TableHead className="text-gray-400">Ngày tạo</TableHead>
                                <TableHead className="text-gray-400 text-right">Hành động</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredBlogs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-24 text-gray-500">
                                        Không tìm thấy bài viết nào.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredBlogs.map((blog) => (
                                    <TableRow key={blog.id} className="border-slate-800 hover:bg-[#262626]/50">
                                        <TableCell className="max-w-[300px]">
                                            <div className="font-medium text-white truncate" title={blog.title}>{blog.title}</div>
                                            <div className="text-xs text-gray-500 truncate">{blog.excerpt}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="h-6 w-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs text-purple-400">
                                                    {blog.author.name[0]}
                                                </div>
                                                <span className="text-gray-300 text-sm">{blog.author.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{getStatusBadge(blog.status)}</TableCell>
                                        <TableCell className="text-center">
                                            {blog.report_count > 0 ? (
                                                 <Badge variant="outline" className="border-red-500/50 text-red-400 bg-red-500/10">
                                                    {blog.report_count}
                                                 </Badge>
                                            ) : (
                                                <span className="text-gray-600">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-gray-400 text-sm">
                                            {format(new Date(blog.created_at), "dd/MM/yyyy", { locale: vi })}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button 
                                                    size="icon" 
                                                    variant="ghost" 
                                                    className="h-8 w-8 text-gray-400 hover:text-white hover:bg-slate-700"
                                                    onClick={() => {
                                                        setSelectedBlog(blog);
                                                        setViewDialogOpen(true);
                                                    }}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                {/* More actions could go here */}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>

        {/* --- REPORTS TAB --- */}
        <TabsContent value="reports" className="space-y-4">
             <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                {/* Pending Stat Card */}
                <Card className="bg-[#1F1F1F] border-slate-800 p-6 flex flex-col items-center justify-center gap-3 text-center hover:bg-[#262626] transition-colors relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 z-10">
                        <Flag className="h-6 w-6" />
                    </div>
                    <div className="z-10">
                        <div className="text-3xl font-bold text-white mb-1">{pendingReports.length}</div>
                        <div className="text-sm text-gray-400 font-medium">Báo cáo chờ xử lý</div>
                    </div>
                </Card>

                {/* Resolved Stat Card */}
                <Card className="bg-[#1F1F1F] border-slate-800 p-6 flex flex-col items-center justify-center gap-3 text-center hover:bg-[#262626] transition-colors relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-600/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 z-10">
                        <CheckCircle className="h-6 w-6" />
                    </div>
                    <div className="z-10">
                        <div className="text-3xl font-bold text-white mb-1">
                            {reports.filter(r => r.status === "RESOLVED").length}
                        </div>
                        <div className="text-sm text-gray-400 font-medium">Đã giải quyết</div>
                    </div>
                </Card>

                {/* Rejected Stat Card */}
                <Card className="bg-[#1F1F1F] border-slate-800 p-6 flex flex-col items-center justify-center gap-3 text-center hover:bg-[#262626] transition-colors relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-600/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="h-12 w-12 rounded-full bg-gray-500/10 flex items-center justify-center text-gray-400 z-10">
                        <XCircle className="h-6 w-6" />
                    </div>
                    <div className="z-10">
                        <div className="text-3xl font-bold text-white mb-1">
                            {reports.filter(r => r.status === "REJECTED").length}
                        </div>
                        <div className="text-sm text-gray-400 font-medium">Đã từ chối</div>
                    </div>
                </Card>

                {/* Total Stat Card */}
                <Card className="bg-[#1F1F1F] border-slate-800 p-6 flex flex-col items-center justify-center gap-3 text-center hover:bg-[#262626] transition-colors relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500 z-10">
                        <FileText className="h-6 w-6" />
                    </div>
                    <div className="z-10">
                        <div className="text-3xl font-bold text-white mb-1">{reports.length}</div>
                        <div className="text-sm text-gray-400 font-medium">Tổng số báo cáo</div>
                    </div>
                </Card>
             </div>

             <Card className="bg-[#1F1F1F] border-slate-800 text-white">
                <CardHeader>
                    <CardTitle className="text-lg">Danh sách báo cáo vi phạm</CardTitle>
                    <CardDescription className="text-gray-400">Xử lý các báo cáo từ người dùng về nội dung cộng đồng.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader className="bg-[#141414]">
                             <TableRow className="border-slate-800">
                                <TableHead className="text-gray-400">Nội dung bị báo cáo</TableHead>
                                <TableHead className="text-gray-400">Người báo cáo</TableHead>
                                <TableHead className="text-gray-400">Lý do</TableHead>
                                <TableHead className="text-gray-400">Trạng thái</TableHead>
                                <TableHead className="text-gray-400">Ngày báo cáo</TableHead>
                                <TableHead className="text-gray-400 text-right">Hành động</TableHead>
                             </TableRow>
                        </TableHeader>
                        <TableBody>
                             {reports.map((report) => (
                                 <TableRow key={report.id} className="border-slate-800 hover:bg-[#262626]/50">
                                     <TableCell>
                                         <div className="font-medium text-purple-400 hover:underline cursor-pointer">
                                            {report.target_title}
                                         </div>
                                         <div className="text-xs text-gray-500">ID: {report.target_id}</div>
                                     </TableCell>
                                     <TableCell>
                                         <div className="flex items-center gap-2">
                                             <User className="h-4 w-4 text-gray-500" />
                                             <span className="text-sm">{report.reporter.name}</span>
                                         </div>
                                     </TableCell>
                                     <TableCell className="max-w-[200px] truncate" title={report.reason}>
                                         {report.reason}
                                     </TableCell>
                                     <TableCell>{getReportStatusBadge(report.status)}</TableCell>
                                     <TableCell className="text-gray-400 text-sm">
                                         {format(new Date(report.created_at), "dd/MM/yyyy HH:mm", { locale: vi })}
                                     </TableCell>
                                     <TableCell className="text-right">
                                         {report.status === "PENDING" && (
                                             <Button 
                                                variant="outline" 
                                                size="sm"
                                                className="border-purple-600 text-purple-400 hover:bg-purple-600/10"
                                                onClick={() => {
                                                    setSelectedReport(report);
                                                    setReportActionOpen(true);
                                                }}
                                             >
                                                Xử lý
                                             </Button>
                                         )}
                                     </TableCell>
                                 </TableRow>
                             ))}
                        </TableBody>
                    </Table>
                </CardContent>
             </Card>
        </TabsContent>
      </Tabs>

      {/* --- VIEW BLOG DIALOG --- */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="bg-[#1F1F1F] border-slate-800 text-white max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0">
            {selectedBlog && (
                <>
                    <DialogHeader className="sr-only">
                        <DialogTitle>{selectedBlog.title}</DialogTitle>
                        <DialogDescription>Chi tiết bài viết {selectedBlog.title}</DialogDescription>
                    </DialogHeader>

                    {/* Cover Image */}
                    <div className="relative h-64 w-full bg-slate-900 overflow-hidden">
                        {selectedBlog.thumbnail ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img 
                                src={selectedBlog.thumbnail} 
                                alt={selectedBlog.title} 
                                className="w-full h-full object-cover opacity-80"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-800 text-gray-500">
                                Không có ảnh bìa
                            </div>
                        )}
                        <div className="absolute top-4 left-4 z-10">
                            {getStatusBadge(selectedBlog.status)}
                        </div>
                    </div>

                    <div className="p-6 md:p-8 space-y-6">
                        {/* Header Info */}
                        <div>
                            <h2 className="text-3xl font-bold leading-tight mb-4 text-white">{selectedBlog.title}</h2>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 border-b border-slate-800 pb-6">
                                <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-full bg-purple-500/20 flex items-center justify-center text-sm text-purple-400 font-bold border border-purple-500/30">
                                        {selectedBlog.author.name[0]}
                                    </div>
                                    <span className="text-white font-medium text-base">{selectedBlog.author.name}</span>
                                </div>
                                <span className="hidden sm:inline">•</span>
                                <span>{format(new Date(selectedBlog.created_at), "dd 'tháng' MM, yyyy", { locale: vi })}</span>
                                <span className="hidden sm:inline">•</span>
                                <div className="flex items-center gap-1.5 bg-slate-800 px-2 py-1 rounded text-xs">
                                    <Eye className="h-3 w-3" />
                                    <span>{selectedBlog.view_count} lượt xem</span>
                                </div>
                            </div>
                        </div>

                        {/* Content Body */}
                        <div className="space-y-6">
                            <div className="text-gray-300 leading-relaxed whitespace-pre-line text-lg font-light">
                                {selectedBlog.content || selectedBlog.excerpt}
                            </div>
                            
                            {/* Attached Images Gallery */}
                            {selectedBlog.images && selectedBlog.images.length > 0 && (
                                <div className="space-y-3 pt-4 border-t border-slate-800">
                                    <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                        <FileText className="h-4 w-4" />
                                        Hình ảnh đính kèm ({selectedBlog.images.length})
                                    </h4>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {selectedBlog.images.map((img, idx) => (
                                            <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border border-slate-700 group cursor-pointer hover:border-purple-500 transition-colors">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img 
                                                    src={img} 
                                                    alt={`Attachment ${idx}`} 
                                                    className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer Actions */}
                        <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-slate-800 gap-4">
                             <Button variant="ghost" onClick={() => setViewDialogOpen(false)} className="w-full sm:w-auto hover:bg-slate-800 text-gray-400 hover:text-white">
                                Đóng lại
                             </Button>
                             <div className="flex gap-3 w-full sm:w-auto">
                                {selectedBlog.status === "PENDING" && (
                                     <Button 
                                        className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white font-medium"
                                        onClick={() => handleUpdateStatus(selectedBlog.id, "PUBLISHED")}
                                     >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Duyệt bài viết
                                     </Button>
                                )}
                                {selectedBlog.status !== "HIDDEN" && (
                                    <Button 
                                        variant="destructive"
                                        className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 font-medium"
                                        onClick={() => handleUpdateStatus(selectedBlog.id, "HIDDEN")}
                                    >
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Ẩn bài viết
                                    </Button>
                                )}
                                {selectedBlog.status === "HIDDEN" && (
                                    <Button 
                                        className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white font-medium"
                                        onClick={() => handleUpdateStatus(selectedBlog.id, "PUBLISHED")}
                                    >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Khôi phục bài mới
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </DialogContent>
      </Dialog>

      {/* --- REPORT ACTION DIALOG --- */}
       <AlertDialog open={reportActionOpen} onOpenChange={setReportActionOpen}>
        <AlertDialogContent className="bg-[#1F1F1F] border-slate-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Xử lý báo cáo vi phạm</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Bạn đang xử lý báo cáo về bài viết: <b>{selectedReport?.target_title}</b>.
              <br/>
              Lý do báo cáo: <i>"{selectedReport?.reason}"</i>
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="py-4">
              <label className="text-sm font-medium mb-2 block">Ghi chú xử lý (Tùy chọn)</label>
              <Textarea 
                placeholder="Nhập lý do xử lý hoặc từ chối..." 
                className="bg-[#262626] border-slate-700 text-white"
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
              />
          </div>

          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="bg-transparent border-slate-700 text-gray-300 hover:bg-[#262626] hover:text-white mt-0">Hủy bỏ</AlertDialogCancel>
            <div className="flex gap-2 w-full sm:w-auto">
                <Button 
                    variant="outline" 
                    className="flex-1 sm:flex-none border-red-500/50 text-red-500 hover:bg-red-500/10 hover:text-red-400"
                    onClick={() => selectedReport && handleResolveReport(selectedReport.id, "REJECT")}
                >
                    Từ chối báo cáo
                </Button>
                <Button 
                    className="flex-1 sm:flex-none bg-purple-600 hover:bg-purple-700 text-white"
                    onClick={() => selectedReport && handleResolveReport(selectedReport.id, "RESOLVE")}
                >
                    Đã xử lý xong
                </Button>
            </div>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}