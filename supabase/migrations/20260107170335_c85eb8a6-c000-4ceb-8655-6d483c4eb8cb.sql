-- Create business_accounts table
CREATE TABLE public.business_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  business_email TEXT NOT NULL,
  phone_number TEXT,
  business_type TEXT DEFAULT 'venue',
  verification_status TEXT DEFAULT 'pending',
  subscription_tier TEXT DEFAULT 'basic',
  subscription_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Create business_locations table (links businesses to locations they manage)
CREATE TABLE public.business_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.business_accounts(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
  is_owner BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, location_id)
);

-- Create featured_listings table (for paid promotions)
CREATE TABLE public.featured_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.business_accounts(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  tier TEXT DEFAULT 'standard',
  amount_paid DECIMAL(10,2),
  payment_status TEXT DEFAULT 'pending',
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create business_analytics table
CREATE TABLE public.business_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.business_accounts(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  views INTEGER DEFAULT 0,
  favorites INTEGER DEFAULT 0,
  planned_visits INTEGER DEFAULT 0,
  clicks_to_maps INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, location_id, date)
);

-- Add business-related columns to locations table
ALTER TABLE public.locations ADD COLUMN owner_business_id UUID REFERENCES public.business_accounts(id);
ALTER TABLE public.locations ADD COLUMN is_claimed BOOLEAN DEFAULT false;

-- Enable RLS on all new tables
ALTER TABLE public.business_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.featured_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for business_accounts
CREATE POLICY "Users can view own business account"
ON public.business_accounts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own business account"
ON public.business_accounts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own business account"
ON public.business_accounts FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for business_locations
CREATE POLICY "Business owners can view their locations"
ON public.business_locations FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.business_accounts ba
  WHERE ba.id = business_id AND ba.user_id = auth.uid()
));

CREATE POLICY "Business owners can link locations"
ON public.business_locations FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.business_accounts ba
  WHERE ba.id = business_id AND ba.user_id = auth.uid()
));

CREATE POLICY "Business owners can unlink locations"
ON public.business_locations FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.business_accounts ba
  WHERE ba.id = business_id AND ba.user_id = auth.uid()
));

-- RLS Policies for featured_listings
CREATE POLICY "Business owners can view own featured listings"
ON public.featured_listings FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.business_accounts ba
  WHERE ba.id = business_id AND ba.user_id = auth.uid()
));

CREATE POLICY "Business owners can create featured listings"
ON public.featured_listings FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.business_accounts ba
  WHERE ba.id = business_id AND ba.user_id = auth.uid()
));

-- RLS Policies for business_analytics
CREATE POLICY "Business owners can view own analytics"
ON public.business_analytics FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.business_accounts ba
  WHERE ba.id = business_id AND ba.user_id = auth.uid()
));

-- Create trigger for updated_at on business_accounts
CREATE TRIGGER update_business_accounts_updated_at
BEFORE UPDATE ON public.business_accounts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();