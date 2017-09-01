UPDATE permissions SET type = 'hosting advisor' WHERE type = 'moderator';
UPDATE permission_moderation_log SET permission = 'hosting advisor' WHERE permission = 'moderator';