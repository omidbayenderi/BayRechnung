-- Migration: Projects and Kanban
-- Description: Table for project tracking with lifecycle states

CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  client_name TEXT,
  status TEXT DEFAULT 'lead' CHECK (status IN ('lead', 'quoted', 'in_progress', 'completed', 'billed')),
  budget DECIMAL(10,2) DEFAULT 0,
  due_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own projects" ON projects FOR ALL USING (auth.uid() = user_id);

-- Storage bucket for receipts
-- Note: Bucket creation usually via dashboard or specific API if available, 
-- but we often assume it's set up or we can refer to it.
-- For standard Supabase storage, we'd handle it via the JS client.
