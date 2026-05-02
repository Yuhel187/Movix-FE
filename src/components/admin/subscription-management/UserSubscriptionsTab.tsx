import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  Search,
  Ban,
  CheckCircle,
  PlusCircle,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import apiClient from "@/lib/apiClient";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { subscriptionService } from "@/services/subscription.service";

const formatDate = (dateString: string) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

export default function UserSubscriptionsTab({
  filterPlanId,
}: {
  filterPlanId?: string;
}) {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [activePlanFilter, setActivePlanFilter] = useState<string | "all">(
    filterPlanId || "all",
  );
  const [isGrantDialogOpen, setIsGrantDialogOpen] = useState(false);
  const [grantUserId, setGrantUserId] = useState("");
  const [grantPlanId, setGrantPlanId] = useState("");
  const [availablePlans, setAvailablePlans] = useState<any[]>([]);
  const [grantLoading, setGrantLoading] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearchingUser, setIsSearchingUser] = useState(false);
  const [isUserComboboxOpen, setIsUserComboboxOpen] = useState(false);

  useEffect(() => {
    setActivePlanFilter(filterPlanId || "all");
  }, [filterPlanId]);

  const searchUsers = async (q: string) => {
    if (!q) {
      setSearchResults([]);
      return;
    }
    setIsSearchingUser(true);
    try {
      const res = await apiClient.get(`/profile/admin/users?q=${q}&take=10`);
      setSearchResults(res.data.data || []);
    } catch (e) {
      console.error("Lỗi khi tìm user", e);
    } finally {
      setIsSearchingUser(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      searchUsers(userSearchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [userSearchQuery]);

  const fetchUserSubscriptions = async () => {
    try {
      setLoading(true);
      const planToFetch =
        activePlanFilter === "all" ? undefined : activePlanFilter;
      const data = await subscriptionService.getAllSubscriptions(
        page,
        10,
        undefined,
        planToFetch,
      );
      setSubscriptions(data.data);
      setTotal(data.meta.totalPages);
    } catch (error) {
      toast.error("Lỗi khi lấy danh sách đăng ký");
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const data = await subscriptionService.getAllPlans();
      setAvailablePlans(data);
    } catch {
    }
  };

  useEffect(() => {
    fetchUserSubscriptions();
  }, [page, activePlanFilter]);

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleGrantSubscription = async () => {
    if (!grantUserId || !grantPlanId) {
      toast.error("Vui lòng nhập ID User và chọn gói gốc");
      return;
    }
    try {
      setGrantLoading(true);
      await subscriptionService.grantSubscription(grantUserId, grantPlanId);
      toast.success("Cấp gói thành công!");
      setIsGrantDialogOpen(false);
      setGrantUserId("");
      setGrantPlanId("");
      fetchUserSubscriptions();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Có lỗi xảy ra khi cấp quyền",
      );
    } finally {
      setGrantLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await subscriptionService.updateSubscriptionStatus(id, status);
      toast.success("Cập nhật trạng thái thành công");
      fetchUserSubscriptions();
    } catch (error) {
      toast.error("Có lỗi xảy ra khi cập nhật");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return (
          <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">
            Đang hoạt động
          </Badge>
        );
      case "EXPIRED":
        return (
          <Badge className="bg-slate-500/10 text-slate-500 hover:bg-slate-500/20">
            Hết hạn
          </Badge>
        );
      case "CANCELLED":
        return (
          <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20">
            Đã hủy
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card className="border-slate-800 bg-[#1e1e1e]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-white">
              Lịch sử đăng ký
            </CardTitle>
            <CardDescription>
              {filterPlanId
                ? "Quản lý khách gửi đăng ký riêng cho gói này"
                : "Danh sách tất cả lượt đăng ký gói của toàn bộ người dùng"}
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="relative flex items-center gap-2 mr-4">
              <Select
                value={activePlanFilter}
                onValueChange={setActivePlanFilter}
              >
                <SelectTrigger className="w-[200px] bg-slate-900 border-slate-800 text-white h-10">
                  <SelectValue placeholder="Lọc theo gói" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-white">
                  <SelectItem value="all">Tất cả gói</SelectItem>
                  {availablePlans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                type="search"
                placeholder="Tìm kiếm user..."
                className="w-64 pl-8 bg-slate-900 border-slate-800 text-white"
              />
            </div>
            {!filterPlanId && (
              <Button
                onClick={() => setIsGrantDialogOpen(true)}
                className="bg-primary hover:bg-primary/90"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Cấp nhanh gói
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-slate-800">
          <Table>
            <TableHeader className="bg-slate-900/50">
              <TableRow className="border-slate-800 hover:bg-transparent">
                <TableHead className="text-slate-300">Người dùng</TableHead>
                <TableHead className="text-slate-300">Gói</TableHead>
                <TableHead className="text-slate-300">Trạng thái</TableHead>
                <TableHead className="text-slate-300">Ngày bắt đầu</TableHead>
                <TableHead className="text-slate-300">Ngày kết thúc</TableHead>
                <TableHead className="text-center text-slate-300 w-[100px]">
                  Thao tác
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-slate-400"
                  >
                    Đang tải...
                  </TableCell>
                </TableRow>
              ) : subscriptions.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-slate-400"
                  >
                    Không có dữ liệu
                  </TableCell>
                </TableRow>
              ) : (
                subscriptions.map((sub) => (
                  <TableRow
                    key={sub.id}
                    className="border-slate-800 hover:bg-slate-800/50"
                  >
                    <TableCell className="font-medium text-white">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-700 overflow-hidden">
                          {sub.user?.avatar_url && (
                            <img
                              src={sub.user.avatar_url}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div>
                          <p>{sub.user?.display_name || sub.user?.username}</p>
                          <p className="text-xs text-slate-400">
                            {sub.user?.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="border-primary/50 text-primary"
                      >
                        {sub.plan?.name}
                      </Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(sub.status)}</TableCell>
                    <TableCell className="text-slate-300">
                      {formatDate(sub.start_date)}
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {formatDate(sub.end_date)}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center">
                        <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost" 
                            className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-full flex items-center justify-center transition-colors"
                          >
                            <MoreVertical className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuPortal>
                          <DropdownMenuContent
                            align="end"
                            sideOffset={5}
                            className="bg-[#1e1e1e] border-slate-700 text-slate-200 shadow-2xl min-w-[180px] z-[9999] animate-in fade-in-0 zoom-in-95"
                          >
                            <div className="px-3 py-2 text-xs font-bold text-slate-500 border-b border-slate-800 mb-1 uppercase tracking-wider">
                              Thao tác đăng ký
                            </div>
                            {sub.status !== "ACTIVE" && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleUpdateStatus(sub.id, "ACTIVE")
                                }
                                className="hover:bg-green-500/10 hover:text-green-400 cursor-pointer py-2.5 px-3 focus:bg-green-500/10 focus:text-green-400"
                              >
                                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />{" "}
                                Khôi phục / Kích hoạt
                              </DropdownMenuItem>
                            )}
                            {sub.status === "ACTIVE" && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleUpdateStatus(sub.id, "CANCELLED")
                                }
                                className="hover:bg-red-500/10 hover:text-red-400 cursor-pointer py-2.5 px-3 focus:bg-red-500/10 focus:text-red-400"
                              >
                                <Ban className="mr-2 h-4 w-4 text-red-500" /> Hủy gói cước
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenuPortal>
                      </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        
        <div className="flex items-center justify-end space-x-2 mt-4 text-white">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="border-slate-800 bg-transparent hover:bg-slate-800"
          >
            Trước
          </Button>
          <div className="text-sm text-slate-400">
            Trang {page} / {total || 1}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(total, p + 1))}
            disabled={page >= total}
            className="border-slate-800 bg-transparent hover:bg-slate-800"
          >
            Sau
          </Button>
        </div>
      </CardContent>

      
      <Dialog open={isGrantDialogOpen} onOpenChange={setIsGrantDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>Cấp gói trải nghiệm cho Người dùng</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2 flex flex-col overflow-visible">
              <Label>Người dùng</Label>
              <Popover
                open={isUserComboboxOpen}
                onOpenChange={setIsUserComboboxOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={isUserComboboxOpen}
                    className="w-full justify-between bg-slate-800 border-slate-700 text-white hover:bg-slate-700 hover:text-white"
                  >
                    <span className="truncate">
                      {grantUserId
                        ? searchResults.find((user) => user.id === grantUserId)
                            ?.email ||
                          searchResults.find((user) => user.id === grantUserId)
                            ?.username ||
                          grantUserId
                        : "Tìm theo email hoặc tên..."}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-full p-0 bg-slate-800 border-slate-700 text-white"
                  align="start"
                >
                  <Command
                    className="bg-slate-800 text-white"
                    shouldFilter={false}
                  >
                    <CommandInput
                      placeholder="Gõ email hoặc username..."
                      value={userSearchQuery}
                      onValueChange={setUserSearchQuery}
                      className="text-white"
                    />
                    <CommandList>
                      <CommandEmpty>
                        {isSearchingUser
                          ? "Đang tìm kiếm..."
                          : "Không tìm thấy người dùng."}
                      </CommandEmpty>
                      <CommandGroup>
                        {searchResults.map((user) => (
                          <CommandItem
                            key={user.id}
                            value={user.id}
                            onSelect={(currentValue) => {
                              setGrantUserId(user.id);
                              setIsUserComboboxOpen(false);
                            }}
                            className="text-white hover:bg-slate-700 cursor-pointer"
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                grantUserId === user.id
                                  ? "opacity-100 text-primary"
                                  : "opacity-0",
                              )}
                            />
                            <div className="flex flex-col">
                              <span>{user.email || user.username}</span>
                              <span className="text-xs text-slate-400">
                                {user.display_name && `(${user.display_name})`}
                              </span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Gói cước</Label>
              <Select
                value={grantPlanId}
                onValueChange={(val) => setGrantPlanId(val)}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700 h-10 w-full">
                  <SelectValue placeholder="Chọn gói cho phép..." />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-white max-h-[300px]">
                  {availablePlans.map((plan: any) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name} - {plan.price.toLocaleString("vi-VN")} VND
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="bg-slate-700 hover:bg-slate-600 text-white border-0"
              onClick={() => setIsGrantDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button
              onClick={handleGrantSubscription}
              disabled={grantLoading}
              className="bg-primary hover:bg-primary/90 text-white border-0"
            >
              {grantLoading ? "Đang xử lý..." : "Cấp gói ngay"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
