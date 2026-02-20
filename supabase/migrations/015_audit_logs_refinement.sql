-- =============================================
-- DCC Enterprise Upgrade: Phase 2
-- Migration: 015_audit_logs_refinement
-- Description: Enhance audit_logs for better DCC observability
-- =============================================

-- 1. Ensure audit_logs table exists with base columns
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add enterprise columns (metadata, severity, source)
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS severity TEXT DEFAULT 'info'; -- info, warning, critical
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'system'; -- client, server, kernel

-- 3. Update RLS for audit_logs
-- Ensure Super Admin (admin@bayrechnung.com) can see ALL logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can view ALL audit logs" ON audit_logs;
CREATE POLICY "Admins can view ALL audit logs" ON audit_logs
    FOR SELECT USING (
        (auth.jwt() ->> 'email' = 'admin@bayrechnung.com') OR 
        (auth.uid() = user_id)
    );

-- 4. Index for performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_severity ON audit_logs (severity);
