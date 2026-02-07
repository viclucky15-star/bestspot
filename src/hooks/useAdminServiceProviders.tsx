import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ServiceProvider } from '@/types/serviceProvider';
import { toast } from 'sonner';

export function useAdminServiceProviders() {
  const queryClient = useQueryClient();

  const { data: providers = [], isLoading } = useQuery({
    queryKey: ['admin-service-providers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_providers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as ServiceProvider[];
    },
  });

  const approveProvider = useMutation({
    mutationFn: async (providerId: string) => {
      const { error } = await supabase
        .from('service_providers')
        .update({
          is_approved: true,
          approved_at: new Date().toISOString(),
          rejection_reason: null,
        })
        .eq('id', providerId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-service-providers'] });
      toast.success('Provider approved successfully');
    },
    onError: (error) => {
      console.error('Error approving provider:', error);
      toast.error('Failed to approve provider');
    },
  });

  const rejectProvider = useMutation({
    mutationFn: async ({ providerId, reason }: { providerId: string; reason: string }) => {
      const { error } = await supabase
        .from('service_providers')
        .update({
          is_approved: false,
          rejection_reason: reason,
        })
        .eq('id', providerId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-service-providers'] });
      toast.success('Provider rejected');
    },
    onError: (error) => {
      console.error('Error rejecting provider:', error);
      toast.error('Failed to reject provider');
    },
  });

  const markAsPaid = useMutation({
    mutationFn: async ({ providerId, amount }: { providerId: string; amount: number }) => {
      const { error } = await supabase
        .from('service_providers')
        .update({
          is_paid: true,
          payment_amount: amount,
          payment_date: new Date().toISOString(),
        })
        .eq('id', providerId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-service-providers'] });
      toast.success('Payment marked successfully');
    },
    onError: (error) => {
      console.error('Error marking payment:', error);
      toast.error('Failed to mark payment');
    },
  });

  const pendingProviders = providers.filter(p => !p.is_approved && !p.rejection_reason);
  const approvedProviders = providers.filter(p => p.is_approved);
  const rejectedProviders = providers.filter(p => !p.is_approved && p.rejection_reason);

  return {
    providers,
    pendingProviders,
    approvedProviders,
    rejectedProviders,
    isLoading,
    approveProvider,
    rejectProvider,
    markAsPaid,
  };
}
