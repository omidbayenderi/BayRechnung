-- =============================================
-- DCC Enterprise Upgrade: Phase 1
-- Migration: 013_admin_global_access
-- Description: Grant administrative global access to admin@bayrechnung.com
-- =============================================

-- 1. Helper Function to check if requester is Super Admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (auth.jwt() ->> 'email' = 'admin@bayrechnung.com');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Update Users Table Policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON users;
CREATE POLICY "Admins can view all profiles" ON users
  FOR SELECT USING (is_super_admin() OR auth.uid() = id);

-- 3. Update Subscriptions Table Policies
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON subscriptions;
CREATE POLICY "Admins can view all subscriptions" ON subscriptions
  FOR SELECT USING (is_super_admin() OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can update all subscriptions" ON subscriptions;
CREATE POLICY "Admins can update all subscriptions" ON subscriptions
  FOR UPDATE USING (is_super_admin() OR auth.uid() = user_id);

-- 4. Update Company Settings Policies
DROP POLICY IF EXISTS "Admins can view all company settings" ON company_settings;
CREATE POLICY "Admins can view all company settings" ON company_settings
  FOR SELECT USING (is_super_admin() OR auth.uid() = user_id);

-- 5. Logging the Migration
INSERT INTO audit_logs (action, entity_type, metadata)
VALUES ('MIGRATION_APPLIED', 'schema', '{"name": "013_admin_global_access", "level": "security_hardened"}');
