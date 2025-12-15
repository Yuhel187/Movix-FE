"use client";

import React, { useEffect, useState } from "react";
import { Plus, Search, Edit, Trash2, MoreHorizontal, Globe, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { countryService, Country } from "@/services/country.service";
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

const CountryManagement = () => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "" });

  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const fetchCountries = async () => {
    try {
      setIsLoading(true);
      const data = await countryService.getAll();
      setCountries(data);
    } catch (error) {
      console.error("Failed to fetch countries:", error);
      toast.error("Không thể tải danh sách quốc gia");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCountries();
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({ name: "" });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (country: Country) => {
    setEditingId(country.id);
    setFormData({ name: country.name });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Tên quốc gia không được để trống");
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingId) {
        await countryService.update(editingId, formData);
        toast.success("Cập nhật thành công");
      } else {
        await countryService.create(formData);
        toast.success("Thêm mới thành công");
      }
      setIsDialogOpen(false);
      fetchCountries(); // Refresh list
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      await countryService.delete(itemToDelete);
      toast.success("Đã xóa quốc gia");
      fetchCountries();
    } catch (error) {
      console.error(error);
      toast.error("Không thể xóa (có thể do đang liên kết với phim)");
    } finally {
      setItemToDelete(null);
    }
  };

  const filteredCountries = countries.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Quốc gia</h2>
          <p className="text-muted-foreground">Quản lý danh sách quốc gia sản xuất phim.</p>
        </div>
        <Button onClick={handleOpenCreate} className="shrink-0">
          <Plus className="mr-2 h-4 w-4" /> Thêm quốc gia
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Danh sách quốc gia</CardTitle>
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder="Tìm kiếm quốc gia..." 
                className="pl-8" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên quốc gia</TableHead>
                <TableHead className="text-center">Số lượng phim</TableHead>
                <TableHead className="w-[100px] text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    <div className="flex justify-center items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Đang tải dữ liệu...
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredCountries.length === 0 ? (
                <TableRow>
                   <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                    Không tìm thấy dữ liệu.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCountries.map((country) => (
                  <TableRow key={country.id}>
                    <TableCell className="font-medium flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      {country.name}
                    </TableCell>
                    <TableCell className="text-center">
                      {country._count?.movies || 0}
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
                          <DropdownMenuItem onClick={() => handleOpenEdit(country)}>
                            <Edit className="mr-2 h-4 w-4" /> Sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600 focus:text-red-600"
                            onClick={() => setItemToDelete(country.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog Thêm/Sửa */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Cập nhật quốc gia" : "Thêm quốc gia mới"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Chỉnh sửa thông tin quốc gia." : "Nhập tên quốc gia để thêm vào hệ thống."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Tên
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="col-span-3"
                  placeholder="Ví dụ: Việt Nam, Hàn Quốc..."
                  autoFocus
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingId ? "Lưu thay đổi" : "Tạo mới"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Alert Dialog Xóa */}
      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Quốc gia này sẽ bị xóa khỏi danh sách.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
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

export default CountryManagement;