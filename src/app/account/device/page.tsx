// src/app/account/devices/page.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCcw, ShieldAlert } from "lucide-react";
import DeviceCard from "@/components/account/device/DeviceCard";
import { deviceService } from "@/services/device.service";
import type { DeviceSession, DeviceSessionResponse, DeviceType } from "@/types/device";

const normalizeText = (value: string) => value.trim().toLowerCase();

const detectBrowser = () => {
  if (typeof navigator === "undefined") {
    return "Unknown";
  }

  const userAgent = navigator.userAgent;
  if (userAgent.includes("Edg/")) return "Edge";
  if (userAgent.includes("OPR/") || userAgent.includes("Opera")) return "Opera";
  if (userAgent.includes("CriOS")) return "Chrome";
  if (userAgent.includes("Chrome/")) return "Chrome";
  if (userAgent.includes("Firefox/")) return "Firefox";
  if (userAgent.includes("Safari/")) return userAgent.includes("Mobile/") ? "Mobile Safari" : "Safari";
  return "Unknown";
};

const detectOs = () => {
  if (typeof navigator === "undefined") {
    return "Unknown";
  }

  const userAgent = navigator.userAgent;
  if (userAgent.includes("Windows NT")) return "Windows";
  if (userAgent.includes("Android")) return "Android";
  if (userAgent.includes("iPhone") || userAgent.includes("iPad") || userAgent.includes("iPod")) return "iOS";
  if (userAgent.includes("Mac OS X")) return "macOS";
  if (userAgent.includes("Linux")) return "Linux";
  return "Unknown";
};

const detectDeviceType = (): DeviceType => {
  if (typeof navigator === "undefined") {
    return "unknown";
  }

  const userAgent = navigator.userAgent;
  if (userAgent.includes("iPad")) return "tablet";
  if (userAgent.includes("Android") && !userAgent.includes("Mobile")) return "tablet";
  if (userAgent.includes("Mobi") || userAgent.includes("iPhone") || userAgent.includes("Android")) return "mobile";
  return "desktop";
};

const detectDeviceName = (os: string, deviceType: DeviceType) => {
  if (deviceType === "tablet") {
    return os === "iOS" ? "iPad" : "Tablet";
  }

  if (deviceType === "mobile") {
    if (os === "iOS") return "iPhone";
    if (os === "Android") return "Android";
  }

  return os;
};

const formatFallbackDeviceName = (value: string | null | undefined) => {
  if (!value) {
    return "Thiết bị không xác định";
  }

  return value;
};

const formatFallbackOs = (value: string | null | undefined) => {
  if (!value) {
    return "Unknown";
  }

  return value;
};

const formatFallbackBrowser = (value: string | null | undefined) => {
  if (!value) {
    return "Unknown";
  }

  return value;
};

const formatFallbackDeviceType = (value: DeviceType | null | undefined): DeviceType => {
  if (!value) {
    return "unknown";
  }

  return value;
};

const mapDeviceSession = (item: DeviceSessionResponse): DeviceSession => ({
  id: item.id,
  deviceId: item.device_info?.deviceId || item.id,
  deviceName: formatFallbackDeviceName(item.device_info?.deviceName),
  os: formatFallbackOs(item.device_info?.os),
  browser: formatFallbackBrowser(item.device_info?.browser),
  deviceType: formatFallbackDeviceType(item.device_info?.deviceType),
  ipAddress: item.ip_address || "Không có",
  lastUsedAt: item.last_used_at,
  createdAt: item.createdAt,
  isCurrentDevice: false,
});

const markCurrentDevice = (sessions: DeviceSession[]) => {
  const browser = detectBrowser();
  const os = detectOs();
  const deviceType = detectDeviceType();
  const deviceName = detectDeviceName(os, deviceType);

  const currentCandidates = sessions.filter((session) => {
    return (
      normalizeText(session.browser) === normalizeText(browser) &&
      normalizeText(session.os) === normalizeText(os) &&
      session.deviceType === deviceType &&
      normalizeText(session.deviceName) === normalizeText(deviceName)
    );
  });

  if (currentCandidates.length === 0) {
    return sessions;
  }

  const currentSessionId = currentCandidates.sort((a, b) => {
    return new Date(b.lastUsedAt).getTime() - new Date(a.lastUsedAt).getTime();
  })[0]?.id;

  return sessions.map((session) => ({
    ...session,
    isCurrentDevice: session.id === currentSessionId,
  }));
};

export default function DevicesManagementPage() {
  const [devices, setDevices] = useState<DeviceSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadDevices = useCallback(async (showSpinner = true) => {
    if (showSpinner) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }

    try {
      const response = await deviceService.getLoggedInDevices();
      const rawDevices = Array.isArray(response.data) ? response.data : [];
      const mappedDevices = markCurrentDevice(
        rawDevices.map(mapDeviceSession),
      ).sort((a, b) => {
        return new Date(b.lastUsedAt).getTime() - new Date(a.lastUsedAt).getTime();
      });

      setDevices(mappedDevices);
    } catch (error) {
      const message =
        isAxiosError(error)
          ? error.response?.data?.message || "Không thể tải danh sách thiết bị."
          : "Không thể tải danh sách thiết bị.";
      toast.error(message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDevices();
  }, [loadDevices]);

  const refreshDevices = useCallback(async () => {
    await loadDevices(false);
  }, [loadDevices]);

  const handleLogoutDevice = async (id: string) => {
    const toastId = toast.loading("Đang đăng xuất khỏi thiết bị...");

    try {
      await deviceService.revokeDevice(id);
      toast.success("Đăng xuất khỏi thiết bị thành công", { id: toastId });
      await refreshDevices();
    } catch (error) {
      const message =
        isAxiosError(error)
          ? error.response?.data?.message || "Không thể đăng xuất khỏi thiết bị này."
          : "Không thể đăng xuất khỏi thiết bị này.";
      toast.error(message, { id: toastId });
    }
  };

  const handleLogoutAllOtherDevices = async () => {
    const otherDevices = devices.filter((device) => !device.isCurrentDevice);
    if (otherDevices.length === 0) {
      return;
    }

    const toastId = toast.loading("Đang đăng xuất các thiết bị khác...");

    try {
      await Promise.all(otherDevices.map((device) => deviceService.revokeDevice(device.id)));
      toast.success("Đã đăng xuất khỏi tất cả các thiết bị khác", { id: toastId });
      await refreshDevices();
    } catch (error) {
      const message =
        isAxiosError(error)
          ? error.response?.data?.message || "Không thể đăng xuất toàn bộ thiết bị khác."
          : "Không thể đăng xuất toàn bộ thiết bị khác.";
      toast.error(message, { id: toastId });
      await refreshDevices();
    }
  };

  const currentDevice = devices.find((device) => device.isCurrentDevice);
  const otherDevices = devices.filter((device) => !device.isCurrentDevice);

  return (
    <div className="max-w-4xl dark">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Thiết bị & Đăng nhập</h1>
          <p className="mt-1 text-gray-400">
            Quản lý các phiên đăng nhập đang hoạt động trên tài khoản của bạn.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={refreshDevices}
            disabled={isLoading || isRefreshing}
            className="border-zinc-700 text-gray-300 hover:text-white hover:bg-zinc-800 bg-transparent"
          >
            {isRefreshing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCcw className="mr-2 h-4 w-4" />
            )}
            Làm mới
          </Button>

          {currentDevice && otherDevices.length > 0 && (
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
      </div>

      <div className="space-y-8 mt-8">
        {isLoading ? (
          <div className="text-center py-12 border border-dashed border-zinc-800 rounded-lg bg-zinc-900/20 text-gray-400">
            <Loader2 className="h-10 w-10 animate-spin mx-auto mb-3 text-yellow-500" />
            Đang tải danh sách thiết bị...
          </div>
        ) : (
          <>
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

            {devices.length === 0 && (
              <div className="text-center py-12 border border-dashed border-zinc-800 rounded-lg bg-zinc-900/20">
                <ShieldAlert className="h-12 w-12 text-green-500/50 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-white mb-1">Tài khoản an toàn</h3>
                <p className="text-gray-500 text-sm">
                  Bạn chưa có phiên đăng nhập nào khác đang hoạt động.
                </p>
              </div>
            )}

            {devices.length > 0 && !currentDevice && (
              <div className="text-sm text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                Hệ thống chưa xác định được phiên hiện tại từ trình duyệt này. Bạn vẫn có thể đăng xuất từng thiết bị bên dưới.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}