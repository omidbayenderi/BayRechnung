-- Migration: Add Separate Weekend Working Hours
-- Description: Adds columns to support different working hours for weekends

ALTER TABLE appointment_settings 
ADD COLUMN IF NOT EXISTS working_hours_weekend_start TEXT DEFAULT '10:00',
ADD COLUMN IF NOT EXISTS working_hours_weekend_end TEXT DEFAULT '16:00';

-- Set default values for existing rows
UPDATE appointment_settings 
SET working_hours_weekend_start = '10:00',
    working_hours_weekend_end = '16:00'
WHERE working_hours_weekend_start IS NULL;
