-- Migration: Fix Website Configs Table
-- Description: Ensures website_configs has the expected columns for the public website and editor

ALTER TABLE website_configs ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
ALTER TABLE website_configs ADD COLUMN IF NOT EXISTS theme JSONB DEFAULT '{}'::jsonb;
ALTER TABLE website_configs ADD COLUMN IF NOT EXISTS seo JSONB DEFAULT '{}'::jsonb;
ALTER TABLE website_configs ADD COLUMN IF NOT EXISTS menu_items JSONB DEFAULT '[]'::jsonb;

-- Ensure RLS is enabled and public read is possible
ALTER TABLE website_configs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view published website configs" ON website_configs;
CREATE POLICY "Public can view published website configs" ON website_configs
    FOR SELECT USING (is_published = true OR auth.uid() = user_id);

-- Update existing rows: set slug from domain if slug is null
UPDATE website_configs SET slug = split_part(domain, '.', 1) WHERE slug IS NULL AND domain IS NOT NULL;
