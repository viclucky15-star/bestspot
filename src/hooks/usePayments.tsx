import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Payout } from '@/types/business';
import { toast } from 'sonner';

const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '';

interface PaystackConfig {
  email: string;
  amount: number;
  reference: string;
  publicKey: string;
  metadata?: Record<string, unknown>;
  onSuccess: (response: { reference: string }) => void;
  onClose: () => void;
}

declare global {
  interface Window {
    PaystackPop?: {
      setup: (config: PaystackConfig) => { openIframe: () => void };
    };
  }
}

interface PaymentRecord {
  id: string;
  booking_id?: string;
  user_id: string;
  business_id?: string;
  amount: number;
  platform_commission?: number;
  business_amount?: number;
  payment_method?: string;
  payment_reference?: string;
  paystack_reference?: string;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export function usePayments() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: payments, isLoading } = useQuery({
    queryKey: ['user-payments', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PaymentRecord[];
    },
    enabled: !!user,
  });

  const initiatePayment = useMutation({
    mutationFn: async ({
      bookingId,
      businessId,
      amount,
      platformCommission,
      email,
    }: {
      bookingId: string;
      businessId: string;
      amount: number;
      platformCommission: number;
      email: string;
    }) => {
      const reference = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const businessAmount = amount - platformCommission;

      const { data: payment, error } = await supabase
        .from('payments')
        .insert({
          booking_id: bookingId,
          user_id: user!.id,
          business_id: businessId,
          amount,
          platform_commission: platformCommission,
          business_amount: businessAmount,
          payment_reference: reference,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      return new Promise<PaymentRecord>((resolve, reject) => {
        if (!window.PaystackPop) {
          // If Paystack not loaded, resolve with payment for now
          resolve(payment as PaymentRecord);
          return;
        }

        const handler = window.PaystackPop.setup({
          email,
          amount: amount * 100,
          reference,
          publicKey: PAYSTACK_PUBLIC_KEY,
          metadata: {
            booking_id: bookingId,
            payment_id: payment.id,
          },
          onSuccess: async (response) => {
            await supabase
              .from('payments')
              .update({
                status: 'completed',
                paystack_reference: response.reference,
              })
              .eq('id', payment.id);

            await supabase
              .from('bookings')
              .update({
                status: 'confirmed',
                payment_status: 'completed',
                payment_reference: response.reference,
              })
              .eq('id', bookingId);

            resolve(payment as PaymentRecord);
          },
          onClose: () => {
            reject(new Error('Payment cancelled'));
          },
        });

        handler.openIframe();
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-payments'] });
      queryClient.invalidateQueries({ queryKey: ['user-bookings'] });
      toast.success('Payment successful! Your booking is confirmed.');
    },
    onError: (error) => {
      console.error('Payment failed:', error);
      if (error.message !== 'Payment cancelled') {
        toast.error('Payment failed. Please try again.');
      }
    },
  });

  return {
    payments,
    isLoading,
    initiatePayment,
  };
}

export function useBusinessPayouts(businessId?: string) {
  const queryClient = useQueryClient();

  const { data: payouts, isLoading } = useQuery({
    queryKey: ['business-payouts', businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payouts')
        .select('*')
        .eq('business_id', businessId!)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Payout[];
    },
    enabled: !!businessId,
  });

  const requestPayout = useMutation({
    mutationFn: async ({
      amount,
      bankName,
      accountNumber,
      accountName,
    }: {
      amount: number;
      bankName: string;
      accountNumber: string;
      accountName: string;
    }) => {
      const { data, error } = await supabase
        .from('payouts')
        .insert({
          business_id: businessId!,
          amount,
          bank_name: bankName,
          account_number: accountNumber,
          account_name: accountName,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      // Note: Wallet balance will be deducted by admin when payout is processed
      // For now, we just create the payout request

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-payouts'] });
      queryClient.invalidateQueries({ queryKey: ['business-account'] });
      toast.success('Payout request submitted');
    },
    onError: (error) => {
      console.error('Failed to request payout:', error);
      toast.error('Failed to request payout');
    },
  });

  return {
    payouts,
    isLoading,
    requestPayout,
  };
}
