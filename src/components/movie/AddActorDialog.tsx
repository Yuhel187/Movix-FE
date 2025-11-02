"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils"; 
import {
  Plus,
  ChevronsUpDown,
  Check,
  ImageIcon,
  Calendar as CalendarIconLucide,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface Person {
  id: string;
  name: string;
  avatarUrl?: string;
  roles?: string; 
}
const allPeopleSearchList: Person[] = [
  { id: "p1", name: "Robert Downey Jr.", avatarUrl: "/avatars/rdj.jpg", roles: "Diễn viên" },
  { id: "p2", name: "Chris Evans", avatarUrl: "/avatars/ce.jpg", roles: "Diễn viên" },
  { id: "p3", name: "Jon Favreau", avatarUrl: "/avatars/jf.jpg", roles: "Đạo diễn, Diễn viên" },
];

interface AddActorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddActor: (data: { person: Person; characterName: string }) => void;
}

export function AddActorDialog({ open, onOpenChange, onAddActor }: AddActorDialogProps) {
  // === State cho Dialog chính (Thêm thành viên) ===
  const [popoverSearchOpen, setPopoverSearchOpen] = useState(false);
  const [searchPersonValue, setSearchPersonValue] = useState("");
  const [selectedPersonForRole, setSelectedPersonForRole] = useState<Person | null>(null);
  const [characterName, setCharacterName] = useState("");

  // === State cho Dialog lồng (Thêm hồ sơ) ===
  const [isCreatePersonOpen, setCreatePersonOpen] = useState(false);
  const [profileNgaySinh, setProfileNgaySinh] = useState<Date | undefined>();
  const [profileMoTa, setProfileMoTa] = useState("");

  const handleCreateAndAddPerson = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newPerson: Person = {
      id: `p${Date.now()}`, 
      name: formData.get("nghe_danh") as string,
      roles: formData.get("nghe_nghiep") as string,
      avatarUrl: "",
    };
    
    console.log("Đang tạo hồ sơ mới:", newPerson);
    allPeopleSearchList.push(newPerson); 
    setSelectedPersonForRole(newPerson);
    setCreatePersonOpen(false);
    setPopoverSearchOpen(false);
  };


  const handleAddPersonToList = () => {
    if (!selectedPersonForRole) {
      alert("Vui lòng chọn một diễn viên/đạo diễn.");
      return;
    }
    
    onAddActor({
      person: selectedPersonForRole,
      characterName: characterName || "N/A", 
    });
    
    // Reset state và đóng dialog
    onOpenChange(false);
    setSelectedPersonForRole(null);
    setCharacterName("");
    setSearchPersonValue("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Nội dung Dialog "THÊM THÀNH VIÊN" */}
      <DialogContent className="bg-[#1F1F1F] border-slate-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">THÊM THÀNH VIÊN</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div>
            <Popover open={popoverSearchOpen} onOpenChange={setPopoverSearchOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between bg-white/10 border-slate-600 hover:bg-white/20 hover:text-white"
                >
                  {selectedPersonForRole
                    ? selectedPersonForRole.name
                    : "Tìm diễn viên/đạo diễn..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-[#262626] border-slate-700 text-white">
                <Command>
                  <CommandInput 
                    placeholder="Tìm theo tên..."
                    className="text-black border-b-slate-700 focus:ring-0"
                    value={searchPersonValue}
                    onValueChange={setSearchPersonValue}
                  />
                  <CommandList>
                    <CommandEmpty>
                      {/* Nút Thêm hồ sơ mới (Dialog lồng) */}
                      <Dialog open={isCreatePersonOpen} onOpenChange={setCreatePersonOpen}>
                        <DialogTrigger asChild>
                          <Button variant="link" className="text-black">
                            <Plus className="w-4 h-4 mr-2" />
                            Không tìm thấy? Thêm hồ sơ mới...
                          </Button>
                        </DialogTrigger>
                        
                        {/* (MỚI) Dialog "THÊM HỒ SƠ" */}
                        <DialogContent className="bg-[#1F1F1F] border-slate-700 text-white max-w-lg">
                          <DialogHeader>
                            <DialogTitle className="text-xl">THÊM HỒ SƠ</DialogTitle>
                          </DialogHeader>
                          <form onSubmit={handleCreateAndAddPerson}>
                            <div className="py-4">
                              <div className="flex flex-col md:flex-row gap-6">
                                {/* Cột trái: Ảnh đại diện */}
                                <div className="w-full md:w-40 flex-shrink-0">
                                  <div className="w-full h-full bg-slate-700 rounded-lg flex items-center justify-center cursor-pointer hover:bg-slate-600">
                                    <ImageIcon className="w-20 h-20 text-slate-500" />
                                  </div>
                                </div>
                                {/* Cột phải: Thông tin chính */}
                                <div className="flex-1 space-y-4">
                                  <div>
                                    <label htmlFor="nghe_danh" className="text-sm font-medium text-gray-300 mb-1 block">Nghệ danh</label>
                                    <Input id="nghe_danh" name="nghe_danh" className="bg-white/10 border-slate-600" defaultValue={searchPersonValue} required />
                                  </div>
                                  <div>
                                    <label htmlFor="nghe_nghiep" className="text-sm font-medium text-gray-300 mb-1 block">Nghề nghiệp</label>
                                    <Input id="nghe_nghiep" name="nghe_nghiep" className="bg-white/10 border-slate-600" placeholder="Vd: Diễn viên, Đạo diễn" required />
                                  </div>
                                  <div>
                                    <label htmlFor="ho_ten" className="text-sm font-medium text-gray-300 mb-1 block">Họ tên</label>
                                    <Input id="ho_ten" name="ho_ten" className="bg-white/10 border-slate-600" placeholder="Tên thật (nếu có)" />
                                  </div>
                                </div>
                              </div>
                              
                              <div className="space-y-4 mt-6">
                                <div className='grid grid-cols-3 gap-4'> 
                                    <div className='col-span-2'> 
                                        <label htmlFor="ngay_sinh" className="text-sm font-medium text-gray-300 mb-1 block">Ngày sinh</label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full justify-start text-left font-normal bg-white/10 border-slate-600 hover:bg-white/20 hover:text-white", 
                                                        !profileNgaySinh && "text-muted-foreground"
                                                    )}
                                                >
                                                    <CalendarIconLucide className="mr-2 h-4 w-4" />
                                                    {profileNgaySinh ? format(profileNgaySinh, "PPP", { locale: vi }) : <span>Chọn ngày</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0 bg-[#262626] border-slate-700 text-white" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={profileNgaySinh}
                                                    onSelect={setProfileNgaySinh}
                                                    initialFocus
                                                    locale={vi}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <div className='col-span-1'> 
                                        <label htmlFor="gioi_tinh" className="text-sm font-medium text-gray-300 mb-1 block">Giới tính</label>
                                        <Select name="gioi_tinh" defaultValue="Nam">
                                            <SelectTrigger className="w-full bg-white/10 border-slate-600">
                                                <SelectValue placeholder="Chọn giới tính" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-[#262626] border-slate-700 text-white">
                                                <SelectItem value="Nam">Nam</SelectItem>
                                                <SelectItem value="Nu">Nữ</SelectItem>
                                                <SelectItem value="Khac">Khác</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div> 
                                </div>                
                                <div>
                                  <label htmlFor="mo_ta" className="text-sm font-medium text-gray-300 mb-1 block">Mô tả</label>
                                  <Textarea
                                    id="mo_ta"
                                    name="mo_ta"
                                    value={profileMoTa} 
                                    onChange={(e) => setProfileMoTa(e.target.value)}
                                    className="bg-white/10 border-slate-600 focus:border-primary focus:ring-primary min-h-[80px]"
                                    placeholder="Mô tả về tiểu sử, sự nghiệp..."
                                    maxLength={1000}
                                  />
                                  <p className="text-xs text-gray-500 text-right mt-1">{profileMoTa.length}/1000</p>
                                </div>
                              </div>
                            </div>
                            <DialogFooter>
                              <DialogClose asChild>
                                <Button type="button" variant="outline" className="text-white bg-primary border-slate-600 hover:bg-slate-700">
                                  Hủy
                                </Button>
                              </DialogClose>
                              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Lưu hồ sơ</Button>
                            </DialogFooter>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </CommandEmpty>
                    <CommandGroup>
                      {allPeopleSearchList.map((person) => (
                        <CommandItem
                          key={person.id}
                          value={person.name} 
                          onSelect={() => {
                            setSelectedPersonForRole(person);
                            setPopoverSearchOpen(false); 
                            setSearchPersonValue(''); 
                          }}
                          className="hover:bg-slate-700 cursor-pointer"
                        >
                          <Check className={cn("mr-2 h-4 w-4", selectedPersonForRole?.id === person.id ? "opacity-100" : "opacity-0")} />
                          <Avatar className="h-8 w-8 mr-3 border border-slate-600">
                            <AvatarImage src={person.avatarUrl || ''} />
                            <AvatarFallback className="bg-slate-700 text-xs">?</AvatarFallback>
                          </Avatar>
                          <div>
                            <p>{person.name}</p>
                            <p className="text-xs text-gray-400">{person.roles}</p>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          
          {/* Input "Tên nhân vật" */}
          <div>
            <label htmlFor="character_name" className="text-sm font-medium text-gray-300 mb-1 block">Tên nhân vật</label>
            <Input 
              id="character_name" 
              className="bg-white/10 border-slate-600" 
              placeholder="VD: Iron Man"
              value={characterName}
              onChange={(e) => setCharacterName(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button 
            className="bg-[#E50914] hover:bg-[#b80710]"
            onClick={handleAddPersonToList}
          >
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}