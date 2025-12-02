-- Add event_id column to chats table
ALTER TABLE chats ADD COLUMN event_id UUID REFERENCES events(id);
CREATE INDEX idx_chats_event_id ON chats(event_id);
