-- =============================================
-- DCC Enterprise Upgrade: Phase 2 Seed
-- Migration: 016_seed_test_user
-- Description: Provide a real user for verification
-- =============================================

-- 1. Seed audit logs for development/verification
-- We find the admin user dynamically or use a guest ID if none found (fallback)
DO $$
DECLARE
    admin_id UUID;
BEGIN
    SELECT id INTO admin_id FROM users WHERE email = 'admin@bayrechnung.com' LIMIT 1;
    
    IF admin_id IS NOT NULL THEN
        -- Insert a few "fake" persistent logs to verify the UI
        INSERT INTO audit_logs (user_id, action, entity_type, entity_id, metadata, severity, source)
        VALUES 
            (admin_id, 'SYSTEM_BOOT', 'kernel', admin_id, '{"version": "4.2.0", "engine": "BayGuard"}'::jsonb, 'info', 'kernel'),
            (admin_id, 'SECURITY_UPGRADE', 'schema', admin_id, '{"migration": "015", "status": "completed"}'::jsonb, 'info', 'system'),
            (admin_id, 'MTD_ACTIVATED', 'shield', admin_id, '{"policy": "zero-trust", "active": true}'::jsonb, 'warning', 'kernel');
            
        RAISE NOTICE 'Seeded 3 protocols for admin: %', admin_id;
    ELSE
        RAISE WARNING 'Admin user admin@bayrechnung.com not found. Skipping log seeding.';
    END IF;
END $$;
