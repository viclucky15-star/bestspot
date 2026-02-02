import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function usePremiumStatus() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['premium-status', user?.id],
    queryFn: async () => {
      if (!user) return { isPremium: false, isAdmin: false };

      // Check both premium status and admin role in parallel
      const [profileResult, roleResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('is_premium')
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

      return { isPremium, isAdmin };
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Admins get premium access automatically
  const hasPremiumAccess = data?.isPremium || data?.isAdmin || false;

  return {
    isPremium: hasPremiumAccess,
    isLoading: isLoading && !!user,
  };
}
