-- =============================================
-- DCC Enterprise Upgrade: Phase 3
-- Migration: 020_feature_flags_system
-- Description: Dynamic feature toggling with plan-based access control
-- =============================================

-- 1. Create Feature Flags Table
CREATE TABLE IF NOT EXISTS feature_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flag_key TEXT UNIQUE NOT NULL, -- e.g. 'KANBAN_VIEW'
    is_enabled BOOLEAN DEFAULT FALSE,
    allowed_plans TEXT[] DEFAULT '{free, standard, premium}', -- which plans can access this when is_enabled=true
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

-- 2. Policies
-- Everyone can view feature flags (to know what's available)
DROP POLICY IF EXISTS "Anyone can view feature flags" ON feature_flags;
CREATE POLICY "Anyone can view feature flags" ON feature_flags
    FOR SELECT USING (TRUE);

-- Only Super Admin can manage flags
DROP POLICY IF EXISTS "Admins can manage feature flags" ON feature_flags;
CREATE POLICY "Admins can manage feature flags" ON feature_flags
    FOR ALL USING (
        (auth.jwt() ->> 'email' = 'admin@bayrechnung.com')
    );

-- 3. Seed Initial Flags
INSERT INTO feature_flags (flag_key, is_enabled, allowed_plans, description)
VALUES 
    ('KANBAN_VIEW', false, '{premium}', 'Advanced Kanban board for task/invoice management'),
    ('ADVANCED_REPORTS', true, '{standard, premium}', 'Detailed financial analytics and export features'),
    ('BETA_DCC_CHARTS', true, '{premium}', 'Real-time performance charts in Developer Control Center'),
    ('ZERO_LOG_CLEANUP', false, '{premium}', 'Enable manual audit log purging')
ON CONFLICT (flag_key) DO NOTHING;

-- 4. Trigger for updated_at
DROP TRIGGER IF EXISTS update_feature_flags_updated_at ON feature_flags;
CREATE TRIGGER update_feature_flags_updated_at
  BEFORE UPDATE ON feature_flags
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
