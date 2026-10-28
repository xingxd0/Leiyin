-- Run once against the existing messages table. Existing rows are preserved.
ALTER TABLE messages ADD COLUMN owner_hash TEXT;
CREATE INDEX IF NOT EXISTS idx_messages_owner_status_id
ON messages(owner_hash, status, id DESC);
