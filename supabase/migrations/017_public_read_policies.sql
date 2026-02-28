-- Migration: Add Public Read Policies
-- Description: Allows non-authenticated users to view necessary data for public websites

-- 1. Website Configs
ALTER TABLE website_configs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view active website configs" ON website_configs;
CREATE POLICY "Public can view active website configs" ON website_configs
  FOR SELECT USING (is_published = true OR auth.uid() = user_id);

-- 2. Services (Appointment System)
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view services" ON services;
CREATE POLICY "Public can view services" ON services
  FOR SELECT USING (true); -- Publicly viewable for booking

-- 3. Staff (Appointment System)
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view staff" ON staff;
CREATE POLICY "Public can view staff" ON staff
  FOR SELECT USING (true); -- Publicly viewable for booking

-- 4. Products (Inventory)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view products" ON products;
CREATE POLICY "Public can view products" ON products
  FOR SELECT USING (true); -- Publicly viewable for shop

-- 5. Company Settings (Profiles)
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view company settings" ON company_settings;
CREATE POLICY "Public can view company settings" ON company_settings
  FOR SELECT USING (true); -- Publicly viewable for website info

-- 6. Appointments (Booking)
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can create appointments" ON appointments;
CREATE POLICY "Public can create appointments" ON appointments
  FOR INSERT WITH CHECK (true); -- Allow public visitors to book
