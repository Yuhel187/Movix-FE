import { useEffect, useState, useCallback } from 'react';
import { subscriptionService } from '@/services/subscription.service';
import type {
  UserSubscription,
  SubscriptionPlan,
} from '@/types/subscription';

interface UseSubscriptionReturn {
  subscription: UserSubscription | null;
  plans: SubscriptionPlan[];
  isActive: boolean;
  canCreateWatchParty: boolean;
  maxWatchPartyParticipants: number;
  canKickMuteMembers: boolean;
  subscriptionLevel: number;
  remainingDays: number;
  benefits: Record<string, any> | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useSubscription(): UseSubscriptionReturn {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isActive, setIsActive] = useState(false);
  const [canWatch, setCanWatch] = useState(false);
  const [maxParticipants, setMaxParticipants] = useState(0);
  const [canKick, setCanKick] = useState(false);
  const [level, setLevel] = useState(0);
  const [days, setDays] = useState(0);
  const [benefits, setBenefits] = useState<Record<string, any> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [sub, plns] = await Promise.all([
        subscriptionService.getUserSubscription(),
        subscriptionService.getSubscriptionPlans(),
      ]);

      const now = new Date();
      const endDate = sub?.end_date ? new Date(sub.end_date) : null;
      const active = !!(
        sub &&
        sub.status === 'ACTIVE' &&
        endDate &&
        endDate > now
      );

      const remainingDays = endDate && endDate > now
        ? Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      const watch = !!(active && sub?.plan?.can_create_watch_party);
      const participants = watch ? (sub?.plan?.max_watch_party_participants || 0) : 0;
      const kick = !!(active && sub?.plan?.can_kick_mute_members);
      const lvl = active ? (sub?.plan?.level || 0) : 0;
      const ben = active ? (sub?.plan?.benefits || null) : null;

      setSubscription(sub);
      setPlans(plns);
      setIsActive(active);
      setCanWatch(watch);
      setMaxParticipants(participants);
      setCanKick(kick);
      setLevel(lvl);
      setBenefits(ben);
      setDays(remainingDays);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch subscription'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();

    // Optional: Refresh every 5 minutes to keep data fresh
    const interval = setInterval(refresh, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [refresh]);

  return {
    subscription,
    plans,
    isActive,
    canCreateWatchParty: canWatch,
    maxWatchPartyParticipants: maxParticipants,
    canKickMuteMembers: canKick,
    subscriptionLevel: level,
    remainingDays: days,
    benefits,
    isLoading,
    error,
    refresh,
  };
}
