-- Migration: Phase 2 Core Business Logic
-- Description: Adds tables for appointments, availability, and stock tracking

-- 1. Appointment System
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  service_id TEXT, -- References service identifier from WebsiteConfig or dedicated table
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS service_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(user_id, day_of_week)
);

-- 2. Advanced Stock Tracking
CREATE TABLE IF NOT EXISTS stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quantity_change INTEGER NOT NULL, -- negative for sales/usage, positive for restock
  type TEXT CHECK (type IN ('sale', 'restock', 'adjustment', 'usage')),
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add supplier info to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS supplier_info JSONB DEFAULT '{}';

-- 3. Worker Panel Support
CREATE TABLE IF NOT EXISTS daily_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- the worker
  site_id TEXT, -- logic-based site identifier
  content TEXT,
  photos_urls TEXT[], -- Array of photo links
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'reviewed', 'approved')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own appointments" ON appointments FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own availability" ON service_availability FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own stock movements" ON stock_movements FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own daily reports" ON daily_reports FOR ALL USING (auth.uid() = user_id);

-- Sites management (basic)
CREATE TABLE IF NOT EXISTS sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- owner/admin
  name TEXT NOT NULL,
  address TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'on_hold')),
  progress INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own sites" ON sites FOR ALL USING (auth.uid() = user_id);
