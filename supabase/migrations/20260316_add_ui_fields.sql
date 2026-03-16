-- 20260316_add_ui_fields.sql
-- Description: Adds UI-related fields (color, icon, image_url) to services and products tables.

BEGIN;

-- Update Services table
ALTER TABLE services 
ADD COLUMN IF NOT EXISTS color VARCHAR(7) DEFAULT '#3B82F6',
ADD COLUMN IF NOT EXISTS icon VARCHAR(50),
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Update Products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS image_url TEXT;

COMMIT;
