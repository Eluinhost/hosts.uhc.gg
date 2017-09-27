ALTER TABLE matches ADD COLUMN handledDiscord BOOLEAN NOT NULL DEFAULT FALSE;

-- make sure to set all existing to be 'posted' to avoid spam first time
UPDATE matches SET handledDiscord = true
