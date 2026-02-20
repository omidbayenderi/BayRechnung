-- =============================================
-- Fix Audit Logs Insert Policy
-- Migration: 024_fix_audit_logs_insert
-- Description: Allow users to insert audit logs (fixing RLS policy error)
-- =============================================

-- Ensure the INSERT policy allows users to insert their own logs
DROP POLICY IF EXISTS "Users can insert own audit logs" ON audit_logs;

CREATE POLICY "Users can insert own audit logs" ON audit_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Also add an ENABLE ROW LEVEL SECURITY just in case
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
