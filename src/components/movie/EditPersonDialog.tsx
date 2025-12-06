"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ImageIcon, Link as LinkIcon, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface Person {
  id: string | number;
  name: string;
  character?: string;
  avatarUrl?: string | null;
  role?: string; // 'actor' | 'director' ...
  biography?: string | null;
  birthday?: string | null;
  gender?: number | null;
}

interface EditPersonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  person: Person | null;
  onSave: (updatedPerson: Person) => void;
}

export function EditPersonDialog({ open, onOpenChange, person, onSave }: EditPersonDialogProps) {
  const [editingData, setEditingData] = useState<Person | null>(null);
  const [date, setDate] = useState<Date | undefined>();

  useEffect(() => {
    if (person) {
      setEditingData({ ...person });
      if (person.birthday) {
        setDate(new Date(person.birthday));
      } else {
        setDate(undefined);
      }
    }
  }, [person]);

  const handleSave = () => {
    if (editingData) {
      const updated = {
        ...editingData,
        birthday: date ? date.toISOString() : null,
      };
      onSave(updated);
      onOpenChange(false);
    }
  };

  if (!editingData) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1F1F1F] border-slate-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa thông tin thành viên</DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-40 flex-shrink-0 space-y-3">
              <div className="w-full h-52 bg-slate-700 rounded-lg overflow-hidden flex items-center justify-center border border-slate-600 relative">
                {editingData.avatarUrl ? (
                  <img src={editingData.avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-12 h-12 text-slate-500" />
                )}
              </div>
              <div className="relative">
                <LinkIcon className="absolute left-2.5 top-2.5 h-3 w-3 text-gray-400" />
                <Input 
                    className="bg-white/10 border-slate-600 pl-8 text-[10px] h-8 focus:border-blue-500"
                    placeholder="URL ảnh..."
                    value={editingData.avatarUrl || ''}
                    onChange={(e) => setEditingData({ ...editingData, avatarUrl: e.target.value })}
                />
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                    <label className="text-xs font-medium text-gray-400 mb-1 block">Tên nghệ sĩ</label>
                    <Input 
                    value={editingData.name}
                    onChange={(e) => setEditingData({ ...editingData, name: e.target.value })}
                    className="bg-white/10 border-slate-600 focus:border-blue-500"
                    />
                </div>

                <div>
                    <label className="text-xs font-medium text-gray-400 mb-1 block">Vai trò</label>
                    <Select 
                        value={editingData.role || 'actor'} 
                        onValueChange={(val) => setEditingData({ ...editingData, role: val })}
                    >
                        <SelectTrigger className="w-full bg-white/10 border-slate-600 h-10">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#262626] border-slate-700 text-white">
                            <SelectItem value="actor">Diễn viên</SelectItem>
                            <SelectItem value="director">Đạo diễn</SelectItem>
                        </SelectContent>
                    </Select>
                 </div>

                 <div>
                    <label className="text-xs font-medium text-gray-400 mb-1 block">Giới tính</label>
                    <Select 
                        value={editingData.gender?.toString() || "0"} 
                        onValueChange={(val) => setEditingData({ ...editingData, gender: parseInt(val) })}
                    >
                        <SelectTrigger className="w-full bg-white/10 border-slate-600 h-10">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#262626] border-slate-700 text-white">
                            <SelectItem value="2">Nam</SelectItem>
                            <SelectItem value="1">Nữ</SelectItem>
                            <SelectItem value="0">Khác</SelectItem>
                        </SelectContent>
                    </Select>
                 </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-400 mb-1 block">
                    {editingData.role === 'actor' ? 'Tên nhân vật' : 'Chức vụ cụ thể'}
                </label>
                <Input 
                  value={editingData.character || ''}
                  onChange={(e) => setEditingData({ ...editingData, character: e.target.value })}
                  className="bg-white/10 border-slate-600 focus:border-blue-500"
                />
              </div>

              {/* NGÀY SINH */}
              <div>
                <label className="text-xs font-medium text-gray-400 mb-1 block">Ngày sinh</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal bg-white/10 border-slate-600 hover:bg-white/20 hover:text-white",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP", { locale: vi }) : <span>Chọn ngày sinh</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-[#262626] border-slate-700 text-white" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      locale={vi}
                      captionLayout="dropdown"
                      fromYear={1900}
                      toYear={new Date().getFullYear()}
                      classNames={{
                                                  caption_dropdowns: "flex gap-2 items-center justify-center",
                                                  dropdown: "bg-[#262626] text-white border-slate-600 h-8 text-sm rounded-md px-2 cursor-pointer",
                                                  dropdown_month: "order-1",
                                                  dropdown_year: "order-2",
                                                  caption_label: "hidden", 
                                                  caption: "flex justify-center pt-1 relative items-center",
                                                }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* TIỂU SỬ  */}
          <div>
             <label className="text-xs font-medium text-gray-400 mb-1 block">Tiểu sử</label>
             <Textarea 
                value={editingData.biography || ''}
                onChange={(e) => setEditingData({ ...editingData, biography: e.target.value })}
                className="bg-white/10 border-slate-600 focus:border-blue-500 min-h-[100px]"
                placeholder="Nhập tiểu sử..."
             />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="hover:bg-white/10 hover:text-white">Hủy</Button>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white">Lưu thay đổi</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}