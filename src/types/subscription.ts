export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billingCycle: "MONTHLY" | "YEARLY";
  features: string[];
  isActive: boolean;
  color?: string;
  recommended?: boolean;
}