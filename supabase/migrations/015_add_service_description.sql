-- Add description column to services table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='services' AND column_name='description') THEN
        ALTER TABLE services ADD COLUMN description TEXT;
    END IF;
END $$;

-- Ensure RLS is correct for services and staff
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own services" ON services;
CREATE POLICY "Users can manage own services" ON services FOR ALL USING (auth.uid() = user_id);

ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own staff" ON staff;
CREATE POLICY "Users can manage own staff" ON staff FOR ALL USING (auth.uid() = user_id);
