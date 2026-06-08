
-- 1. Create profiles_private for sensitive phone data
CREATE TABLE public.profiles_private (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone_number text,
  phone_verification_code text,
  phone_verification_expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles_private TO authenticated;
GRANT ALL ON public.profiles_private TO service_role;

ALTER TABLE public.profiles_private ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can read own private data"
  ON public.profiles_private FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Owner can insert own private data"
  ON public.profiles_private FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owner can update own private data"
  ON public.profiles_private FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owner can delete own private data"
  ON public.profiles_private FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER profiles_private_set_updated_at
  BEFORE UPDATE ON public.profiles_private
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Migrate existing data
INSERT INTO public.profiles_private (user_id, phone_number, phone_verification_code, phone_verification_expires_at)
SELECT id, phone_number, phone_verification_code, phone_verification_expires_at
FROM public.profiles
WHERE phone_number IS NOT NULL
   OR phone_verification_code IS NOT NULL
   OR phone_verification_expires_at IS NOT NULL
ON CONFLICT (user_id) DO NOTHING;

-- Drop sensitive cols from profiles
ALTER TABLE public.profiles
  DROP COLUMN IF EXISTS phone_number,
  DROP COLUMN IF EXISTS phone_verification_code,
  DROP COLUMN IF EXISTS phone_verification_expires_at;

-- 2. Hide service_providers.phone_number from anonymous users via column grants
REVOKE SELECT ON public.service_providers FROM anon;
GRANT SELECT
  (id, user_id, provider_type, full_name, state, area, bio,
   is_approved, is_paid, payment_amount, payment_date,
   approved_at, approved_by, rejection_reason, created_at, updated_at)
  ON public.service_providers TO anon;

-- 3. Storage policies for 'imo' bucket (owner-scoped, user-id as first folder)
CREATE POLICY "imo: owner can read own files"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'imo' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "imo: owner can upload own files"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'imo' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "imo: owner can update own files"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'imo' AND auth.uid()::text = (storage.foldername(name))[1])
  WITH CHECK (bucket_id = 'imo' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "imo: owner can delete own files"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'imo' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 4. Add DELETE/UPDATE policies for business-documents and payment-receipts
CREATE POLICY "business-documents: owner can update own files"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'business-documents' AND auth.uid()::text = (storage.foldername(name))[1])
  WITH CHECK (bucket_id = 'business-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "business-documents: owner can delete own files"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'business-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "payment-receipts: owner can update own files"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'payment-receipts' AND auth.uid()::text = (storage.foldername(name))[1])
  WITH CHECK (bucket_id = 'payment-receipts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "payment-receipts: owner can delete own files"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'payment-receipts' AND auth.uid()::text = (storage.foldername(name))[1]);
