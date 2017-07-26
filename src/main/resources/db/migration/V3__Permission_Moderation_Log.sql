CREATE TABLE permission_moderation_log (
  id SERIAL NOT NULL,
  modifier TEXT NOT NULL,
  username TEXT NOT NULL,
  at TIMESTAMP NOT NULL,
  permission TEXT NOT NULL,
  added BOOLEAN NOT NULL
);

CREATE INDEX ON permission_moderation_log(at);
CREATE INDEX ON permission_moderation_log(username);
CREATE INDEX ON permission_moderation_log(modifier);