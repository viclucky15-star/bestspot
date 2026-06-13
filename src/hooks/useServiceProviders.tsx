import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ServiceProvider, ServiceProviderType } from '@/types/serviceProvider';

interface UseServiceProvidersOptions {
  providerType?: ServiceProviderType | 'all';
  state?: string | 'all';
}

export function useServiceProviders(options: UseServiceProvidersOptions = {}) {
  const { providerType = 'all', state = 'all' } = options;

  return useQuery({
    queryKey: ['service-providers', providerType, state],
    queryFn: async () => {
      let query = supabase
        .from('service_providers')
        .select('*')
        .eq('is_approved', true)
        .eq('is_paid', true)
        .order('created_at', { ascending: false });

      if (providerType && providerType !== 'all') {
        query = query.eq('provider_type', providerType as any);
      }

      if (state && state !== 'all') {
        query = query.eq('state', state);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      return (data || []) as ServiceProvider[];
    },
  });
}
