"use client"

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export function ProfileForm() {
  const [displayName, setDisplayName] = useState("Huy Lê");
  const [gender, setGender] = useState("nu");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Updated data:", { displayName, gender });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value="huymynhonabcd@gmail.com"
          disabled
          className="bg-zinc-800 border-zinc-700"
        />
      </div>

      {/* Tên */}
      <div className="space-y-2">
        <Label htmlFor="displayName">Tên hiển thị</Label>
        <Input
          id="displayName"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="bg-zinc-800 border-zinc-700 focus-visible:ring-yellow-500"
        />
      </div>

      {/* Giới tính */}
      <div className="space-y-3">
        <Label>Giới tính</Label>
        <RadioGroup
          defaultValue={gender}
          onValueChange={setGender}
          className="flex gap-6"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="nam" id="nam" />
            <Label htmlFor="nam" className="font-normal">Nam</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="nu" id="nu" />
            <Label htmlFor="nu" className="font-normal">Nữ</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="khac" id="khac" />
            <Label htmlFor="khac" className="font-normal">Không xác định</Label>
          </div>
        </RadioGroup>
      </div>
      <Button 
        type="submit"
        className="bg-yellow-500 text-black hover:bg-yellow-600 focus-visible:ring-yellow-500"
      >
        Cập nhật
      </Button>
      <p className="text-sm text-gray-400">
        Đặt mật khẩu, nhấn vào{" "}
        <a href="#" className="font-medium text-yellow-500 hover:underline">
          đây
        </a>
      </p>
    </form>
  );
}