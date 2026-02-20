-- Migration: SaaS Infrastructure
-- Description: Supports public portals, tokens, and usage tracking

CREATE TABLE IF NOT EXISTS public_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL, -- 'invoice', 'quote', 'appointment'
  entity_id UUID NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS usage_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  metric_name TEXT NOT NULL, -- 'invoices_created', 'storage_used', 'api_calls'
  value BIGINT DEFAULT 0,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_metrics ENABLE ROW LEVEL SECURITY;

-- Tokens can be read by anyone if they have the token (logic handled in app)
-- but for RLS we allow the owner to manage them
CREATE POLICY "Users can manage own portal tokens" ON public_tokens FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can see their own usage metrics" ON usage_metrics FOR SELECT USING (auth.uid() = user_id);

-- Enable Realtime for tokens (if needed for live status updates in portal)
ALTER PUBLICATION supabase_realtime ADD TABLE public_tokens;
