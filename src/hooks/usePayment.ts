import { useState, useCallback } from 'react';
import {
  createCheckoutSession,
  getPaymentInfo,
  cancelPayment,
  pollPaymentStatus,
  initiateCheckoutWithRetry,
  formatPaymentInfo,
  getPaymentStatusLabel,
} from '@/services/payment.service';
import type {
  CheckoutResponse,
  PaymentInfoResponse,
  CancelPaymentResponse,
} from '@/types/subscription';

interface UsePaymentReturn {
  // Checkout state
  isCheckingOut: boolean;
  checkoutError: Error | null;
  paymentUrl: string | null;
  transactionId: string | null;
  orderCode: number | null;

  // Payment status state
  paymentInfo: PaymentInfoResponse['data'] | null;
  isCheckingStatus: boolean;
  statusError: Error | null;

  // Actions
  initiateCheckout: (planId: string) => Promise<CheckoutResponse['data'] | null>;
  checkPaymentStatus: (orderId: string) => Promise<PaymentInfoResponse['data'] | null>;
  pollPayment: (orderId: string, maxRetries?: number) => Promise<PaymentInfoResponse['data'] | null>;
  cancelCurrentPayment: (orderId: string, reason?: string) => Promise<CancelPaymentResponse['data'] | null>;

  // Utilities
  clearError: () => void;
  reset: () => void;
}

export function usePayment(): UsePaymentReturn {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<Error | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [orderCode, setOrderCode] = useState<number | null>(null);

  const [paymentInfo, setPaymentInfo] = useState<PaymentInfoResponse['data'] | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [statusError, setStatusError] = useState<Error | null>(null);

  const clearError = useCallback(() => {
    setCheckoutError(null);
    setStatusError(null);
  }, []);

  const reset = useCallback(() => {
    setIsCheckingOut(false);
    setCheckoutError(null);
    setPaymentUrl(null);
    setTransactionId(null);
    setOrderCode(null);
    setPaymentInfo(null);
    setIsCheckingStatus(false);
    setStatusError(null);
  }, []);

  const initiateCheckout = useCallback(
    async (planId: string): Promise<CheckoutResponse['data'] | null> => {
      try {
        clearError();
        setIsCheckingOut(true);

        const result = await initiateCheckoutWithRetry(planId, 3);

        if (!result) {
          throw new Error('No checkout result returned');
        }

        setTransactionId(result.transactionId);
        setOrderCode(result.paymentData.orderCode);
        setPaymentUrl(result.paymentData.paymentUrl);

        // Store in session for later reference
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('transactionId', result.transactionId);
          sessionStorage.setItem('orderCode', result.paymentData.orderCode.toString());
        }

        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to initiate checkout');
        setCheckoutError(error);
        return null;
      } finally {
        setIsCheckingOut(false);
      }
    },
    [clearError],
  );

  const checkPaymentStatus = useCallback(
    async (orderId: string): Promise<PaymentInfoResponse['data'] | null> => {
      try {
        setStatusError(null);
        setIsCheckingStatus(true);

        const info = await getPaymentInfo(orderId);
        setPaymentInfo(info);
        return info;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to get payment info');
        setStatusError(error);
        return null;
      } finally {
        setIsCheckingStatus(false);
      }
    },
    [],
  );

  const pollPayment = useCallback(
    async (orderId: string, maxRetries: number = 12): Promise<PaymentInfoResponse['data'] | null> => {
      try {
        setStatusError(null);
        setIsCheckingStatus(true);

        const info = await pollPaymentStatus(orderId, maxRetries, 5000);
        setPaymentInfo(info);
        return info;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Payment status polling timeout');
        setStatusError(error);
        return null;
      } finally {
        setIsCheckingStatus(false);
      }
    },
    [],
  );

  const cancelCurrentPayment = useCallback(
    async (orderId: string, reason?: string): Promise<CancelPaymentResponse['data'] | null> => {
      try {
        setStatusError(null);

        const result = await cancelPayment(orderId, reason);
        setPaymentInfo(null);
        setTransactionId(null);
        setOrderCode(null);
        setPaymentUrl(null);

        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to cancel payment');
        setStatusError(error);
        return null;
      }
    },
    [],
  );

  return {
    // Checkout state
    isCheckingOut,
    checkoutError,
    paymentUrl,
    transactionId,
    orderCode,

    // Payment status state
    paymentInfo,
    isCheckingStatus,
    statusError,

    // Actions
    initiateCheckout,
    checkPaymentStatus,
    pollPayment,
    cancelCurrentPayment,
    clearError,
    reset,
  };
}

export function useFormattedPaymentInfo(paymentInfo: PaymentInfoResponse['data'] | null) {
  if (!paymentInfo) return null;
  return formatPaymentInfo(paymentInfo);
}

// Helper hook for getting payment status label
export function usePaymentStatusLabel(status: 'PAID' | 'PENDING' | 'EXPIRED' | 'CANCELLED' | null) {
  if (!status) return '';
  return getPaymentStatusLabel(status);
}
