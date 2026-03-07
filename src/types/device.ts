export type DeviceType = "desktop" | "mobile" | "tablet" | "tv";

export interface DeviceSession {
  id: string;
  deviceName: string;      
  os: string;             
  browser: string;         
  location: string;        
  ipAddress: string;       
  lastActive: string;      
  isCurrentDevice: boolean;
  deviceType: DeviceType;
}