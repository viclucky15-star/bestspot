import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useBusinessAccount } from '@/hooks/useBusinessAccount';
import { useBusinessBookings } from '@/hooks/useBookings';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { BookingCard } from '@/components/business/BookingCard';
import { ArrowLeft, Calendar, Clock, CheckCircle } from 'lucide-react';

export default function BusinessBookings() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { businessAccount, isLoading: accountLoading } = useBusinessAccount();
  const { 
    bookings, 
    upcomingBookings, 
    pendingBookings, 
    isLoading: bookingsLoading,
    updateBookingStatus,
  } = useBusinessBookings(businessAccount?.id);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!accountLoading && !businessAccount) {
      navigate('/business/onboarding');
    }
  }, [businessAccount, accountLoading, navigate]);

  const isLoading = authLoading || accountLoading || bookingsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  const completedBookings = bookings?.filter(b => b.status === 'completed') || [];
  const cancelledBookings = bookings?.filter(b => b.status === 'cancelled') || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/business')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Bookings</h1>
            <p className="text-sm text-muted-foreground">
              Manage your venue bookings
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <Tabs defaultValue="pending">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="pending" className="relative">
              <Clock className="h-4 w-4 mr-1" />
              Pending
              {pendingBookings && pendingBookings.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {pendingBookings.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="upcoming">
              <Calendar className="h-4 w-4 mr-1" />
              Upcoming
            </TabsTrigger>
            <TabsTrigger value="history">
              <CheckCircle className="h-4 w-4 mr-1" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingBookings?.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <h3 className="font-semibold">No pending bookings</h3>
                <p className="text-sm text-muted-foreground">
                  New booking requests will appear here
                </p>
              </div>
            ) : (
              pendingBookings?.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  variant="business"
                  onConfirm={() => updateBookingStatus.mutate({
                    bookingId: booking.id,
                    status: 'confirmed',
                  })}
                  onCancel={() => updateBookingStatus.mutate({
                    bookingId: booking.id,
                    status: 'cancelled',
                  })}
                  isUpdating={updateBookingStatus.isPending}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-4">
            {upcomingBookings?.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <h3 className="font-semibold">No upcoming bookings</h3>
                <p className="text-sm text-muted-foreground">
                  Confirmed bookings will appear here
                </p>
              </div>
            ) : (
              upcomingBookings?.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  variant="business"
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {completedBookings.length === 0 && cancelledBookings.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <h3 className="font-semibold">No booking history</h3>
                <p className="text-sm text-muted-foreground">
                  Past bookings will appear here
                </p>
              </div>
            ) : (
              <>
                {completedBookings.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    variant="business"
                  />
                ))}
                {cancelledBookings.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    variant="business"
                  />
                ))}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
