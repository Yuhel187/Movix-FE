import api from "@/lib/apiClient";
import type { Banner } from "@/types/banner";

export async function getBanners(): Promise<Banner[]> {
  try {
    const { data } = await api.get<any[]>('/banners');
    
    return data.map(item => ({
      id: item.id,
      title: item.title,
      imageUrl: item.image_url || "/images/placeholder-backdrop.png",
      linkUrl: item.link_url || "#",
      isActive: item.is_active
    }));
  } catch (error) {
    console.error("Lỗi lấy banner:", error);
    return [];
  }
}