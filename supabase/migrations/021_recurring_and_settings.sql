-- Migration: Add Recurring Templates and Module Settings
-- Description: Completes the database schema for full production readiness

-- 1. Recurring Templates Table
CREATE TABLE IF NOT EXISTS recurring_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    template_name TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    items JSONB NOT NULL DEFAULT '[]',
    frequency TEXT NOT NULL, -- 'weekly', 'monthly', 'quarterly', 'yearly'
    amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    currency TEXT DEFAULT 'EUR',
    next_generation_date DATE,
    last_generated_at TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'active', -- 'active', 'paused', 'completed'
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Stock Settings Table
CREATE TABLE IF NOT EXISTS stock_settings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    tax_rate DECIMAL(5,2) DEFAULT 19,
    currency TEXT DEFAULT '€',
    store_name TEXT,
    store_address TEXT,
    store_phone TEXT,
    default_low_stock INTEGER DEFAULT 5,
    categories TEXT[] DEFAULT ARRAY['Fluids', 'Parts', 'Filters', 'Accessories', 'Services'],
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Appointment Settings Table
CREATE TABLE IF NOT EXISTS appointment_settings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    working_hours_start TEXT DEFAULT '09:00',
    working_hours_end TEXT DEFAULT '18:00',
    working_days TEXT[] DEFAULT ARRAY['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    slot_duration INTEGER DEFAULT 30,
    buffer_time INTEGER DEFAULT 5,
    holidays DATE[] DEFAULT ARRAY[]::DATE[],
    breaks JSONB DEFAULT '{"start": "13:00", "end": "14:00", "enabled": false}',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Enablement
ALTER TABLE recurring_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage own recurring templates" ON recurring_templates FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own stock settings" ON stock_settings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own appointment settings" ON appointment_settings FOR ALL USING (auth.uid() = user_id);

-- Realtime Enablement
ALTER PUBLICATION supabase_realtime ADD TABLE recurring_templates;
ALTER PUBLICATION supabase_realtime ADD TABLE stock_settings;
ALTER PUBLICATION supabase_realtime ADD TABLE appointment_settings;
