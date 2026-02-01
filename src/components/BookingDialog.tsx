import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarIcon, Users, Clock, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useUserBookings } from '@/hooks/useBookings';
import { BankTransferDialog } from '@/components/BankTransferDialog';
import { Location } from '@/types';
import { toast } from 'sonner';

interface BookingDialogProps {
  location: Location;
  trigger?: React.ReactNode;
}

const PLATFORM_FEE_PERCENTAGE = 0.1; // 10% platform fee

export function BookingDialog({ location, trigger }: BookingDialogProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createBooking } = useUserBookings();
  
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState('');
  const [guests, setGuests] = useState(2);
  const [specialRequests, setSpecialRequests] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [createdBookingId, setCreatedBookingId] = useState<string | null>(null);

  // Calculate amounts
  const baseAmount = location.estimated_budget_min || 5000;
  const platformFee = Math.round(baseAmount * PLATFORM_FEE_PERCENTAGE);
  const totalAmount = baseAmount + platformFee;
  const businessAmount = baseAmount;

  const handleBooking = async () => {
    if (!user) {
      toast.error('Please sign in to make a booking');
      navigate('/auth');
      return;
    }

    if (!date) {
      toast.error('Please select a date');
      return;
    }

    if (!location.owner_business_id) {
      toast.error('This location is not available for booking');
      return;
    }

    setIsSubmitting(true);

    try {
      const booking = await createBooking.mutateAsync({
        location_id: location.id,
        business_id: location.owner_business_id,
        booking_date: format(date, 'yyyy-MM-dd'),
        booking_time: time || undefined,
        number_of_guests: guests,
        total_amount: totalAmount,
        platform_fee: platformFee,
        business_amount: businessAmount,
        special_requests: specialRequests || undefined,
      });

      // Store booking ID and show payment dialog
      setCreatedBookingId(booking.id);
      setOpen(false);
      setShowPaymentDialog(true);
    } catch (error) {
      console.error('Booking error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = () => {
    // Reset form
    setDate(undefined);
    setTime('');
    setGuests(2);
    setSpecialRequests('');
    setCreatedBookingId(null);
    toast.success('Booking created! Pay and submit your receipt to confirm.');
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger || (
            <Button size="sm" className="gap-1">
              <CalendarIcon className="w-4 h-4" />
              Book
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Book {location.name}</DialogTitle>
            <DialogDescription>
              Fill in the details to make a reservation at this location.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {/* Date Selection */}
            <div className="grid gap-2">
              <Label htmlFor="date">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Time Selection */}
            <div className="grid gap-2">
              <Label htmlFor="time">Time (optional)</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Number of Guests */}
            <div className="grid gap-2">
              <Label htmlFor="guests">Number of Guests</Label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="guests"
                  type="number"
                  min={1}
                  max={50}
                  value={guests}
                  onChange={(e) => setGuests(parseInt(e.target.value) || 1)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Special Requests */}
            <div className="grid gap-2">
              <Label htmlFor="requests">Special Requests (optional)</Label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Textarea
                  id="requests"
                  placeholder="Any special requirements or requests..."
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className="pl-10 min-h-[80px]"
                />
              </div>
            </div>

            {/* Price Summary */}
            <div className="rounded-lg bg-muted/50 p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Base amount</span>
                <span>₦{baseAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Service fee</span>
                <span>₦{platformFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-semibold pt-2 border-t">
                <span>Total</span>
                <span className="text-primary">₦{totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleBooking} 
              disabled={isSubmitting || !date}
              className="flex-1"
            >
              {isSubmitting ? 'Creating Booking...' : 'Continue to Payment'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bank Transfer Payment Dialog */}
      <BankTransferDialog
        open={showPaymentDialog}
        onOpenChange={setShowPaymentDialog}
        amount={totalAmount}
        paymentType="booking"
        metadata={{ booking_id: createdBookingId }}
        onSuccess={handlePaymentSuccess}
      />
    </>
  );
}
