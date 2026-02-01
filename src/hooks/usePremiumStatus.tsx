import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function usePremiumStatus() {
  const { user } = useAuth();

  const { data: isPremium, isLoading } = useQuery({
    queryKey: ['premium-status', user?.id],
    queryFn: async () => {
      if (!user) return false;

      const { data, error } = await supabase
        .from('profiles')
        .select('is_premium')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching premium status:', error);
        return false;
      }

      return data?.is_premium ?? false;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    isPremium: isPremium ?? false,
    isLoading: isLoading && !!user,
  };
}
