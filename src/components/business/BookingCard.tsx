import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Clock, Users, MapPin, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Booking, BookingStatus } from '@/types/business';

interface BookingCardProps {
  booking: Booking;
  variant?: 'user' | 'business';
  onConfirm?: () => void;
  onCancel?: () => void;
  isUpdating?: boolean;
}

const statusConfig: Record<BookingStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'Pending', variant: 'secondary' },
  confirmed: { label: 'Confirmed', variant: 'default' },
  cancelled: { label: 'Cancelled', variant: 'destructive' },
  completed: { label: 'Completed', variant: 'outline' },
  refunded: { label: 'Refunded', variant: 'outline' },
};

export function BookingCard({
  booking,
  variant = 'user',
  onConfirm,
  onCancel,
  isUpdating,
}: BookingCardProps) {
  const status = statusConfig[booking.status];
  const isPending = booking.status === 'pending';
  const isUpcoming = new Date(booking.booking_date) >= new Date();

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Location Image */}
          {booking.locations?.image_url && (
            <img
              src={booking.locations.image_url}
              alt={booking.locations.name}
              className="w-20 h-20 rounded-lg object-cover"
            />
          )}

          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold truncate">{booking.locations?.name}</h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {booking.locations?.area}, {booking.locations?.state}
                </p>
              </div>
              <Badge variant={status.variant}>{status.label}</Badge>
            </div>

            {/* Details */}
            <div className="mt-2 flex flex-wrap gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {format(new Date(booking.booking_date), 'MMM d, yyyy')}
              </span>
              {booking.booking_time && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {booking.booking_time}
                </span>
              )}
              {booking.number_of_guests && (
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {booking.number_of_guests} guest{booking.number_of_guests > 1 ? 's' : ''}
                </span>
              )}
            </div>

            {/* Guest info for business view */}
            {variant === 'business' && booking.profiles && (
              <div className="mt-2 flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={booking.profiles.avatar_url || undefined} />
                  <AvatarFallback>
                    {booking.profiles.full_name?.charAt(0) || 'G'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">{booking.profiles.full_name || 'Guest'}</span>
              </div>
            )}

            {/* Amount */}
            <div className="mt-2 flex items-center justify-between">
              <span className="font-semibold">
                ₦{booking.total_amount.toLocaleString()}
              </span>

              {/* Actions */}
              {variant === 'business' && isPending && isUpcoming && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 mr-1" />
                        Decline
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    onClick={onConfirm}
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Confirm
                      </>
                    )}
                  </Button>
                </div>
              )}

              {variant === 'user' && isPending && isUpcoming && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={onCancel}
                  disabled={isUpdating}
                >
                  Cancel
                </Button>
              )}
            </div>

            {/* Special requests */}
            {booking.special_requests && (
              <p className="mt-2 text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                "{booking.special_requests}"
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
