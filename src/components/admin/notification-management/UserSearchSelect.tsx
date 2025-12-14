/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Search, User as UserIcon, Flag } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import apiClient from "@/lib/apiClient";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface UserOption {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  is_flagged: boolean;
}

interface UserSearchSelectProps {
  value: string;
  onChange: (userId: string) => void;
}

export function UserSearchSelect({ value, onChange }: UserSearchSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [users, setUsers] = React.useState<UserOption[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [flaggedOnly, setFlaggedOnly] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<UserOption | null>(null);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, flaggedOnly]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {
        q: searchQuery,
        take: 10,
        flagged: flaggedOnly, 
      };
      const res = await apiClient.get("/profile/admin/users", { params });
      const mapped = res.data.data.map((u: any) => ({
        id: u.id,
        username: u.username,
        display_name: u.display_name || u.username,
        avatar_url: u.avatar_url,
        is_flagged: u.is_flagged,
      }));
      setUsers(mapped);
      
      if (value && !selectedUser) {
         const found = mapped.find((u: any) => u.id === value);
         if (found) setSelectedUser(found);
      }

    } catch (error) {
      console.error("Error searching users", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between bg-black/20 border-slate-700 text-white hover:bg-white/5"
          >
            {selectedUser ? (
                <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                        <AvatarImage src={selectedUser.avatar_url || ""} />
                        <AvatarFallback>{selectedUser.username[0]}</AvatarFallback>
                    </Avatar>
                    <span>{selectedUser.display_name}</span>
                </div>
            ) : (
              <span className="text-slate-400">Tìm kiếm người dùng...</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0 bg-[#1F1F1F] border-slate-700 text-white" align="start">
            <div className="p-3 border-b border-slate-700 flex items-center gap-2">
                <Switch 
                    id="flagged-mode" 
                    checked={flaggedOnly} 
                    onCheckedChange={setFlaggedOnly}
                    className="data-[state=checked]:bg-red-600"
                />
                <Label htmlFor="flagged-mode" className="text-xs text-slate-300 cursor-pointer">
                    Chỉ hiện User bị gắn cờ (Flagged)
                </Label>
            </div>

          <Command shouldFilter={false} className="bg-transparent">
            <CommandInput 
                placeholder="Nhập tên hoặc email..." 
                value={searchQuery}
                onValueChange={setSearchQuery}
                className="border-none focus:ring-0 text-white"
            />
            <CommandList>
              {loading && <div className="py-6 text-center text-xs text-slate-500">Đang tải...</div>}
              {!loading && users.length === 0 && (
                <CommandEmpty>Không tìm thấy người dùng.</CommandEmpty>
              )}
              <CommandGroup>
                {users.map((user) => (
                  <CommandItem
                    key={user.id}
                    value={user.id}
                    onSelect={() => {
                      onChange(user.id);
                      setSelectedUser(user);
                      setOpen(false);
                    }}
                    className="cursor-pointer data-[selected=true]:bg-zinc-800 data-[selected=true]:text-white"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === user.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex items-center gap-3 flex-1 overflow-hidden">
                        <Avatar className="h-8 w-8 border border-slate-600">
                            <AvatarImage src={user.avatar_url || ""} />
                            <AvatarFallback>{user.username[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col truncate">
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-white truncate">{user.display_name}</span>
                                {user.is_flagged && <Flag className="w-3 h-3 text-red-500 fill-red-500" />}
                            </div>
                            <span className="text-xs text-slate-400 truncate">@{user.username}</span>
                        </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}