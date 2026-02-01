import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface PaymentReceipt {
  id: string;
  user_id: string;
  amount: number;
  receipt_url: string;
  bank_reference: string | null;
  status: 'pending' | 'approved' | 'rejected';
  payment_type: 'premium_upgrade' | 'booking';
  rejection_reason: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
}

export interface PaymentReceiptWithUser extends PaymentReceipt {
  profiles?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

export function usePaymentReceipts() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get user's payment receipts
  const { data: receipts, isLoading } = useQuery({
    queryKey: ['payment-receipts', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_receipts')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PaymentReceipt[];
    },
    enabled: !!user,
  });

  // Check for pending receipt of a specific type
  const getPendingReceipt = (paymentType: 'premium_upgrade' | 'booking', bookingId?: string) => {
    if (!receipts) return null;
    return receipts.find(r => {
      if (r.status !== 'pending') return false;
      if (r.payment_type !== paymentType) return false;
      if (bookingId && r.metadata && (r.metadata as any).booking_id !== bookingId) return false;
      return true;
    });
  };

  // Upload receipt image to storage
  const uploadReceiptImage = async (file: File): Promise<string> => {
    if (!user) throw new Error('Not authenticated');

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('payment-receipts')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('payment-receipts')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  // Submit a new payment receipt
  const submitReceipt = useMutation({
    mutationFn: async ({
      amount,
      receiptFile,
      bankReference,
      paymentType,
      metadata,
    }: {
      amount: number;
      receiptFile: File;
      bankReference?: string;
      paymentType: 'premium_upgrade' | 'booking';
      metadata?: Record<string, unknown>;
    }) => {
      if (!user) throw new Error('Not authenticated');

      // Upload the receipt image
      const receiptUrl = await uploadReceiptImage(receiptFile);

      // Create the payment receipt record
      const { data, error } = await supabase
        .from('payment_receipts')
        .insert([{
          user_id: user.id,
          amount,
          receipt_url: receiptUrl,
          bank_reference: bankReference || null,
          payment_type: paymentType,
          status: 'pending',
          metadata: (metadata || {}) as unknown as Record<string, never>,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-receipts'] });
      toast.success('Receipt submitted! Awaiting admin approval.');
    },
    onError: (error) => {
      console.error('Failed to submit receipt:', error);
      toast.error('Failed to submit receipt. Please try again.');
    },
  });

  return {
    receipts,
    isLoading,
    getPendingReceipt,
    submitReceipt,
  };
}

// Hook for admin to manage all payment receipts
export function useAdminPaymentReceipts() {
  const queryClient = useQueryClient();

  const { data: allReceipts, isLoading } = useQuery({
    queryKey: ['admin-payment-receipts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_receipts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Fetch user profiles separately
      const userIds = [...new Set(data.map(r => r.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds);
      
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      
      return data.map(receipt => ({
        ...receipt,
        profiles: profileMap.get(receipt.user_id) || { full_name: null, avatar_url: null },
      })) as PaymentReceiptWithUser[];
    },
  });

  const approveReceipt = useMutation({
    mutationFn: async (receiptId: string) => {
      // Get the receipt details first
      const { data: receipt, error: fetchError } = await supabase
        .from('payment_receipts')
        .select('*')
        .eq('id', receiptId)
        .single();

      if (fetchError) throw fetchError;

      // Update the receipt status
      const { error: updateError } = await supabase
        .from('payment_receipts')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', receiptId);

      if (updateError) throw updateError;

      // Handle based on payment type
      if (receipt.payment_type === 'premium_upgrade') {
        // Activate premium for the user
        const { error: premiumError } = await supabase
          .from('profiles')
          .update({
            is_premium: true,
            premium_purchased_at: new Date().toISOString(),
          })
          .eq('id', receipt.user_id);

        if (premiumError) throw premiumError;
      } else if (receipt.payment_type === 'booking') {
        // Update booking payment status
        const bookingId = (receipt.metadata as any)?.booking_id;
        if (bookingId) {
          const { error: bookingError } = await supabase
            .from('bookings')
            .update({
              payment_status: 'completed',
              status: 'confirmed',
            })
            .eq('id', bookingId);

          if (bookingError) throw bookingError;
        }
      }

      return receipt;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-payment-receipts'] });
      toast.success('Payment approved successfully!');
    },
    onError: (error) => {
      console.error('Failed to approve receipt:', error);
      toast.error('Failed to approve payment.');
    },
  });

  const rejectReceipt = useMutation({
    mutationFn: async ({
      receiptId,
      reason,
    }: {
      receiptId: string;
      reason: string;
    }) => {
      const { error } = await supabase
        .from('payment_receipts')
        .update({
          status: 'rejected',
          rejection_reason: reason,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', receiptId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-payment-receipts'] });
      toast.success('Payment rejected.');
    },
    onError: (error) => {
      console.error('Failed to reject receipt:', error);
      toast.error('Failed to reject payment.');
    },
  });

  const pendingReceipts = allReceipts?.filter(r => r.status === 'pending') || [];
  const reviewedReceipts = allReceipts?.filter(r => r.status !== 'pending') || [];

  return {
    allReceipts,
    pendingReceipts,
    reviewedReceipts,
    isLoading,
    approveReceipt,
    rejectReceipt,
  };
}
