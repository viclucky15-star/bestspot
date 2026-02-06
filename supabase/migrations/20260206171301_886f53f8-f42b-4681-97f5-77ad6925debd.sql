-- Create enum for service provider types
CREATE TYPE public.service_provider_type AS ENUM ('photographer', 'cinematographer', 'tour_guide');

-- Create service_providers table
CREATE TABLE public.service_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  provider_type service_provider_type NOT NULL,
  full_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  state TEXT NOT NULL,
  area TEXT,
  bio TEXT,
  is_approved BOOLEAN DEFAULT false,
  is_paid BOOLEAN DEFAULT false,
  payment_amount NUMERIC DEFAULT 0,
  payment_date TIMESTAMP WITH TIME ZONE,
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.service_providers ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can create their own provider profile
CREATE POLICY "Users can create own provider profile"
ON public.service_providers
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can view their own provider profile
CREATE POLICY "Users can view own provider profile"
ON public.service_providers
FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own provider profile
CREATE POLICY "Users can update own provider profile"
ON public.service_providers
FOR UPDATE
USING (auth.uid() = user_id);

-- Admins can manage all provider profiles
CREATE POLICY "Admins can manage all providers"
ON public.service_providers
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Public can view approved AND paid providers only
CREATE POLICY "Public can view paid approved providers"
ON public.service_providers
FOR SELECT
USING (is_approved = true AND is_paid = true);

-- Add trigger for updated_at
CREATE TRIGGER update_service_providers_updated_at
BEFORE UPDATE ON public.service_providers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();