import apiClient from '@/lib/apiClient';
import { Achievement, UserAchievement } from "@/types/gamification";

export const getAllAchievements = async (page = 1, limit = 100, isActive?: boolean): Promise<{achievements: Achievement[], total: number, page: number, totalPages: number}> => {
  const params: any = { page, limit };
  if (isActive !== undefined) {
    params.isActive = isActive;
  }
  const response = await apiClient.get('/admin/gamification/get-all-achievements', { params });
  return {
    achievements: response.data.data,
    total: response.data.meta.total,
    page: response.data.meta.page,
    totalPages: response.data.meta.totalPages
  };
};

export const createAchievement = async (data: Omit<Achievement, 'id'>): Promise<Achievement> => {
  const response = await apiClient.post('/admin/gamification/create-achievement', data);
  return response.data.data;
};

export const updateAchievement = async (id: string, data: Partial<Achievement>): Promise<Achievement> => {
  const response = await apiClient.put(`/admin/gamification/update-achievement/${id}`, data);
  return response.data.data;
};

export const toggleAchievement = async (id: string): Promise<Achievement> => {
  const response = await apiClient.put(`/admin/gamification/toggle-achievement/${id}`);
  return response.data.data;
};

export const deleteAchievement = async (id: string): Promise<any> => {
  const response = await apiClient.delete(`/admin/gamification/delete-achievement/${id}`);
  return response.data.data;
};

export const getUserAchievements = async (userId: string): Promise<UserAchievement[]> => {
  const response = await apiClient.get(`/admin/gamification/get-achievement/${userId}`);
  return response.data.data;
};

export const grantXpToUser = async (userId: string, xp: number): Promise<any> => {
  const response = await apiClient.post(`/admin/gamification/grant-xp/${userId}`, { xp });
  return response.data.data;
};

export const grantAchievementToUser = async (userId: string, achievementId: string): Promise<any> => {
  const response = await apiClient.post(`/admin/gamification/grant-achievement/${userId}`, { achievementId });
  return response.data.data;
};

export const revokeAchievementFromUser = async (userId: string, achievementId: string): Promise<any> => {
  const response = await apiClient.put(`/admin/gamification/revoke-achievement/${userId}/${achievementId}`);
  return response.data.data;
};

export const searchUsersForGamification = async (q: string): Promise<any[]> => {
  const response = await apiClient.get('/admin/gamification/search-users', { params: { q } });
  return response.data.data;
};

export const getSystemRanks = async (): Promise<any> => {
  const response = await apiClient.get('/admin/gamification/get-system-ranks');
  return response.data.ranks;
};

export const updateSystemRank = async (data: any): Promise<any> => {
  const response = await apiClient.put('/admin/gamification/update-system-rank', data);
  return response.data.ranks;
};

export const getProfile = async (): Promise<any> => {
  const response = await apiClient.get('/gamification/profile');
  return response.data.data;
};

export const getAchievements = async (): Promise<any[]> => {
  const response = await apiClient.get('/gamification/achievements');
  return response.data.data;
};
