import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Payout } from '@/types/business';
import { toast } from 'sonner';

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

  // Create a payment record (pending until receipt is approved)
  const createPaymentRecord = useMutation({
    mutationFn: async ({
      bookingId,
      businessId,
      amount,
      platformCommission,
    }: {
      bookingId: string;
      businessId: string;
      amount: number;
      platformCommission: number;
    }) => {
      const reference = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const businessAmount = amount - platformCommission;

      const { data: payment, error } = await supabase
        .from('payments')
        .insert([{
          booking_id: bookingId,
          user_id: user!.id,
          business_id: businessId,
          amount,
          platform_commission: platformCommission,
          business_amount: businessAmount,
          payment_reference: reference,
          status: 'pending',
          payment_method: 'bank_transfer',
        }])
        .select()
        .single();

      if (error) throw error;
      return payment as PaymentRecord;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-payments'] });
    },
    onError: (error) => {
      console.error('Failed to create payment record:', error);
      toast.error('Failed to create payment record.');
    },
  });

  return {
    payments,
    isLoading,
    createPaymentRecord,
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
        .insert([{
          business_id: businessId!,
          amount,
          bank_name: bankName,
          account_number: accountNumber,
          account_name: accountName,
          status: 'pending',
        }])
        .select()
        .single();

      if (error) throw error;
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
