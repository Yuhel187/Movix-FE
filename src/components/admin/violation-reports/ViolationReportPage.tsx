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
  Eye,
  Lock
} from "lucide-react";
import { adminReportService } from "@/services/admin.report.service";
import apiClient from "@/lib/apiClient";
import { Report, ReportStatus, ReportTargetType } from "@/types/report";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const ViolationReportDialog = ({ report, handleUpdateStatus, handleBanUser, updatingId }: any) => {
  const [commentDetails, setCommentDetails] = useState<any>(null);
  const [loadingComment, setLoadingComment] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchCommentDetails = async () => {
      if (open && report.targetType === ReportTargetType.COMMENT && report.targetId) {
        if (isMounted) setLoadingComment(true);
        try {
          const res = await apiClient.get(`/comments/admin/${report.targetId}`);
          let data = res.data;
          
          if (data && data.user_id && !data.user) {
            try {
              const userRes = await apiClient.get(`/profile/admin/users/${data.user_id}`);
              data = { ...data, user: userRes.data };
            } catch (err) {
              console.error("Lỗi khi lấy thông tin người dùng của bình luận:", err);
            }
          }
          
          if (isMounted) setCommentDetails(data);
        } catch (error) {
          console.error("Lỗi khi lấy thông tin bình luận:", error);
        } finally {
          if (isMounted) setLoadingComment(false);
        }
      }
    };
    fetchCommentDetails();
    return () => { isMounted = false; };
  }, [open, report]);

  const tUserId = report.targetType === ReportTargetType.USER 
    ? report.targetId 
    : (commentDetails?.user_id || commentDetails?.userId || commentDetails?.user?.id || report.targetData?.user_id || report.targetData?.userId || report.targetData?.user?.id || report.targetData?.author_id || report.targetData?.author?.id);

  const commentUser = commentDetails?.user || report.targetData?.user || report.targetData?.user_info || report.targetData?.author;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
        <div className="grid gap-4 py-4 text-sm max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-slate-400 font-medium">Trạng thái:</span>
            <div className="col-span-3">
               {report.status === ReportStatus.PENDING && <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Chờ xử lý</Badge>}
               {report.status === ReportStatus.RESOLVED && <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">Đã xử lý</Badge>}
               {report.status === ReportStatus.REJECTED && <Badge variant="outline" className="bg-gray-500/10 text-gray-500 border-gray-500/20">Đã từ chối</Badge>}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-gray-400 font-medium">Loại / ID:</span>
            <div className="col-span-3 flex items-center gap-2 overflow-hidden">
              {report.targetType === ReportTargetType.COMMENT && <Badge variant="secondary">Bình luận</Badge>}
              {report.targetType === ReportTargetType.USER && <Badge variant="secondary" className="bg-blue-500/10 text-blue-400">Người dùng</Badge>}
              <span className="font-mono text-gray-300 bg-slate-800/50 border border-slate-700 px-2 py-1 rounded text-xs truncate max-w-full">
                {report.targetId}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <span className="text-gray-400 font-medium pt-1">Nội dung bị báo cáo:</span>
            <div className="col-span-3 bg-red-950/30 border border-red-900/50 rounded p-3 text-gray-200 text-sm overflow-hidden">
              {report.targetType === ReportTargetType.COMMENT && (
                <div className="flex flex-col gap-2">
                  {report.targetData?.movie && (
                      <span className="text-xs text-blue-400 font-medium pb-1 border-b border-red-900/30 truncate">
                        Phim: {report.targetData.movie.title}
                      </span>
                  )}
                  {loadingComment ? (
                    <div className="flex items-center gap-2 text-xs text-gray-400 py-2">
                      <Loader2 className="h-3 w-3 animate-spin"/> Đang tải thông tin người dùng...
                    </div>
                  ) : (
                    commentUser && tUserId && (
                      <div className="flex items-center justify-between bg-black/20 p-2 rounded">
                        <div className="flex items-center gap-2">
                          <img src={commentUser?.avatar_url || '/images/placeholder-avatar.png'} alt="user" className="w-6 h-6 rounded-full" />
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-white">{commentUser?.display_name || 'Người dùng ẩn danh'}</span>
                            <span className="text-[10px] text-gray-500">ID: {tUserId}</span>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                  <p className="italic text-gray-300 bg-black/40 p-2 rounded mt-1 border-l-2 border-red-500 break-words">
                    "{commentDetails?.comment || report.targetData?.comment}"
                  </p>
                </div>
              )}
              {report.targetType === ReportTargetType.USER && report.targetData && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <img src={report.targetData.avatar_url || '/images/placeholder-avatar.png'} alt="avatar" className="w-8 h-8 rounded-full flex-shrink-0" />
                    <div className="overflow-hidden">
                      <p className="font-medium text-white truncate">{report.targetData.display_name}</p>
                      <p className="text-xs text-gray-400 truncate">{report.targetData.email}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <span className="text-gray-400 font-medium pt-1">Lý do:</span>
            <div className="col-span-3 bg-[#262626] border border-slate-700 rounded p-3 text-gray-300 min-h-[80px] break-words">
              {report.reason}
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4 mt-2 items-center">
            <span className="text-gray-400 font-medium">Người gửi:</span>
            <span className="col-span-3 text-gray-300 truncate">
              {report.reporter ? (
                <div className="flex items-center gap-2 truncate">
                  <img src={report.reporter.avatar_url || '/images/placeholder-avatar.png'} alt="user" className="w-6 h-6 rounded-full bg-slate-800 flex-shrink-0" />
                  <span className="truncate">{report.reporter.display_name} ({report.reporter.email})</span>
                </div>
              ) : (
                <span className="truncate">{report.reporterId}</span>
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
          {tUserId ? (
            <Button 
              variant="destructive" 
              onClick={() => handleBanUser(tUserId, report.id)}
              disabled={updatingId === `ban-${tUserId}` || report.status !== ReportStatus.PENDING || commentUser?.status === "locked"}
              className="bg-red-600 hover:bg-red-700 text-white mr-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updatingId === `ban-${tUserId}` ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Lock className="h-4 w-4 mr-2" />}
              {commentUser?.status === "locked" ? "User đã bị khoá" : "Khoá User này"}
            </Button>
          ) : (
            <Button 
              variant="destructive" 
              disabled={true}
              className="bg-red-600/50 text-white/50 mr-auto cursor-not-allowed"
              title="Đang tìm kiếm thông tin người dùng..."
            >
              <Lock className="h-4 w-4 mr-2" />
              Khoá User này
            </Button>
          )}

          <Button 
            onClick={() => handleUpdateStatus(report.id, ReportStatus.RESOLVED)}
            disabled={updatingId === report.id || report.status === ReportStatus.RESOLVED}
            className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updatingId === report.id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
            {report.status === ReportStatus.RESOLVED ? 'Đã xử lý' : 'Đánh dấu: Đã xử lý'}
          </Button>
          
          {report.status !== ReportStatus.RESOLVED && (
            <Button 
              variant="outline" 
              onClick={() => handleUpdateStatus(report.id, ReportStatus.REJECTED)}
              disabled={updatingId === report.id || report.status === ReportStatus.REJECTED}
              className="text-gray-300 hover:text-white border-slate-700 bg-transparent hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updatingId === report.id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <XCircle className="h-4 w-4 mr-2" />}
              Từ chối
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

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

  const handleBanUser = async (userId: string, reportId: string) => {
    try {
      setUpdatingId(`ban-${userId}`);
      await apiClient.put(`/profile/admin/users/${userId}/status`, { status: "locked" });
      toast.success('Đã khoá tài khoản người dùng!');
      await handleUpdateStatus(reportId, ReportStatus.RESOLVED);
    } catch (error) {
      console.error('Lỗi khi khoá user:', error);
      toast.error('Lỗi khi khoá tài khoản. Vui lòng thử lại sau.');
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
                        <ViolationReportDialog 
                          report={report} 
                          handleUpdateStatus={handleUpdateStatus} 
                          handleBanUser={handleBanUser} 
                          updatingId={updatingId} 
                        />
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
