-- Add premium status to profiles
ALTER TABLE public.profiles 
ADD COLUMN is_premium boolean DEFAULT false,
ADD COLUMN premium_purchased_at timestamp with time zone;