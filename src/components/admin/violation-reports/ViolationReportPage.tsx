'use client';

import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Loader2,
  Filter,
  Eye
} from "lucide-react";
import { adminReportService } from "@/services/admin.report.service";
import { Report, ReportStatus, ReportTargetType } from "@/types/report";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function ViolationReportPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const [filterStatus, setFilterStatus] = useState<ReportStatus | 'ALL'>('ALL');
  const [filterTarget, setFilterTarget] = useState<ReportTargetType | 'ALL'>('ALL');

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {
        page: pagination.page,
        limit: pagination.limit,
      };

      if (filterStatus !== 'ALL') params.status = filterStatus;
      if (filterTarget !== 'ALL') params.targetType = filterTarget;

      const res = await adminReportService.getAllReports(params) as any;
      
      const rawReports = res.reports || res.data?.reports || res.data?.data || [];
      const mappedReports = rawReports.map((r: any) => ({
        ...r,
        reporterId: r.reporter_id || r.reporterId,
        targetType: r.target_type || r.targetType,
        targetId: r.target_id || r.targetId,
        createdAt: r.created_at || r.createdAt,
        targetData: r.targetData,
      }));

      setReports(mappedReports);
      setPagination({
        page: params.page,
        limit: params.limit,
        total: res.total || res.data?.total || 0,
        totalPages: res.totalPages || res.data?.totalPages || 1,
      });
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Lỗi khi tải danh sách báo cáo');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filterStatus, filterTarget]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Reset page when filters change
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [filterStatus, filterTarget]);

  const handleUpdateStatus = async (id: string, newStatus: ReportStatus) => {
    try {
      setUpdatingId(id);
      await adminReportService.updateReportStatus(id, newStatus);
      toast.success('Cập nhật trạng thái báo cáo thành công!');
      
      setReports(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
    } catch (error) {
      toast.error('Lỗi khi cập nhật trạng thái');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: ReportStatus) => {
    switch (status) {
      case ReportStatus.PENDING:
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Chờ xử lý</Badge>;
      case ReportStatus.RESOLVED:
        return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">Đã xử lý</Badge>;
      case ReportStatus.REJECTED:
        return <Badge variant="outline" className="bg-gray-500/10 text-gray-500 border-gray-500/20">Đã từ chối</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTargetBadge = (target: ReportTargetType) => {
    switch (target) {
      case ReportTargetType.COMMENT:
        return <Badge variant="secondary">Bình luận</Badge>;
      case ReportTargetType.USER:
        return <Badge variant="secondary" className="bg-blue-500/10 text-blue-400">Người dùng</Badge>;
      case ReportTargetType.BLOG:
        return <Badge variant="secondary" className="bg-purple-500/10 text-purple-400">Bài viết</Badge>;
      case ReportTargetType.WATCH_PARTY:
        return <Badge variant="secondary" className="bg-orange-500/10 text-orange-400">Phòng xem chung</Badge>;
    }
  };

  return (
    <div className="flex flex-col h-full w-full space-y-4 text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-red-500" />
            Quản lý Báo cáo Vi phạm
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Quản lý và xử lý các báo cáo vi phạm từ cộng đồng.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#1f1f1f] p-1 rounded-md border border-slate-800">
            <Filter className="h-4 w-4 text-gray-400 ml-2" />
            <Select 
              value={filterTarget} 
              onValueChange={(val: any) => setFilterTarget(val)}
            >
              <SelectTrigger className="w-[140px] border-0 bg-transparent text-gray-300 focus:ring-0">
                <SelectValue placeholder="Đối tượng" />
              </SelectTrigger>
              <SelectContent className="bg-[#262626] border-slate-700 text-white">
                <SelectItem value="ALL">Tất cả đối tượng</SelectItem>
                <SelectItem value={ReportTargetType.COMMENT}>Bình luận</SelectItem>
                <SelectItem value={ReportTargetType.USER}>Người dùng</SelectItem>
                <SelectItem value={ReportTargetType.BLOG}>Bài viết</SelectItem>
                <SelectItem value={ReportTargetType.WATCH_PARTY}>Phòng xem chung</SelectItem>
              </SelectContent>
            </Select>

            <span className="w-px h-6 bg-slate-700"></span>

            <Select 
              value={filterStatus} 
              onValueChange={(val: any) => setFilterStatus(val)}
            >
              <SelectTrigger className="w-[130px] border-0 bg-transparent text-gray-300 focus:ring-0">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent className="bg-[#262626] border-slate-700 text-white">
                <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                <SelectItem value={ReportStatus.PENDING}>Chờ xử lý</SelectItem>
                <SelectItem value={ReportStatus.RESOLVED}>Đã xử lý</SelectItem>
                <SelectItem value={ReportStatus.REJECTED}>Đã từ chối</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Card className="flex-grow overflow-hidden bg-[#262626] border-slate-800 text-white flex flex-col">
        <CardContent className="p-0 flex-1 overflow-hidden flex flex-col relative">
          <div className="flex-1 overflow-y-auto no-scrollbar relative min-h-[400px]">
            {loading && (
              <div className="absolute inset-0 bg-[#262626]/50 backdrop-blur-sm z-10 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
              </div>
            )}
            
            <Table className="w-full relative">
              <TableHeader className="sticky top-0 bg-[#262626] z-10 border-b border-slate-700">
                <TableRow className="border-slate-700 hover:bg-transparent">
                  <TableHead className="text-white w-[100px] pl-4">ID</TableHead>
                  <TableHead className="text-white">Người báo cáo</TableHead>
                  <TableHead className="text-white">Đối tượng</TableHead>
                  <TableHead className="text-white">Lý do</TableHead>
                  <TableHead className="text-white">Thời gian</TableHead>
                  <TableHead className="text-white">Trạng thái</TableHead>
                  <TableHead className="text-white text-right pr-4">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.length === 0 && !loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-gray-400">
                      Không tìm thấy báo cáo nào
                    </TableCell>
                  </TableRow>
                ) : (
                  reports.map((report: any) => (
                    <TableRow key={report.id} className="border-slate-800 hover:bg-slate-700/40 transition-colors">
                      <TableCell className="font-mono text-xs text-gray-400 pl-4">
                        {report.id.substring(0, 8)}...
                      </TableCell>
                      <TableCell>
                        {report.reporter ? (
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-white">{report.reporter.display_name}</span>
                            <span className="text-xs text-gray-500">{report.reporter.email}</span>
                          </div>
                        ) : (
                          <span className="text-sm font-medium text-gray-400">#{report.reporterId?.substring(0, 8)}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 items-start">
                          {getTargetBadge(report.targetType)}
                          {report.targetData ? (
                            report.targetType === ReportTargetType.COMMENT ? (
                              <span className="text-xs text-gray-400 max-w-[150px] truncate" title={report.targetData.comment}>
                                "{report.targetData.comment}"
                              </span>
                            ) : report.targetType === ReportTargetType.USER ? (
                              <span className="text-xs text-gray-400 max-w-[150px] truncate" title={report.targetData.display_name}>
                                @{report.targetData.display_name}
                              </span>
                            ) : (
                               <span className="text-xs text-gray-500 max-w-[150px] truncate font-mono">
                                 ID: {report.targetId}
                               </span>
                            )
                          ) : (
                            <span className="text-xs text-gray-500 max-w-[150px] truncate font-mono">
                              ID: {report.targetId}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[250px]">
                        <p className="text-sm text-gray-300 truncate" title={report.reason}>
                          {report.reason}
                        </p>
                      </TableCell>
                      <TableCell className="text-sm text-gray-400">
                        {format(new Date(report.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(report.status)}
                      </TableCell>
                      <TableCell className="text-right space-x-2 pr-4">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white hover:bg-slate-800" title="Chi tiết">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[500px] bg-[#1f1f1f] text-white border-slate-700">
                            <DialogHeader>
                              <DialogTitle className="text-white">Chi tiết báo cáo vi phạm</DialogTitle>
                              <DialogDescription className="text-gray-400">
                                Thông tin đầy đủ về báo cáo và đối tượng bị báo cáo.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4 text-sm">
                              <div className="grid grid-cols-4 items-center gap-4">
                                <span className="text-slate-400 font-medium">Trạng thái:</span>
                                <div className="col-span-3">{getStatusBadge(report.status)}</div>
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <span className="text-gray-400 font-medium">Loại / ID:</span>
                                <div className="col-span-3 flex items-center gap-2">
                                  {getTargetBadge(report.targetType)}
                                  <span className="font-mono text-gray-300 bg-slate-800/50 border border-slate-700 px-2 py-1 rounded text-xs truncate max-w-[150px]">
                                    {report.targetId}
                                  </span>
                                </div>
                              </div>
                              {report.targetData && (
                                <div className="grid grid-cols-4 gap-4">
                                  <span className="text-gray-400 font-medium pt-1">Nội dung bị báo cáo:</span>
                                  <div className="col-span-3 bg-red-950/30 border border-red-900/50 rounded p-3 text-gray-200 min-h-[60px] text-sm">
                                    {report.targetType === ReportTargetType.COMMENT && (
                                      <div className="flex flex-col gap-1">
                                        {report.targetData.movie && (
                                           <span className="text-xs text-blue-400 font-medium mb-1">
                                             Phim: {report.targetData.movie.title}
                                           </span>
                                        )}
                                        <p className="italic">"{report.targetData.comment}"</p>
                                      </div>
                                    )}
                                    {report.targetType === ReportTargetType.USER && (
                                      <div className="flex items-center gap-2">
                                        <img src={report.targetData.avatar_url || '/images/placeholder-avatar.png'} alt="avatar" className="w-8 h-8 rounded-full" />
                                        <div>
                                          <p className="font-medium text-white">{report.targetData.display_name}</p>
                                          <p className="text-xs text-gray-400">{report.targetData.email}</p>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                              <div className="grid grid-cols-4 gap-4">
                                <span className="text-gray-400 font-medium pt-1">Lý do:</span>
                                <div className="col-span-3 bg-[#262626] border border-slate-700 rounded p-3 text-gray-300 min-h-[80px]">
                                  {report.reason}
                                </div>
                              </div>
                              <div className="grid grid-cols-4 gap-4 mt-2 items-center">
                                <span className="text-gray-400 font-medium">Người gửi:</span>
                                <span className="col-span-3 text-gray-300">
                                  {report.reporter ? (
                                    <div className="flex items-center gap-2">
                                      <img src={report.reporter.avatar_url || '/images/placeholder-avatar.png'} alt="user" className="w-6 h-6 rounded-full bg-slate-800" />
                                      <span>{report.reporter.display_name} ({report.reporter.email})</span>
                                    </div>
                                  ) : (
                                    report.reporterId
                                  )}
                                </span>
                              </div>
                              <div className="grid grid-cols-4 gap-4">
                                <span className="text-gray-400 font-medium">Ngày gửi:</span>
                                <span className="col-span-3 text-gray-300">
                                  {format(new Date(report.createdAt), 'dd MMMM yyyy, HH:mm', { locale: vi })}
                                </span>
                              </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-slate-700">
                              {report.status !== ReportStatus.RESOLVED && (
                                <Button 
                                  onClick={() => handleUpdateStatus(report.id, ReportStatus.RESOLVED)}
                                  disabled={updatingId === report.id}
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  {updatingId === report.id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                                  Đánh dấu: Đã xử lý
                                </Button>
                              )}
                              {report.status !== ReportStatus.REJECTED && (
                                <Button 
                                  variant="outline" 
                                  onClick={() => handleUpdateStatus(report.id, ReportStatus.REJECTED)}
                                  disabled={updatingId === report.id}
                                  className="text-gray-300 hover:text-white border-slate-700 bg-transparent hover:bg-slate-800"
                                >
                                  {updatingId === report.id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <XCircle className="h-4 w-4 mr-2" />}
                                  Từ chối
                                </Button>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-700 bg-[#262626] flex-shrink-0">
              <div className="text-sm text-gray-400">
                Hiển thị trang {pagination.page} / {pagination.totalPages} ({pagination.total} kết quả)
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page <= 1}
                  className="bg-transparent border-slate-700 text-gray-300 hover:text-white hover:bg-slate-800"
                >
                  Trước
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page >= pagination.totalPages}
                  className="bg-transparent border-slate-700 text-gray-300 hover:text-white hover:bg-slate-800"
                >
                  Sau
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
