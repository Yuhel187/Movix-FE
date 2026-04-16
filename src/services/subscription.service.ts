import apiClient from "@/lib/apiClient";
import { SubscriptionPlan } from "@/types/subscription";

export const subscriptionService = {
  getAllSubscriptions: async (page: number, take: number, status?: string, planId?: string) => {
    let url = `/admin/subscriptions/getAll?page=${page}&take=${take}`;
    if (status) url += `&status=${status}`;
    if (planId) url += `&planId=${planId}`;
    const res = await apiClient.get(url);
    return res.data;
  },

  getAllPlans: async (): Promise<SubscriptionPlan[]> => {
    const res = await apiClient.get("/admin/subscriptions/plans");
    return res.data;
  },

  createPlan: async (data: Partial<SubscriptionPlan>): Promise<SubscriptionPlan> => {
    const res = await apiClient.post("/admin/subscriptions/create-plan", data);
    return res.data;
  },

  updatePlan: async (id: string, data: Partial<SubscriptionPlan>): Promise<SubscriptionPlan> => {
    const res = await apiClient.put(`/admin/subscriptions/update-plan/${id}`, data);
    return res.data;
  },

  togglePlanFlag: async (id: string): Promise<SubscriptionPlan> => {
    const res = await apiClient.post(`/admin/subscriptions/toggle-flag/${id}`);
    return res.data;
  },

  updateSubscriptionStatus: async (id: string, status: string) => {
    const res = await apiClient.post(`/admin/subscriptions/update-status/${id}`, { status });
    return res.data;
  },

  grantSubscription: async (userId: string, planId: string) => {
    const res = await apiClient.post(`/admin/subscriptions/grant`, { userId, planId });
    return res.data;
  }
};
