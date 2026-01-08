-- Allow users to insert their own 'business' role when they create a business account
CREATE POLICY "Users can insert their own business role"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id 
  AND role = 'business'
);

-- Insert business roles for existing business account owners
INSERT INTO public.user_roles (user_id, role)
SELECT user_id, 'business'::app_role
FROM public.business_accounts
ON CONFLICT (user_id, role) DO NOTHING;