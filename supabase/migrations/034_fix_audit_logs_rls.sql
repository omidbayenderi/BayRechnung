-- Allow authenticated users to insert their own logs
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'audit_logs' AND policyname = 'Users can insert their own logs'
    ) THEN
        ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Users can insert their own logs" ON audit_logs 
            FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'audit_logs' AND policyname = 'Users can view their own logs'
    ) THEN
        CREATE POLICY "Users can view their own logs" ON audit_logs 
            FOR SELECT USING (auth.uid() = user_id);
    END IF;
END $$;
