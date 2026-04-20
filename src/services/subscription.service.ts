import apiClient from '@/lib/apiClient';
import {
  SubscriptionPlan,
  UserSubscription,
  Transaction,
  TransactionListMeta,
  UserTransactionsQuery,
  UserTransactionsResult,
  ListResponse,
  DetailResponse,
} from '@/types/subscription';

const SUBSCRIPTION_BASE_URL = '/subscription-plans';

const DEFAULT_TRANSACTIONS_META: TransactionListMeta = {
  totalItems: 0,
  currentPage: 1,
  limit: 10,
  totalPages: 0,
};

export const getSubscriptionPlans = async (
  isActive: boolean = true,
): Promise<SubscriptionPlan[]> => {
  try {
    const { data } = await apiClient.get<ListResponse<SubscriptionPlan>>(
      SUBSCRIPTION_BASE_URL,
      {
        params: { isActive },
      },
    );
    return data.data;
  } catch (error: any) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }
};

export const getSubscriptionPlanDetail = async (
  planId: string,
): Promise<SubscriptionPlan & { subscriptions?: UserSubscription[]; transactions?: Transaction[] }> => {
  try {
    const { data } = await apiClient.get<
      DetailResponse<SubscriptionPlan & { subscriptions?: UserSubscription[]; transactions?: Transaction[] }>
    >(`${SUBSCRIPTION_BASE_URL}/${planId}`);
    return data.data;
  } catch (error: any) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }
};

export const getUserSubscription = async (): Promise<UserSubscription | null> => {
  try {
    const response = await apiClient.get('/profile/me/subscription');
    const payload = response.data;
    if (payload?.data === null) {
      return null;
    }

    return (payload?.data || null) as UserSubscription | null;
  } catch (error: any) {
    if (error.response?.status === 404 || error.response?.status === 401) {
      return null;
    }

    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }

    throw error;
  }
};
export const getUserSubscriptionHistory = async (): Promise<UserSubscription[]> => {
  try {
    const response = await apiClient.get('/subscriptions');
    const payload = response.data;
    if (Array.isArray(payload?.data)) {
      return payload.data as UserSubscription[];
    }
    if (Array.isArray(payload)) {
      return payload as UserSubscription[];
    }
    return [];
  } catch (error: any) {
    if (error.response?.status === 404) {
      return [];
    }

    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }

    throw error;
  }
};

export const getUserTransactionHistory = async (
  query: UserTransactionsQuery = {},
): Promise<UserTransactionsResult> => {
  try {
    const { page = 1, limit = 10, status } = query;

    const response = await apiClient.get('/payment/my-transactions', {
      params: {
        page,
        limit,
        ...(status ? { status } : {}),
      },
    });

    const payload = response.data;

    if (payload?.error !== 0) {
      throw new Error(payload?.message || 'Không thể tải lịch sử giao dịch.');
    }

    return {
      items: Array.isArray(payload?.data) ? (payload.data as Transaction[]) : [],
      meta: (payload?.meta || {
        ...DEFAULT_TRANSACTIONS_META,
        currentPage: page,
        limit,
      }) as TransactionListMeta,
    };
  } catch (error: any) {
    if (error.response?.status === 404) {
      return {
        items: [],
        meta: {
          ...DEFAULT_TRANSACTIONS_META,
          currentPage: query.page || 1,
          limit: query.limit || 10,
        },
      };
    }

    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }
};

export const checkUserSubscriptionStatus = async (): Promise<boolean> => {
  try {
    const subscription = await getUserSubscription();
    if (!subscription) return false;

    const endDate = new Date(subscription.end_date);
    return (
      subscription.status === 'ACTIVE' &&
      endDate > new Date()
    );
  } catch {
    return false;
  }
};

export const canCreateWatchParty = async (): Promise<boolean> => {
  try {
    const subscription = await getUserSubscription();
    if (!subscription || !subscription.plan) return false;

    return (
      subscription.status === 'ACTIVE' &&
      subscription.plan.can_create_watch_party === true
    );
  } catch {
    return false;
  }
};

export const getMaxWatchPartyParticipants = async (): Promise<number> => {
  try {
    const subscription = await getUserSubscription();
    if (!subscription || !subscription.plan) return 0;

    if (
      subscription.status === 'ACTIVE' &&
      subscription.plan.can_create_watch_party === true
    ) {
      return subscription.plan.max_watch_party_participants || 0;
    }
    return 0;
  } catch {
    return 0;
  }
};

export const canKickMuteMembers = async (): Promise<boolean> => {
  try {
    const subscription = await getUserSubscription();
    if (!subscription || !subscription.plan) return false;

    return (
      subscription.status === 'ACTIVE' &&
      subscription.plan.can_kick_mute_members === true
    );
  } catch {
    return false;
  }
};

export const getUserSubscriptionLevel = async (): Promise<number> => {
  try {
    const subscription = await getUserSubscription();
    if (!subscription || !subscription.plan) return 0;

    if (
      subscription.status === 'ACTIVE' &&
      new Date(subscription.end_date) > new Date()
    ) {
      return subscription.plan.level || 0;
    }
    return 0;
  } catch {
    return 0;
  }
};

export const getUserSubscriptionBenefits = async (): Promise<Record<string, any> | null> => {
  try {
    const subscription = await getUserSubscription();
    if (!subscription || !subscription.plan) return null;

    if (
      subscription.status === 'ACTIVE' &&
      new Date(subscription.end_date) > new Date()
    ) {
      return subscription.plan.benefits || null;
    }
    return null;
  } catch {
    return null;
  }
};

export const getSubscriptionRemainingDays = async (): Promise<number> => {
  try {
    const subscription = await getUserSubscription();
    if (!subscription) return 0;

    const endDate = new Date(subscription.end_date);
    const now = new Date();

    if (endDate <= now) return 0;

    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  } catch {
    return 0;
  }
};
