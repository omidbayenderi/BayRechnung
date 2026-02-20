-- Migration: Billing History
-- Description: Stores platform subscription payments for users

CREATE TABLE IF NOT EXISTS billing_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'EUR',
    status TEXT NOT NULL DEFAULT 'paid', -- 'paid', 'pending', 'failed'
    billing_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    invoice_url TEXT, -- Link to the PDF invoice hosted in storage
    description TEXT, -- e.g. 'Premium Plan - Monthly'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Enablement
ALTER TABLE billing_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view own billing history" ON billing_history;
CREATE POLICY "Users can view own billing history" ON billing_history
    FOR SELECT USING (auth.uid() = user_id);

-- Add to Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE billing_history;
