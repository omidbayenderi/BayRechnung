-- Migration: Add Tracking Columns to Appointments
-- Description: Adds reminded and processed_by_ai columns to track AI agent actions

ALTER TABLE appointments ADD COLUMN IF NOT EXISTS reminded BOOLEAN DEFAULT FALSE;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS processed_by_ai BOOLEAN DEFAULT FALSE;

-- Track sales reported to accounting
ALTER TABLE sales ADD COLUMN IF NOT EXISTS reported_to_accounting BOOLEAN DEFAULT FALSE;
