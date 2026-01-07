import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { LocationClaim, VerificationStatus } from '@/types/business';
import { toast } from 'sonner';

export function useLocationClaims() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: claims, isLoading } = useQuery({
    queryKey: ['location-claims', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('location_claims')
        .select(`
          *,
          locations (id, name, area, state, image_url)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as LocationClaim[];
    },
    enabled: !!user,
  });

  const submitClaim = useMutation({
    mutationFn: async (claim: {
      location_id: string;
      business_id: string;
      business_name: string;
      owner_full_name: string;
      phone_number: string;
      cac_document_url?: string;
      utility_bill_url?: string;
      signboard_photo_url?: string;
    }) => {
      const { data, error } = await supabase
        .from('location_claims')
        .insert(claim)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['location-claims'] });
      toast.success('Claim submitted! We will review your documents and get back to you.');
    },
    onError: (error) => {
      console.error('Failed to submit claim:', error);
      toast.error('Failed to submit claim. Please try again.');
    },
  });

  const getClaimForLocation = (locationId: string): LocationClaim | undefined => {
    return claims?.find(c => c.location_id === locationId);
  };

  return {
    claims,
    isLoading,
    submitClaim,
    getClaimForLocation,
  };
}

export function useAdminLocationClaims() {
  const queryClient = useQueryClient();

  const { data: allClaims, isLoading } = useQuery({
    queryKey: ['admin-location-claims'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('location_claims')
        .select(`
          *,
          locations (id, name, area, state, image_url),
          business_accounts (business_name, business_email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as LocationClaim[];
    },
  });

  const updateClaimStatus = useMutation({
    mutationFn: async ({
      claimId,
      status,
      rejectionReason,
    }: {
      claimId: string;
      status: VerificationStatus;
      rejectionReason?: string;
    }) => {
      const { data: claim, error: fetchError } = await supabase
        .from('location_claims')
        .select('location_id, business_id')
        .eq('id', claimId)
        .single();

      if (fetchError) throw fetchError;

      const { error: updateError } = await supabase
        .from('location_claims')
        .update({
          status,
          rejection_reason: rejectionReason,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', claimId);

      if (updateError) throw updateError;

      // If approved, update the location to mark it as claimed
      if (status === 'approved') {
        const { error: locationError } = await supabase
          .from('locations')
          .update({
            is_claimed: true,
            owner_business_id: claim.business_id,
          })
          .eq('id', claim.location_id);

        if (locationError) throw locationError;

        // Add to business_locations
        const { error: linkError } = await supabase
          .from('business_locations')
          .insert({
            business_id: claim.business_id,
            location_id: claim.location_id,
            is_owner: true,
          });

        if (linkError && !linkError.message.includes('duplicate')) throw linkError;
      }

      return { claimId, status };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-location-claims'] });
      queryClient.invalidateQueries({ queryKey: ['location-claims'] });
      toast.success(`Claim ${variables.status === 'approved' ? 'approved' : 'rejected'} successfully`);
    },
    onError: (error) => {
      console.error('Failed to update claim:', error);
      toast.error('Failed to update claim status');
    },
  });

  return {
    claims: allClaims,
    isLoading,
    updateClaimStatus,
  };
}
