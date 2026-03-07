"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Monitor, 
  Smartphone, 
  Tablet, 
  Tv, 
  MapPin, 
  Clock, 
  Globe, 
  LogOut 
} from "lucide-react";
import { DeviceSession } from "@/types/device";

interface DeviceCardProps {
  session: DeviceSession;
  onLogout: (id: string) => void;
}

export default function DeviceCard({ session, onLogout }: DeviceCardProps) {
  const renderDeviceIcon = () => {
    const iconClass = `h-7 w-7 ${session.isCurrentDevice ? 'text-yellow-500' : 'text-gray-400'}`;
    switch (session.deviceType) {
      case "mobile": return <Smartphone className={iconClass} />;
      case "tablet": return <Tablet className={iconClass} />;
      case "tv": return <Tv className={iconClass} />;
      case "desktop":
      default: return <Monitor className={iconClass} />;
    }
  };

  return (
    <Card 
      className={`bg-zinc-900 transition-all duration-300 relative overflow-hidden
        ${session.isCurrentDevice 
          ? 'border-yellow-500 shadow-[0_0_15px_-5px_rgba(234,179,8,0.2)]' 
          : 'border-zinc-800 hover:border-zinc-700'
        }`}
    >
      {session.isCurrentDevice && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-500"></div>
      )}

      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-full shrink-0 ${session.isCurrentDevice ? 'bg-yellow-500/10' : 'bg-zinc-800'}`}>
              {renderDeviceIcon()}
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-semibold text-white">
                  {session.deviceName}
                </h3>
                {session.isCurrentDevice && (
                  <Badge variant="secondary" className="bg-green-500/10 text-green-400 hover:bg-green-500/20 border-none px-2 py-0.5 text-xs">
                    Thiết bị hiện tại
                  </Badge>
                )}
              </div>
              
              <div className="text-sm text-gray-400 flex items-center gap-2">
                <Globe className="h-3.5 w-3.5" />
                <span>{session.browser} trên {session.os}</span>
              </div>
            </div>
          </div>

          {!session.isCurrentDevice && (
            <Button 
              variant="outline" 
              onClick={() => onLogout(session.id)}
              className="w-full sm:w-auto border-zinc-700 text-gray-300 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/50 transition-colors bg-transparent"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Đăng xuất
            </Button>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-zinc-800 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-start gap-2 text-sm text-gray-400">
            <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-gray-500" />
            <div>
              <p className="text-gray-300">{session.location}</p>
              <p className="text-xs mt-0.5">IP: {session.ipAddress}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-2 text-sm text-gray-400 sm:justify-end">
            <Clock className="h-4 w-4 shrink-0 mt-0.5 text-gray-500" />
            <div className="sm:text-right">
              <p className="text-gray-300">Hoạt động gần nhất</p>
              <p className="text-xs mt-0.5 text-yellow-500">{session.lastActive}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}