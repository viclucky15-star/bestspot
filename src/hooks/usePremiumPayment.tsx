import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '';
const PREMIUM_PRICE = 5000; // ₦5,000 one-time payment

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

export function usePremiumPayment() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const upgradeToPremium = useMutation({
    mutationFn: async () => {
      if (!user?.email) {
        throw new Error('Please sign in to upgrade');
      }

      if (!PAYSTACK_PUBLIC_KEY) {
        throw new Error('Payment system not configured');
      }

      if (!window.PaystackPop) {
        throw new Error('Payment system not loaded. Please refresh and try again.');
      }

      const reference = `PREMIUM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      return new Promise<void>((resolve, reject) => {
        const handler = window.PaystackPop!.setup({
          email: user.email!,
          amount: PREMIUM_PRICE * 100, // Paystack expects amount in kobo
          reference,
          publicKey: PAYSTACK_PUBLIC_KEY,
          metadata: {
            user_id: user.id,
            type: 'premium_upgrade',
          },
          onSuccess: async (response) => {
            try {
              // Update user's premium status
              const { error } = await supabase
                .from('profiles')
                .update({
                  is_premium: true,
                  premium_purchased_at: new Date().toISOString(),
                })
                .eq('id', user.id);

              if (error) throw error;

              // Create payment record for tracking
              await supabase.from('payments').insert({
                user_id: user.id,
                amount: PREMIUM_PRICE,
                payment_reference: reference,
                paystack_reference: response.reference,
                status: 'completed',
                payment_method: 'paystack',
                metadata: { type: 'premium_upgrade' },
              });

              resolve();
            } catch (error) {
              console.error('Failed to update premium status:', error);
              reject(new Error('Payment successful but failed to activate premium. Please contact support.'));
            }
          },
          onClose: () => {
            reject(new Error('Payment cancelled'));
          },
        });

        handler.openIframe();
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['premium-status'] });
      toast.success('🎉 Welcome to Premium! Enjoy all features.');
    },
    onError: (error) => {
      console.error('Premium upgrade failed:', error);
      if (error.message !== 'Payment cancelled') {
        toast.error(error.message || 'Upgrade failed. Please try again.');
      }
    },
  });

  return {
    upgradeToPremium,
    isProcessing: upgradeToPremium.isPending,
    premiumPrice: PREMIUM_PRICE,
  };
}
