-- Add role column to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS role TEXT CHECK (role IN ('admin', 'finance', 'site_lead', 'worker')) DEFAULT 'admin';

-- Update RLS policies to allow role checks if needed
-- (Current policies already allow users to view their own profile, which includes the role)
