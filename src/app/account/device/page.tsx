// src/app/account/devices/page.tsx
"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";
import DeviceCard from "@/components/account/device/DeviceCard";
import { DeviceSession } from "@/types/device";

// --- MOCK DATA ---
const MOCK_DEVICES: DeviceSession[] = [
  {
    id: "device-1",
    deviceName: "Windows PC",
    os: "Windows 11",
    browser: "Google Chrome",
    location: "TP. Hồ Chí Minh, Việt Nam",
    ipAddress: "113.161.xx.xx",
    lastActive: "Vừa xong",
    isCurrentDevice: true,
    deviceType: "desktop",
  },
  {
    id: "device-2",
    deviceName: "iPhone 14 Pro Max",
    os: "iOS 16.5",
    browser: "Movix Mobile App",
    location: "Hà Nội, Việt Nam",
    ipAddress: "42.113.xx.xx",
    lastActive: "2 giờ trước",
    isCurrentDevice: false,
    deviceType: "mobile",
  },
  {
    id: "device-3",
    deviceName: "Samsung Smart TV",
    os: "Tizen OS",
    browser: "Movix TV App",
    location: "Đà Nẵng, Việt Nam",
    ipAddress: "116.101.xx.xx",
    lastActive: "3 ngày trước",
    isCurrentDevice: false,
    deviceType: "tv",
  }
];

export default function DevicesManagementPage() {
  const [devices, setDevices] = useState<DeviceSession[]>(MOCK_DEVICES);

  const handleLogoutDevice = (id: string) => {
    toast.success("Đã đăng xuất khỏi thiết bị thành công");
    setDevices(devices.filter(device => device.id !== id));
  };

  const handleLogoutAllOtherDevices = () => {
    toast.success("Đã đăng xuất khỏi tất cả các thiết bị khác");
    setDevices(devices.filter(device => device.isCurrentDevice));
  };

  const currentDevice = devices.find(d => d.isCurrentDevice);
  const otherDevices = devices.filter(d => !d.isCurrentDevice);

  return (
    <div className="max-w-4xl dark">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Thiết bị & Đăng nhập</h1>
          <p className="mt-1 text-gray-400">
            Quản lý các thiết bị đang đăng nhập vào tài khoản Movix của bạn.
          </p>
        </div>
        
        {otherDevices.length > 0 && (
          <Button 
            variant="destructive" 
            onClick={handleLogoutAllOtherDevices}
            className="bg-red-900/40 text-red-500 hover:bg-red-600 hover:text-white border border-red-900/50 transition-colors"
          >
            <ShieldAlert className="mr-2 h-4 w-4" />
            Đăng xuất thiết bị khác
          </Button>
        )}
      </div>

      <div className="space-y-8 mt-8">
        {currentDevice && (
          <section>
            <h2 className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wider">
              Thiết bị hiện tại của bạn
            </h2>
            <DeviceCard 
              session={currentDevice} 
              onLogout={handleLogoutDevice} 
            />
          </section>
        )}

        {otherDevices.length > 0 && (
          <section>
             <h2 className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wider">
              Các thiết bị khác ({otherDevices.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {otherDevices.map((device) => (
                <DeviceCard 
                  key={device.id} 
                  session={device} 
                  onLogout={handleLogoutDevice} 
                />
              ))}
            </div>
          </section>
        )}

        {otherDevices.length === 0 && (
          <div className="text-center py-12 border border-dashed border-zinc-800 rounded-lg bg-zinc-900/20">
            <ShieldAlert className="h-12 w-12 text-green-500/50 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-white mb-1">Tài khoản an toàn</h3>
            <p className="text-gray-500 text-sm">Bạn không có phiên đăng nhập nào khác ngoài thiết bị hiện tại.</p>
          </div>
        )}
      </div>
    </div>
  );
}