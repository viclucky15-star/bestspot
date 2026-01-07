import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Review } from '@/types/business';
import { toast } from 'sonner';

export function useLocationReviews(locationId?: string) {
  const { data: reviews, isLoading } = useQuery({
    queryKey: ['location-reviews', locationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles:user_id (full_name, avatar_url)
        `)
        .eq('location_id', locationId!)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Review[];
    },
    enabled: !!locationId,
  });

  const averageRating = reviews?.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  return {
    reviews,
    isLoading,
    averageRating,
    totalReviews: reviews?.length || 0,
  };
}

export function useUserReviews() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: reviews, isLoading } = useQuery({
    queryKey: ['user-reviews', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Review[];
    },
    enabled: !!user,
  });

  const createReview = useMutation({
    mutationFn: async ({
      locationId,
      bookingId,
      rating,
      comment,
    }: {
      locationId: string;
      bookingId?: string;
      rating: number;
      comment?: string;
    }) => {
      const { data, error } = await supabase
        .from('reviews')
        .insert({
          location_id: locationId,
          user_id: user!.id,
          booking_id: bookingId,
          rating,
          comment,
          is_verified_booking: !!bookingId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['location-reviews'] });
      toast.success('Review submitted!');
    },
    onError: (error) => {
      console.error('Failed to submit review:', error);
      toast.error('Failed to submit review');
    },
  });

  const updateReview = useMutation({
    mutationFn: async ({
      reviewId,
      rating,
      comment,
    }: {
      reviewId: string;
      rating: number;
      comment?: string;
    }) => {
      const { error } = await supabase
        .from('reviews')
        .update({ rating, comment })
        .eq('id', reviewId)
        .eq('user_id', user!.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['location-reviews'] });
      toast.success('Review updated!');
    },
    onError: (error) => {
      console.error('Failed to update review:', error);
      toast.error('Failed to update review');
    },
  });

  const deleteReview = useMutation({
    mutationFn: async (reviewId: string) => {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId)
        .eq('user_id', user!.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['location-reviews'] });
      toast.success('Review deleted');
    },
    onError: (error) => {
      console.error('Failed to delete review:', error);
      toast.error('Failed to delete review');
    },
  });

  return {
    reviews,
    isLoading,
    createReview,
    updateReview,
    deleteReview,
  };
}

export function useBusinessReviews(businessId?: string) {
  const queryClient = useQueryClient();

  const { data: reviews, isLoading } = useQuery({
    queryKey: ['business-reviews', businessId],
    queryFn: async () => {
      // Get all locations for this business
      const { data: locations } = await supabase
        .from('business_locations')
        .select('location_id')
        .eq('business_id', businessId!);

      if (!locations?.length) return [];

      const locationIds = locations.map(l => l.location_id);

      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles:user_id (full_name, avatar_url),
          locations:location_id (name)
        `)
        .in('location_id', locationIds)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Review[];
    },
    enabled: !!businessId,
  });

  const respondToReview = useMutation({
    mutationFn: async ({
      reviewId,
      response,
    }: {
      reviewId: string;
      response: string;
    }) => {
      const { error } = await supabase
        .from('reviews')
        .update({
          business_response: response,
          responded_at: new Date().toISOString(),
        })
        .eq('id', reviewId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-reviews'] });
      toast.success('Response added');
    },
    onError: (error) => {
      console.error('Failed to respond to review:', error);
      toast.error('Failed to add response');
    },
  });

  return {
    reviews,
    isLoading,
    respondToReview,
  };
}
