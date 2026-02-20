-- Migration: Messaging System
-- Description: Table for inter-company messages with real-time support

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Null could mean "Broadcast" or "System"
  channel_id TEXT, -- To support grouped chats
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see messages they sent or received" ON messages 
FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can insert their own messages" ON messages 
FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
