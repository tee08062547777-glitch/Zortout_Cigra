ALTER TABLE sync_settings
ADD COLUMN IF NOT EXISTS last_sync_by_user_id UUID,
ADD COLUMN IF NOT EXISTS last_sync_by_email TEXT;

ALTER TABLE sync_settings
DROP COLUMN IF EXISTS last_sync_at;
