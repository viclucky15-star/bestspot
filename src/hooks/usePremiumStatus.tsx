import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const TRIAL_PERIOD_DAYS = 7;

export function usePremiumStatus() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['premium-status', user?.id],
    queryFn: async () => {
      if (!user) return { isPremium: false, isAdmin: false, isTrialActive: false, trialDaysLeft: 0 };

      // Check premium status, admin role, and account creation date in parallel
      const [profileResult, roleResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('is_premium, created_at')
          .eq('id', user.id)
          .single(),
        supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .maybeSingle()
      ]);

      const isPremium = profileResult.data?.is_premium ?? false;
      const isAdmin = !!roleResult.data;
      
      // Calculate trial status
      let isTrialActive = false;
      let trialDaysLeft = 0;
      
      if (profileResult.data?.created_at && !isPremium && !isAdmin) {
        const createdAt = new Date(profileResult.data.created_at);
        const now = new Date();
        const daysSinceCreation = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysSinceCreation < TRIAL_PERIOD_DAYS) {
          isTrialActive = true;
          trialDaysLeft = TRIAL_PERIOD_DAYS - daysSinceCreation;
        }
      }

      return { isPremium, isAdmin, isTrialActive, trialDaysLeft };
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Admins get permanent premium access, trial users get temporary access
  const hasPremiumAccess = data?.isPremium || data?.isAdmin || data?.isTrialActive || false;

  return {
    isPremium: hasPremiumAccess,
    isAdmin: data?.isAdmin || false,
    isTrialActive: data?.isTrialActive || false,
    trialDaysLeft: data?.trialDaysLeft || 0,
    isLoading: isLoading && !!user,
  };
}
