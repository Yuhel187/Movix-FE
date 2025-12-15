"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
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
  Link as LinkIcon,
  Loader2 
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import apiClient from "@/lib/apiClient";
import { getPersonAvatarUrl } from "@/lib/tmdb";
import { toast } from "sonner";

interface Person {
  id: string | number;
  name: string;
  avatarUrl?: string | null;
  roles?: string;
  biography?: string | null;
  birthday?: string | null;
  gender?: number | null; 
}

interface AddActorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddActor: (data: { person: Person; characterName: string }) => void;
}

export function AddActorDialog({ open, onOpenChange, onAddActor }: AddActorDialogProps) {
  const [popoverSearchOpen, setPopoverSearchOpen] = useState(false);
  const [searchPersonValue, setSearchPersonValue] = useState("");
  const [selectedPersonForRole, setSelectedPersonForRole] = useState<Person | null>(null);
  const [characterName, setCharacterName] = useState("");
  
  const [foundPeople, setFoundPeople] = useState<Person[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [isCreatePersonOpen, setCreatePersonOpen] = useState(false);
  const [profileNgaySinh, setProfileNgaySinh] = useState<Date | undefined>();
  const [profileMoTa, setProfileMoTa] = useState("");
  const [avatarUrlInput, setAvatarUrlInput] = useState("");
  const [genderValue, setGenderValue] = useState("2");
  const [isCreatingPerson, setIsCreatingPerson] = useState(false); 

  useEffect(() => {
    const fetchPeople = async () => {
      if (!searchPersonValue || searchPersonValue.trim().length < 2) {
        setFoundPeople([]);
        return;
      }

      setIsSearching(true);
      try {
        const res = await apiClient.get(`/movies/search?q=${encodeURIComponent(searchPersonValue)}`);
        
        const mappedPeople: Person[] = (res.data.people || []).map((p: any) => ({
            id: p.id,
            name: p.name,
            avatarUrl: getPersonAvatarUrl(p.avatar_url),
            roles: p.role_type === "Director" ? "Đạo diễn" : "Diễn viên", 
            biography: p.biography,
            birthday: p.birthday,
            gender: p.gender,
        }));
        setFoundPeople(mappedPeople);
      } catch (error) {
        console.error("Lỗi tìm kiếm người:", error);
        setFoundPeople([]);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(fetchPeople, 300);
    return () => clearTimeout(timeoutId);
  }, [searchPersonValue]);


  const handleCreateAndAddPerson = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    let genderInt = 0;
    if (genderValue === "Nam") genderInt = 2;
    if (genderValue === "Nu") genderInt = 1;

    const newPersonData = {
      name: formData.get("nghe_danh") as string,
      role_type: (formData.get("nghe_nghiep") as string) || "Actor", 
      avatar_url: avatarUrlInput || null,
      biography: profileMoTa,
      birthday: profileNgaySinh ? profileNgaySinh.toISOString() : null,
      gender: genderInt,
    };

    setIsCreatingPerson(true);
    try {
        const res = await apiClient.post('/people', newPersonData);
        const createdPerson = res.data;

        const personForUI: Person = {
            id: createdPerson.id, 
            name: createdPerson.name,
            roles: createdPerson.role_type,
            avatarUrl: getPersonAvatarUrl(createdPerson.avatar_url),
            biography: createdPerson.biography,
            birthday: createdPerson.birthday,
            gender: createdPerson.gender
        };
        
        setSelectedPersonForRole(personForUI);
        toast.success(`Đã tạo hồ sơ: ${personForUI.name}`);
        
        setCreatePersonOpen(false);
        setPopoverSearchOpen(false); 
        
        setAvatarUrlInput("");
        setProfileMoTa("");
        setProfileNgaySinh(undefined);
        setGenderValue("2");

    } catch (error) {
        console.error("Lỗi tạo người mới:", error);
        toast.error("Không thể tạo hồ sơ mới. Vui lòng thử lại.");
    } finally {
        setIsCreatingPerson(false);
    }
  };

  const handleAddPersonToList = () => {
    if (!selectedPersonForRole) {
      toast.error("Vui lòng chọn hoặc tạo một diễn viên/đạo diễn.");
      return;
    }
    
    onAddActor({
      person: selectedPersonForRole,
      characterName: characterName || "", 
    });
    
    onOpenChange(false);
    setSelectedPersonForRole(null);
    setCharacterName("");
    setSearchPersonValue("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1F1F1F] border-slate-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">THÊM THÀNH VIÊN</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div>
            <label className="text-sm font-medium text-gray-300 mb-1 block">Người đóng</label>
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
                <Command shouldFilter={false}> 
                  <CommandInput 
                    placeholder="Nhập tên để tìm..."
                    className="text-black border-b-slate-700 focus:ring-0"
                    value={searchPersonValue}
                    onValueChange={setSearchPersonValue}
                  />
                  <CommandList>
                    {isSearching ? (
                        <div className="py-6 text-center text-sm text-gray-400 flex justify-center items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin"/> Đang tìm kiếm...
                        </div>
                    ) : foundPeople.length === 0 && searchPersonValue ? (
                        <div className="py-6 text-center text-sm text-gray-400">Không tìm thấy kết quả</div>
                    ) : (
                        <CommandGroup>
                            {foundPeople.map((person) => (
                                <CommandItem
                                key={person.id}
                                value={person.name + person.id}
                                onSelect={() => {
                                    setSelectedPersonForRole(person);
                                    setPopoverSearchOpen(false); 
                                    setSearchPersonValue(''); 
                                }}
                                className="hover:bg-slate-700 cursor-pointer data-[selected=true]:bg-slate-700"
                                >
                                <Check className={cn("mr-2 h-4 w-4", selectedPersonForRole?.id === person.id ? "opacity-100" : "opacity-0")} />
                                <Avatar className="h-8 w-8 mr-3 border border-slate-600">
                                    <AvatarImage src={person.avatarUrl || ''} />
                                    <AvatarFallback className="bg-slate-700 text-xs">
                                        {person.name?.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-white">{person.name}</p>
                                    <p className="text-xs text-gray-400">{person.roles || 'Nghệ sĩ'}</p>
                                </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}

                    <div className="p-2 border-t border-slate-700">
                      <Dialog open={isCreatePersonOpen} onOpenChange={setCreatePersonOpen}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" className="w-full justify-start text-blue-400 hover:text-blue-300 hover:bg-white/5">
                            <Plus className="w-4 h-4 mr-2" />
                            Tạo hồ sơ thủ công...
                          </Button>
                        </DialogTrigger>
                        
                        <DialogContent className="bg-[#1F1F1F] border-slate-700 text-white max-w-lg">
                          <DialogHeader>
                            <DialogTitle className="text-xl">THÊM HỒ SƠ MỚI</DialogTitle>
                          </DialogHeader>
                          <form onSubmit={handleCreateAndAddPerson}>
                            <div className="py-4 space-y-6">
                              <div className="flex flex-col md:flex-row gap-6">
                                <div className="w-full md:w-40 flex-shrink-0 space-y-3">
                                  <div className="w-full h-40 bg-slate-700 rounded-lg overflow-hidden flex items-center justify-center border border-slate-600 relative group">
                                    {avatarUrlInput ? (
                                        <img src={avatarUrlInput} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <ImageIcon className="w-16 h-16 text-slate-500" />
                                    )}
                                  </div>
                                  <div className="relative">
                                    <LinkIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                                    <Input 
                                        placeholder="Dán URL ảnh..." 
                                        className="bg-white/10 border-slate-600 pl-9 text-xs h-9 focus:border-primary"
                                        value={avatarUrlInput}
                                        onChange={(e) => setAvatarUrlInput(e.target.value)}
                                    />
                                  </div>
                                </div>

                                <div className="flex-1 space-y-4">
                                  <div>
                                    <label htmlFor="nghe_danh" className="text-sm font-medium text-gray-300 mb-1 block">Tên nghệ danh <span className="text-red-500">*</span></label>
                                    <Input id="nghe_danh" name="nghe_danh" className="bg-white/10 border-slate-600 focus:border-primary" defaultValue={searchPersonValue} required />
                                  </div>
                                  <div>
                                    <label htmlFor="nghe_nghiep" className="text-sm font-medium text-gray-300 mb-1 block">Vai trò chính</label>
                                    <Select name="nghe_nghiep" defaultValue="Actor">
                                        <SelectTrigger className="w-full bg-white/10 border-slate-600">
                                            <SelectValue placeholder="Chọn vai trò" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#262626] border-slate-700 text-white">
                                            <SelectItem value="Actor">Diễn viên</SelectItem>
                                            <SelectItem value="Director">Đạo diễn</SelectItem>
                                        </SelectContent>
                                    </Select>
                                  </div>
                                  <div className='grid grid-cols-2 gap-4'>
                                      <div> 
                                          <label className="text-sm font-medium text-gray-300 mb-1 block">Giới tính</label>
                                          <Select value={genderValue} onValueChange={setGenderValue}>
                                              <SelectTrigger className="w-full bg-white/10 border-slate-600 focus:ring-0">
                                                  <SelectValue placeholder="Chọn" />
                                              </SelectTrigger>
                                              <SelectContent className="bg-[#262626] border-slate-700 text-white">
                                                  <SelectItem value="Nam">Nam</SelectItem>
                                                  <SelectItem value="Nu">Nữ</SelectItem>
                                                  <SelectItem value="Khac">Khác</SelectItem>
                                              </SelectContent>
                                          </Select>
                                      </div>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="space-y-4">
                                <div> 
                                    <label className="text-sm font-medium text-gray-300 mb-1 block">Ngày sinh</label>
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
                                                {profileNgaySinh ? format(profileNgaySinh, "PPP", { locale: vi }) : <span>Chọn ngày sinh</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0 bg-[#262626] border-slate-700 text-white" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={profileNgaySinh}
                                                onSelect={setProfileNgaySinh}
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
                                <div>
                                  <label htmlFor="mo_ta" className="text-sm font-medium text-gray-300 mb-1 block">Tiểu sử / Mô tả</label>
                                  <Textarea
                                    id="mo_ta"
                                    name="mo_ta"
                                    value={profileMoTa} 
                                    onChange={(e) => setProfileMoTa(e.target.value)}
                                    className="bg-white/10 border-slate-600 focus:border-primary focus:ring-primary min-h-[80px]"
                                    placeholder="Mô tả ngắn về diễn viên..."
                                    maxLength={1000}
                                  />
                                </div>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button type="button" variant="ghost" onClick={() => setCreatePersonOpen(false)} className="text-gray-400 hover:text-white hover:bg-white/10">
                                Hủy bỏ
                              </Button>
                              <Button type="submit" disabled={isCreatingPerson} className="bg-blue-600 hover:bg-blue-700 text-white">
                                {isCreatingPerson ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Đang tạo...</> : "Lưu hồ sơ"}
                              </Button>
                            </DialogFooter>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          
          <div>
            <label htmlFor="character_name" className="text-sm font-medium text-gray-300 mb-1 block">Tên nhân vật trong phim</label>
            <Input 
              id="character_name" 
              className="bg-white/10 border-slate-600 focus:border-primary" 
              placeholder="VD: Iron Man"
              value={characterName}
              onChange={(e) => setCharacterName(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button 
            className="bg-[#E50914] hover:bg-[#b80710] w-full sm:w-auto"
            onClick={handleAddPersonToList}
          >
            Thêm vào danh sách
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}