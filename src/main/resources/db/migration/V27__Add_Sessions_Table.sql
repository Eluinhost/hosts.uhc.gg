CREATE TABLE sessions (
  id TEXT NOT NULL PRIMARY KEY,
  username TEXT NOT NULL,
  created TIMESTAMPTZ NOT NULL,
  lastSeen TIMESTAMPTZ NOT NULL,
  lastRotated TIMESTAMPTZ NOT NULL,
  absoluteExpiry TIMESTAMPTZ NOT NULL,
  ip INET,
  userAgent TEXT
);

CREATE INDEX ON sessions (lastSeen);
CREATE INDEX ON sessions (username);
