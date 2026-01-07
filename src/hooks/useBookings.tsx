import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Booking, BookingStatus } from '@/types/business';
import { toast } from 'sonner';

export function useUserBookings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['user-bookings', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          locations (id, name, area, state, image_url)
        `)
        .eq('user_id', user!.id)
        .order('booking_date', { ascending: true });

      if (error) throw error;
      return data as Booking[];
    },
    enabled: !!user,
  });

  const createBooking = useMutation({
    mutationFn: async (booking: {
      location_id: string;
      business_id: string;
      booking_date: string;
      booking_time?: string;
      end_time?: string;
      number_of_guests?: number;
      total_amount: number;
      platform_fee: number;
      business_amount: number;
      special_requests?: string;
    }) => {
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          ...booking,
          user_id: user!.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-bookings'] });
      toast.success('Booking created! Please proceed to payment.');
    },
    onError: (error) => {
      console.error('Failed to create booking:', error);
      toast.error('Failed to create booking. Please try again.');
    },
  });

  const cancelBooking = useMutation({
    mutationFn: async ({ bookingId, reason }: { bookingId: string; reason: string }) => {
      const { error } = await supabase
        .from('bookings')
        .update({
          status: 'cancelled' as BookingStatus,
          cancellation_reason: reason,
          cancelled_at: new Date().toISOString(),
        })
        .eq('id', bookingId)
        .eq('user_id', user!.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-bookings'] });
      toast.success('Booking cancelled');
    },
    onError: (error) => {
      console.error('Failed to cancel booking:', error);
      toast.error('Failed to cancel booking');
    },
  });

  return {
    bookings,
    isLoading,
    createBooking,
    cancelBooking,
  };
}

export function useBusinessBookings(businessId?: string) {
  const queryClient = useQueryClient();

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['business-bookings', businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          locations (id, name, area, state, image_url),
          profiles:user_id (full_name, avatar_url)
        `)
        .eq('business_id', businessId!)
        .order('booking_date', { ascending: true });

      if (error) throw error;
      return data as Booking[];
    },
    enabled: !!businessId,
  });

  const updateBookingStatus = useMutation({
    mutationFn: async ({
      bookingId,
      status,
    }: {
      bookingId: string;
      status: BookingStatus;
    }) => {
      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', bookingId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-bookings'] });
      toast.success('Booking status updated');
    },
    onError: (error) => {
      console.error('Failed to update booking:', error);
      toast.error('Failed to update booking status');
    },
  });

  const upcomingBookings = bookings?.filter(
    b => b.status === 'confirmed' && new Date(b.booking_date) >= new Date()
  );

  const pendingBookings = bookings?.filter(b => b.status === 'pending');

  return {
    bookings,
    upcomingBookings,
    pendingBookings,
    isLoading,
    updateBookingStatus,
  };
}
