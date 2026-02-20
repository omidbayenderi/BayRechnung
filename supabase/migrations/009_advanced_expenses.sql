-- Migration: Advanced Expenses
-- Description: Adds support for receipt images in the expenses table

ALTER TABLE expenses ADD COLUMN IF NOT EXISTS receipt_image TEXT;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'EUR';

-- Note: We are using TEXT for base64 storage in this MVP phase, 
-- but Supabase Storage is recommended for production.
