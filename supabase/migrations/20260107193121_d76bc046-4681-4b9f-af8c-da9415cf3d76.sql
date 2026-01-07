-- Create app roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user', 'business');

-- Create user_roles table for RBAC
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents recursive RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create verification_status enum
CREATE TYPE public.verification_status AS ENUM ('pending', 'under_review', 'approved', 'rejected');

-- Create booking_status enum
CREATE TYPE public.booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed', 'refunded');

-- Create payout_status enum
CREATE TYPE public.payout_status AS ENUM ('pending', 'processing', 'completed', 'failed');

-- Add phone verification to profiles
ALTER TABLE public.profiles 
ADD COLUMN phone_number TEXT,
ADD COLUMN phone_verified BOOLEAN DEFAULT false,
ADD COLUMN phone_verification_code TEXT,
ADD COLUMN phone_verification_expires_at TIMESTAMP WITH TIME ZONE;

-- Update business_accounts table with bank details and enhanced fields
ALTER TABLE public.business_accounts
ADD COLUMN owner_full_name TEXT,
ADD COLUMN bank_name TEXT,
ADD COLUMN bank_account_number TEXT,
ADD COLUMN bank_account_name TEXT,
ADD COLUMN bank_verified BOOLEAN DEFAULT false,
ADD COLUMN wallet_balance NUMERIC(12,2) DEFAULT 0,
ADD COLUMN total_earnings NUMERIC(12,2) DEFAULT 0,
ADD COLUMN documents_submitted BOOLEAN DEFAULT false;

-- Create location_claims table for claim requests
CREATE TABLE public.location_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.business_accounts(id) ON DELETE CASCADE,
  status verification_status DEFAULT 'pending',
  business_name TEXT NOT NULL,
  owner_full_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  phone_verified BOOLEAN DEFAULT false,
  cac_document_url TEXT,
  utility_bill_url TEXT,
  signboard_photo_url TEXT,
  rejection_reason TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.location_claims ENABLE ROW LEVEL SECURITY;

-- Create new_location_submissions for business owners adding new venues
CREATE TABLE public.new_location_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.business_accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  state TEXT NOT NULL,
  area TEXT NOT NULL,
  address TEXT,
  description TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  image_urls TEXT[] DEFAULT '{}',
  amenities TEXT[] DEFAULT '{}',
  budget_level TEXT NOT NULL,
  estimated_budget_min INTEGER,
  estimated_budget_max INTEGER,
  best_time TEXT,
  contact_phone TEXT,
  status verification_status DEFAULT 'pending',
  rejection_reason TEXT,
  approved_location_id UUID REFERENCES public.locations(id),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.new_location_submissions ENABLE ROW LEVEL SECURITY;

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.business_accounts(id) ON DELETE CASCADE,
  booking_date DATE NOT NULL,
  booking_time TIME,
  end_time TIME,
  number_of_guests INTEGER DEFAULT 1,
  total_amount NUMERIC(12,2) NOT NULL,
  platform_fee NUMERIC(12,2) DEFAULT 0,
  business_amount NUMERIC(12,2) NOT NULL,
  status booking_status DEFAULT 'pending',
  payment_reference TEXT,
  payment_status TEXT DEFAULT 'pending',
  special_requests TEXT,
  cancellation_reason TEXT,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Create payments table
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id UUID REFERENCES public.business_accounts(id) ON DELETE SET NULL,
  amount NUMERIC(12,2) NOT NULL,
  platform_commission NUMERIC(12,2) DEFAULT 0,
  business_amount NUMERIC(12,2) DEFAULT 0,
  payment_method TEXT,
  payment_reference TEXT UNIQUE,
  paystack_reference TEXT,
  status TEXT DEFAULT 'pending',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Create payouts table
CREATE TABLE public.payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.business_accounts(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  status payout_status DEFAULT 'pending',
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  account_name TEXT NOT NULL,
  transfer_code TEXT,
  transfer_reference TEXT,
  failure_reason TEXT,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

-- Create reviews table
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  business_response TEXT,
  responded_at TIMESTAMP WITH TIME ZONE,
  is_verified_booking BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(location_id, user_id, booking_id)
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Create platform_settings table for admin configuration
CREATE TABLE public.platform_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Insert default platform settings
INSERT INTO public.platform_settings (key, value, description) VALUES
('commission_rate', '{"percentage": 10}', 'Platform commission percentage on bookings'),
('featured_listing_prices', '{"7_days": 5000, "14_days": 8000, "30_days": 15000}', 'Featured listing prices in Naira'),
('subscription_prices', '{"basic": 0, "premium": 10000, "enterprise": 50000}', 'Monthly subscription prices in Naira'),
('payout_schedule', '{"type": "weekly", "min_amount": 1000}', 'Payout schedule configuration');

-- Create storage bucket for business documents
INSERT INTO storage.buckets (id, name, public) VALUES ('business-documents', 'business-documents', false);

-- RLS policies for location_claims
CREATE POLICY "Business owners can view own claims"
ON public.location_claims FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.business_accounts ba
  WHERE ba.id = location_claims.business_id AND ba.user_id = auth.uid()
));

CREATE POLICY "Business owners can create claims"
ON public.location_claims FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.business_accounts ba
  WHERE ba.id = location_claims.business_id AND ba.user_id = auth.uid()
));

CREATE POLICY "Admins can manage all claims"
ON public.location_claims FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- RLS policies for new_location_submissions
CREATE POLICY "Business owners can view own submissions"
ON public.new_location_submissions FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.business_accounts ba
  WHERE ba.id = new_location_submissions.business_id AND ba.user_id = auth.uid()
));

CREATE POLICY "Business owners can create submissions"
ON public.new_location_submissions FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.business_accounts ba
  WHERE ba.id = new_location_submissions.business_id AND ba.user_id = auth.uid()
));

CREATE POLICY "Business owners can update own submissions"
ON public.new_location_submissions FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.business_accounts ba
  WHERE ba.id = new_location_submissions.business_id AND ba.user_id = auth.uid()
));

CREATE POLICY "Admins can manage all submissions"
ON public.new_location_submissions FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- RLS policies for bookings
CREATE POLICY "Users can view own bookings"
ON public.bookings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Business owners can view their bookings"
ON public.bookings FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.business_accounts ba
  WHERE ba.id = bookings.business_id AND ba.user_id = auth.uid()
));

CREATE POLICY "Users can create bookings"
ON public.bookings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookings"
ON public.bookings FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Business owners can update their bookings"
ON public.bookings FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.business_accounts ba
  WHERE ba.id = bookings.business_id AND ba.user_id = auth.uid()
));

CREATE POLICY "Admins can manage all bookings"
ON public.bookings FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- RLS policies for payments
CREATE POLICY "Users can view own payments"
ON public.payments FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Business owners can view their payments"
ON public.payments FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.business_accounts ba
  WHERE ba.id = payments.business_id AND ba.user_id = auth.uid()
));

CREATE POLICY "Users can create payments"
ON public.payments FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all payments"
ON public.payments FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- RLS policies for payouts
CREATE POLICY "Business owners can view own payouts"
ON public.payouts FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.business_accounts ba
  WHERE ba.id = payouts.business_id AND ba.user_id = auth.uid()
));

CREATE POLICY "Business owners can request payouts"
ON public.payouts FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.business_accounts ba
  WHERE ba.id = payouts.business_id AND ba.user_id = auth.uid()
));

CREATE POLICY "Admins can manage all payouts"
ON public.payouts FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- RLS policies for reviews
CREATE POLICY "Reviews are viewable by everyone"
ON public.reviews FOR SELECT
USING (true);

CREATE POLICY "Users can create reviews"
ON public.reviews FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
ON public.reviews FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Business owners can respond to reviews"
ON public.reviews FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.locations l
  JOIN public.business_accounts ba ON ba.id = l.owner_business_id
  WHERE l.id = reviews.location_id AND ba.user_id = auth.uid()
));

CREATE POLICY "Users can delete own reviews"
ON public.reviews FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for platform_settings
CREATE POLICY "Anyone can view platform settings"
ON public.platform_settings FOR SELECT
USING (true);

CREATE POLICY "Admins can manage platform settings"
ON public.platform_settings FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Storage policies for business-documents bucket
CREATE POLICY "Business owners can upload documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'business-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Business owners can view own documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'business-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can view all documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'business-documents' AND public.has_role(auth.uid(), 'admin'));

-- Update locations table to allow business owners to update their claimed locations
CREATE POLICY "Business owners can update claimed locations"
ON public.locations FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.business_accounts ba
  WHERE ba.id = locations.owner_business_id AND ba.user_id = auth.uid()
));

-- Trigger to update location rating when review is added
CREATE OR REPLACE FUNCTION public.update_location_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.locations
  SET 
    rating = (SELECT COALESCE(AVG(rating), 0) FROM public.reviews WHERE location_id = COALESCE(NEW.location_id, OLD.location_id)),
    total_reviews = (SELECT COUNT(*) FROM public.reviews WHERE location_id = COALESCE(NEW.location_id, OLD.location_id))
  WHERE id = COALESCE(NEW.location_id, OLD.location_id);
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER on_review_change
AFTER INSERT OR UPDATE OR DELETE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_location_rating();

-- Trigger to update business wallet on payment completion
CREATE OR REPLACE FUNCTION public.update_business_wallet()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.business_accounts
    SET 
      wallet_balance = wallet_balance + NEW.business_amount,
      total_earnings = total_earnings + NEW.business_amount
    WHERE id = NEW.business_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_payment_complete
AFTER UPDATE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.update_business_wallet();