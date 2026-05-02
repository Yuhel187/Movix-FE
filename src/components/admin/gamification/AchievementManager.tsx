"use client";

import React, { useState } from "react";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
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
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit, 
  Trash, 
  Trophy, 
  Clock, 
  Zap, 
  Users,
  CheckCircle, 
  XCircle,
  MessageSquare
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

import { Achievement } from "@/types/gamification";
import { 
  getAllAchievements, 
  createAchievement, 
  updateAchievement, 
  toggleAchievement,
  deleteAchievement
} from "@/services/gamification.service";

export default function AchievementManager() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Achievement>>({
    name: "",
    description: "",
    icon_url: "",
    condition_type: "XP",
    condition_value: 0,
    reward_xp: 0,
    is_active: true,
  });

  React.useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const res = await getAllAchievements(1, 100);
      setAchievements(res.achievements || []);
    } catch (error) {
      toast.error("Lỗi khi tải danh sách danh hiệu");
    } finally {
      setLoading(false);
    }
  };

  const filteredAchievements = achievements.filter((ach) =>
    ach.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenDialog = (achievement?: Achievement) => {
    if (achievement) {
      setEditingId(achievement.id);
      setFormData(achievement);
    } else {
      setEditingId(null);
      setFormData({
        name: "",
        description: "",
        icon_url: "",
        condition_type: "XP",
        condition_value: 0,
        reward_xp: 0,
        is_active: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.condition_type) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    try {
      if (editingId) {
        await updateAchievement(editingId, formData);
        toast.success("Cập nhật danh hiệu thành công");
      } else {
        await createAchievement(formData as Omit<Achievement, 'id'>);
        toast.success("Tạo danh hiệu mới thành công");
      }
      fetchAchievements();
      setIsDialogOpen(false);
    } catch (error) {
      toast.error("Có lỗi xảy ra khi lưu");
    }
  };
  const confirmDelete = (id: string) => {
    setDeleteId(id);
  };

  const executeDelete = async () => {
    if (deleteId) {
      try {
        await deleteAchievement(deleteId);
        toast.success("Đã xóa danh hiệu");
        fetchAchievements();
        setDeleteId(null);
      } catch (error) {
        toast.error("Có lỗi xảy ra khi xóa danh hiệu");
      }
    }
  };

  const getConditionIcon = (type: string) => {
    switch (type) {
      case "TOTAL_WATCH_TIME":
        return <Clock className="w-4 h-4 mr-1 text-blue-400" />;
      case "XP":
        return <Zap className="w-4 h-4 mr-1 text-yellow-400" />;
      case "LOGIN_STREAK":
        return <Users className="w-4 h-4 mr-1 text-green-400" />;
      case "TOTAL_COMMENTS":
        return <MessageSquare className="w-4 h-4 mr-1 text-pink-400" />;
      default:
        return null;
    }
  };

  const getConditionText = (type: string, value: number) => {
     switch (type) {
      case "TOTAL_WATCH_TIME":
        return `${value} phút xem`;
      case "XP":
        return `${value} XP`;
      case "LOGIN_STREAK":
        return `${value} ngày liên tiếp`;
      case "TOTAL_COMMENTS":
        return `${value} bình luận`;
      default:
        return value;
    }
  }

  return (
    <div className="space-y-4">
      
      <div className="flex items-center justify-between gap-4 bg-[#1F1F1F] p-4 rounded-lg border border-slate-800">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Tìm kiếm danh hiệu..."
            className="pl-9 bg-[#262626] border-slate-700 text-white placeholder:text-gray-500 focus:ring-purple-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button 
          onClick={() => handleOpenDialog()}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          <Plus className="mr-2 h-4 w-4" /> Thêm Danh Hiệu
        </Button>
      </div>

      
      <div className="rounded-md border border-slate-800 bg-[#1F1F1F]">
        <Table>
          <TableHeader className="bg-[#262626]">
            <TableRow className="border-slate-800 hover:bg-[#262626]">
              <TableHead className="w-[80px] text-gray-400">Icon</TableHead>
              <TableHead className="text-gray-400">Tên & Mô tả</TableHead>
              <TableHead className="text-gray-400">Điều kiện nhận</TableHead>
              <TableHead className="text-gray-400 text-center">Phần thưởng XP</TableHead>
              <TableHead className="text-gray-400 text-center">Trạng thái</TableHead>
              <TableHead className="text-right text-gray-400">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAchievements.length === 0 ? (
               <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-gray-500">
                  Không tìm thấy kết quả nào.
                </TableCell>
              </TableRow>
            ) : (
              filteredAchievements.map((achievement) => (
                <TableRow key={achievement.id} className="border-slate-800 hover:bg-[#262626]/50">
                  <TableCell>
                    <div className="relative w-10 h-10 rounded-md overflow-hidden bg-slate-800 border border-slate-700">
                      {achievement.icon_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img 
                          src={achievement.icon_url} 
                          alt={achievement.name} 
                          className="object-cover w-full h-full"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://via.placeholder.com/40";
                          }}
                        />
                      ) : (
                        <Trophy className="w-6 h-6 m-2 text-yellow-500" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold text-white">{achievement.name}</span>
                      <span className="text-xs text-gray-400 max-w-[250px] truncate" title={achievement.description}>
                        {achievement.description}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm font-medium text-gray-300">
                      {getConditionIcon(achievement.condition_type)}
                      {getConditionText(achievement.condition_type, achievement.condition_value)}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                      +{achievement.reward_xp} XP
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {achievement.is_active ? (
                      <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20">
                        Hoạt động
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-gray-500/10 text-gray-400 hover:bg-gray-500/20 border-gray-500/20">
                        Vô hiệu hóa
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                       <Button size="icon" variant="ghost" onClick={() => handleOpenDialog(achievement)} className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10">
                          <Edit className="h-4 w-4" />
                       </Button>
                       <Button size="icon" variant="ghost" onClick={() => confirmDelete(achievement.id)} className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-400/10">
                          <Trash className="h-4 w-4" />
                       </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="bg-[#1F1F1F] border-slate-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Hành động này không thể hoàn tác. Danh hiệu này sẽ bị xóa khỏi hệ thống và bị thu hồi khỏi tất cả người dùng đang sở hữu.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-slate-700 text-gray-300 hover:bg-[#262626] hover:text-white">Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={executeDelete} className="bg-red-600 hover:bg-red-700 text-white border-0">
              Xóa danh hiệu
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[#1F1F1F] border-slate-800 text-white sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingId ? "Chỉnh sửa danh hiệu" : "Tạo danh hiệu mới"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right text-gray-400">Tên danh hiệu</Label>
              <Input
                className="col-span-3 bg-[#262626] border-slate-700"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right text-gray-400">Mô tả</Label>
              <Textarea
                className="col-span-3 bg-[#262626] border-slate-700"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right text-gray-400">Icon URL</Label>
              <Input
                className="col-span-3 bg-[#262626] border-slate-700"
                value={formData.icon_url}
                onChange={(e) => setFormData({ ...formData, icon_url: e.target.value })}
                placeholder="https://example.com/icon.png"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right text-gray-400">Loại điều kiện</Label>
              <Select 
                value={formData.condition_type} 
                onValueChange={(val) => setFormData({ ...formData, condition_type: val })}
              >
                <SelectTrigger className="col-span-3 bg-[#262626] border-slate-700">
                  <SelectValue placeholder="Chọn điều kiện" />
                </SelectTrigger>
                <SelectContent className="bg-[#262626] border-slate-700 text-white">
                  <SelectItem value="XP">XP Tích Lũy</SelectItem>
                  <SelectItem value="TOTAL_WATCH_TIME">Thời Gian Xem (phút)</SelectItem>
                  <SelectItem value="LOGIN_STREAK">Chuỗi Đăng Nhập (ngày)</SelectItem>
                  <SelectItem value="TOTAL_COMMENTS">Tổng Bình Luận</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right text-gray-400">Giá trị đạt mốc</Label>
              <Input
                type="number"
                className="col-span-3 bg-[#262626] border-slate-700"
                value={formData.condition_value}
                onChange={(e) => setFormData({ ...formData, condition_value: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right text-gray-400">Thưởng XP</Label>
              <Input
                type="number"
                className="col-span-3 bg-[#262626] border-slate-700"
                value={formData.reward_xp}
                onChange={(e) => setFormData({ ...formData, reward_xp: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right text-gray-400">Trạng thái</Label>
                <div className="col-span-3 flex items-center space-x-2">
                    <Switch
                        checked={formData.is_active}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                    <span className="text-sm text-gray-400">{formData.is_active ? "Kích hoạt" : "Vô hiệu hóa"}</span>
                </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="border-slate-700 text-gray-400 hover:text-white hover:bg-[#262626]">
              Hủy
            </Button>
            <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700 text-white">
              {editingId ? "Cập nhật" : "Tạo mới"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
