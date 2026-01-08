import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface BusinessAccount {
  id: string;
  user_id: string;
  business_name: string;
  business_email: string;
  phone_number: string | null;
  business_type: string;
  verification_status: string;
  subscription_tier: string;
  subscription_expires_at: string | null;
  created_at: string;
  updated_at: string;
  owner_full_name?: string | null;
  bank_name?: string | null;
  bank_account_number?: string | null;
  bank_account_name?: string | null;
  bank_verified?: boolean;
  wallet_balance?: number;
  total_earnings?: number;
  documents_submitted?: boolean;
}

export interface BusinessLocation {
  id: string;
  business_id: string;
  location_id: string;
  is_owner: boolean;
  created_at: string;
  location?: {
    id: string;
    name: string;
    image_url: string | null;
    area: string;
    state: string;
    category: string;
  };
}

export function useBusinessAccount() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: businessAccount, isLoading, refetch } = useQuery({
    queryKey: ['businessAccount', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('business_accounts')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data as BusinessAccount | null;
    },
    enabled: !!user?.id,
  });

  const { data: businessLocations, isLoading: locationsLoading } = useQuery({
    queryKey: ['businessLocations', businessAccount?.id],
    queryFn: async () => {
      if (!businessAccount?.id) return [];
      
      const { data, error } = await supabase
        .from('business_locations')
        .select(`
          *,
          location:locations(id, name, image_url, area, state, category)
        `)
        .eq('business_id', businessAccount.id);

      if (error) throw error;
      return data as BusinessLocation[];
    },
    enabled: !!businessAccount?.id,
  });

  const createBusinessAccount = useMutation({
    mutationFn: async (data: {
      business_name: string;
      business_email: string;
      phone_number?: string;
      business_type?: string;
    }) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { data: result, error } = await supabase
        .from('business_accounts')
        .insert({
          user_id: user.id,
          business_name: data.business_name,
          business_email: data.business_email,
          phone_number: data.phone_number || null,
          business_type: data.business_type || 'venue',
        })
        .select()
        .single();

      if (error) throw error;

      // Add 'business' role to user_roles table
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: user.id,
          role: 'business',
        });

      if (roleError) {
        console.error('Failed to assign business role:', roleError);
        // Don't throw - business account was created successfully
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businessAccount'] });
      queryClient.invalidateQueries({ queryKey: ['userRoles'] });
      toast.success('Business account created successfully!');
    },
    onError: (error) => {
      toast.error('Failed to create business account');
      console.error(error);
    },
  });

  const claimLocation = useMutation({
    mutationFn: async (locationId: string) => {
      if (!businessAccount?.id) throw new Error('No business account');

      // Link the location to the business
      const { error: linkError } = await supabase
        .from('business_locations')
        .insert({
          business_id: businessAccount.id,
          location_id: locationId,
          is_owner: true,
        });

      if (linkError) throw linkError;

      // Update the location to mark as claimed
      const { error: updateError } = await supabase
        .from('locations')
        .update({ 
          is_claimed: true,
          owner_business_id: businessAccount.id 
        })
        .eq('id', locationId);

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businessLocations'] });
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast.success('Location claimed successfully!');
    },
    onError: (error) => {
      toast.error('Failed to claim location');
      console.error(error);
    },
  });

  return {
    businessAccount,
    businessLocations,
    isLoading,
    locationsLoading,
    createBusinessAccount,
    claimLocation,
    refetch,
    hasBusinessAccount: !!businessAccount,
  };
}
