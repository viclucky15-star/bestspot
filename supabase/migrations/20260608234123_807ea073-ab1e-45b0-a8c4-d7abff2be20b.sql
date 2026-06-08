
-- 1. platform_settings: restrict public read to authenticated users
DROP POLICY IF EXISTS "Anyone can view platform settings" ON public.platform_settings;
CREATE POLICY "Authenticated users can view platform settings"
ON public.platform_settings
FOR SELECT
TO authenticated
USING (true);
REVOKE SELECT ON public.platform_settings FROM anon;

-- 2. user_roles: enforce uniqueness to prevent duplicate self-inserts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'user_roles_user_id_role_key'
      AND conrelid = 'public.user_roles'::regclass
  ) THEN
    ALTER TABLE public.user_roles
      ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);
  END IF;
END$$;

-- 3. Revoke EXECUTE on trigger-only SECURITY DEFINER functions from anon/authenticated
REVOKE EXECUTE ON FUNCTION public.update_location_rating() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_business_wallet() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, PUBLIC;

-- has_role is intentionally executable: used in RLS policies via SECURITY DEFINER pattern.
