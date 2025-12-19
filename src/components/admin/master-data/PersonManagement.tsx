/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { Plus, Search, Edit, Trash2, MoreHorizontal, Filter, Loader2, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuRadioGroup, DropdownMenuRadioItem
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { personService, AdminPerson } from "@/services/person.service";

const getGenderLabel = (gender: number) => {
    switch(gender) {
        case 1: return "Nữ";
        case 2: return "Nam";
        case 3: return "Phi nhị giới";
        default: return "Không rõ";
    }
};

const getRoleLabel = (role: string) => {
    const r = role?.toLowerCase()?.trim();
    if (r === 'director') return 'Đạo diễn';
    if (r === 'actor') return 'Diễn viên';
    return role || "Chưa cập nhật";
};

const PersonManagement = () => {
  const [people, setPeople] = useState<AdminPerson[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
      name: "",
      role_type: "Actor", 
      gender: "2",
      birthday: "",
      avatar_url: "",
      biography: ""
  });

  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const fetchPeople = async (page = 1) => {
    try {
      setIsLoading(true);
      const res = await personService.getAll({ 
          search: searchTerm, 
          role_type: roleFilter, 
          page 
      });
      
      setPeople(res.data);
      setPagination({ 
          page: res.pagination.page, 
          totalPages: res.pagination.totalPages 
      });
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải danh sách nhân sự");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
        fetchPeople(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, roleFilter]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
        name: "", role_type: "Actor", gender: "2", birthday: "", avatar_url: "", biography: ""
    });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (person: AdminPerson) => {
    setEditingId(person.id);
    
    let normalizedRole = "Actor"; 
    if (person.role_type && person.role_type.toLowerCase() === "director") {
        normalizedRole = "Director";
    } else if (person.role_type && person.role_type.toLowerCase() === "actor") {
        normalizedRole = "Actor";
    }

    setFormData({
        name: person.name,
        role_type: normalizedRole,
        gender: String(person.gender || 0),
        birthday: person.birthday ? new Date(person.birthday).toISOString().split('T')[0] : "",
        avatar_url: person.avatar_url || "",
        biography: person.biography || ""
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Tên nhân sự là bắt buộc");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
          ...formData,
          gender: Number(formData.gender),
      };

      if (editingId) {
        await personService.update(editingId, payload);
        toast.success("Cập nhật thông tin thành công");
      } else {
        await personService.create(payload);
        toast.success("Thêm nhân sự mới thành công");
      }
      setIsDialogOpen(false);
      fetchPeople(pagination.page);
    } catch (error: any) {
        const msg = error.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại";
        toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      await personService.delete(itemToDelete);
      toast.success("Đã xóa nhân sự khỏi hệ thống");
      if (people.length === 1 && pagination.page > 1) {
          fetchPeople(pagination.page - 1);
      } else {
          fetchPeople(pagination.page);
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || "Không thể xóa nhân sự này";
      toast.error(msg);
    } finally {
      setItemToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Nhân sự phim</h2>
          <p className="text-muted-foreground">Quản lý danh sách diễn viên, đạo diễn.</p>
        </div>
        <Button onClick={handleOpenCreate} className="shrink-0">
          <Plus className="mr-2 h-4 w-4" /> Thêm nhân sự
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Danh sách ({pagination.totalPages > 0 ? `Trang ${pagination.page}` : "0"})</CardTitle>
            
            <div className="flex gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                        type="search" 
                        placeholder="Tìm tên..." 
                        className="pl-8" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" className={roleFilter !== 'all' ? 'bg-secondary border-primary' : ''}>
                            <Filter className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Lọc theo vai trò</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuRadioGroup value={roleFilter} onValueChange={setRoleFilter}>
                            <DropdownMenuRadioItem value="all">Tất cả</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="Actor">Diễn viên (Actor)</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="Director">Đạo diễn (Director)</DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Thông tin cá nhân</TableHead>
                <TableHead>Vai trò chính</TableHead>
                <TableHead>Giới tính</TableHead>
                <TableHead className="text-center">Số phim</TableHead>
                <TableHead className="w-[100px] text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center">
                     <div className="flex justify-center items-center gap-2 text-muted-foreground">
                        <Loader2 className="animate-spin h-5 w-5"/> Đang tải dữ liệu...
                     </div>
                  </TableCell>
                </TableRow>
              ) : people.length === 0 ? (
                 <TableRow>
                    <TableCell colSpan={5} className="text-center h-32 text-muted-foreground">
                        Không tìm thấy dữ liệu phù hợp.
                    </TableCell>
                 </TableRow>
              ) : (
                people.map((person) => (
                <TableRow key={person.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border border-border">
                            <AvatarImage src={person.avatar_url} alt={person.name} className="object-cover" />
                            <AvatarFallback><UserIcon className="h-4 w-4"/></AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="font-medium">{person.name}</div>
                            {person.birthday && (
                                <div className="text-xs text-muted-foreground">
                                    SN: {new Date(person.birthday).toLocaleDateString('vi-VN')}
                                </div>
                            )}
                        </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                        variant={
                            person.role_type?.toLowerCase() === 'director' ? 'secondary' : 'outline'
                        }
                    >
                        {getRoleLabel(person.role_type)}
                    </Badge>
                  </TableCell>
                  <TableCell>{getGenderLabel(person.gender)}</TableCell>
                  <TableCell className="text-center font-medium">
                      {person._count?.movie_people || 0}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleOpenEdit(person)}>
                            <Edit className="mr-2 h-4 w-4" /> Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                            className="text-red-600 focus:text-red-600 focus:bg-red-50" 
                            onClick={() => setItemToDelete(person.id)}
                        >
                            <Trash2 className="mr-2 h-4 w-4" /> Xóa bỏ
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {pagination.totalPages > 1 && (
            <div className="flex justify-end items-center gap-2 mt-4">
                <Button 
                    variant="outline" size="sm" 
                    onClick={() => fetchPeople(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                >
                    Trước
                </Button>
                <div className="text-sm text-muted-foreground">
                    Trang {pagination.page} / {pagination.totalPages}
                </div>
                <Button 
                    variant="outline" size="sm" 
                    onClick={() => fetchPeople(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                >
                    Sau
                </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Cập nhật thông tin" : "Thêm nhân sự mới"}</DialogTitle>
            <DialogDescription>
                Điền đầy đủ thông tin bên dưới. Các trường có dấu * là bắt buộc.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Tên đầy đủ <span className="text-red-500">*</span></Label>
                    <Input 
                        id="name" 
                        value={formData.name} 
                        onChange={e => setFormData({...formData, name: e.target.value})} 
                        placeholder="Ví dụ: Christopher Nolan" 
                        required 
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="role">Vai trò chính</Label>
                    <Select 
                        value={formData.role_type} 
                        onValueChange={v => setFormData({...formData, role_type: v})}
                    >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Actor">Diễn viên (Actor)</SelectItem>
                            <SelectItem value="Director">Đạo diễn (Director)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Giới tính</Label>
                    <Select 
                        value={formData.gender} 
                        onValueChange={v => setFormData({...formData, gender: v})}
                    >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="2">Nam</SelectItem>
                            <SelectItem value="1">Nữ</SelectItem>
                            <SelectItem value="3">Phi nhị giới</SelectItem>
                            <SelectItem value="0">Không rõ</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="birthday">Ngày sinh</Label>
                    <Input 
                        id="birthday" 
                        type="date" 
                        value={formData.birthday} 
                        onChange={e => setFormData({...formData, birthday: e.target.value})} 
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="avatar">Ảnh đại diện (URL)</Label>
                <div className="flex gap-3">
                    <Input 
                        id="avatar" 
                        value={formData.avatar_url} 
                        onChange={e => setFormData({...formData, avatar_url: e.target.value})} 
                        placeholder="https://image.tmdb.org/..." 
                        className="flex-1"
                    />
                    {formData.avatar_url && (
                        <Avatar className="h-10 w-10 border border-border">
                            <AvatarImage src={formData.avatar_url} />
                            <AvatarFallback>IMG</AvatarFallback>
                        </Avatar>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="bio">Tiểu sử</Label>
                <Textarea 
                    id="bio" 
                    value={formData.biography} 
                    onChange={e => setFormData({...formData, biography: e.target.value})} 
                    placeholder="Nhập thông tin tiểu sử, sự nghiệp..." 
                    rows={4}
                />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Hủy bỏ
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingId ? "Lưu thay đổi" : "Tạo mới"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Dữ liệu nhân sự sẽ bị xóa vĩnh viễn khỏi hệ thống.
              <br/>
              <span className="text-red-500 text-sm mt-2 block">Lưu ý: Không thể xóa nếu nhân sự này đang tham gia trong một bộ phim.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
            <AlertDialogAction 
                onClick={handleDelete} 
                className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
                Xóa ngay
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PersonManagement;