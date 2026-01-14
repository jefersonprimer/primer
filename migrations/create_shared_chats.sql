-- Migration: Create shared_chats table for public chat sharing
-- This table stores snapshots of chats that users choose to share publicly

CREATE TABLE IF NOT EXISTS shared_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_chat_id UUID,  -- Reference to original chat (null if deleted)
  title TEXT,
  messages JSONB NOT NULL,  -- Snapshot: [{role, content, created_at}]
  shared_by_user_id UUID,  -- Who shared it (no FK, for analytics only)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ  -- Optional expiration date
);

-- Index for looking up shares by original chat
CREATE INDEX IF NOT EXISTS idx_shared_chats_original ON shared_chats(original_chat_id);

-- Index for cleanup of expired shares
CREATE INDEX IF NOT EXISTS idx_shared_chats_expires ON shared_chats(expires_at) WHERE expires_at IS NOT NULL;

COMMENT ON TABLE shared_chats IS 'Stores publicly shared chat snapshots';
COMMENT ON COLUMN shared_chats.messages IS 'JSONB array of {role, content, created_at} objects';
