-- Migration: Messaging Enhancements
-- Description: Adds fields to support advanced messaging, segmentation, and external notifications (WhatsApp/SMS simulation)

-- 1. Add new columns to messages table
ALTER TABLE messages ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'internal' CHECK (category IN ('internal', 'customer', 'system'));
ALTER TABLE messages ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'message' CHECK (type IN ('message', 'notification', 'alert', 'warning', 'success', 'sms', 'whatsapp'));
ALTER TABLE messages ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
ALTER TABLE messages ADD COLUMN IF NOT EXISTS recipient_role TEXT; -- For role-based broadcasts (e.g., 'all_workers', 'all_admins')

-- 2. Update existing messages to have a default category if they don't have one
UPDATE messages SET category = 'internal' WHERE category IS NULL;
UPDATE messages SET type = 'message' WHERE type IS NULL;

-- 3. Ensure RLS is still valid
-- The current policy is: (auth.uid() = sender_id OR auth.uid() = receiver_id)
-- For broadcasts (where receiver_id is NULL), we might need a more permissive policy for authenticated users if we want them to see system broadcasts.

-- Add a policy for broadcasts (simplified: any authenticated user can see broadcast messages)
CREATE POLICY "Users can see broadcast messages" ON messages 
FOR SELECT USING (receiver_id IS NULL AND (category = 'system' OR auth.uid() IS NOT NULL));

-- Allow admins to see all messages for monitoring (optional but often needed for DCC)
-- Assuming we have an is_admin() function or can check metadata
-- For now, we stick to sender/receiver + broadcasts.
