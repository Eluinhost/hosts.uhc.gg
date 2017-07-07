CREATE TABLE matches (
  id BIGSERIAL NOT NULL PRIMARY KEY,
  author TEXT NOT NULL,
  opens TIMESTAMP NOT NULL,
  address TEXT,
  ip TEXT NOT NULL,
  scenarios TEXT[] NOT NULL,
  tags TEXT[] NOT NULL,
  teams TEXT NOT NULL,
  size SMALLINT,
  customStyle TEXT,
  count SMALLINT NOT NULL,
  content TEXT NOT NULL,
  region TEXT NOT NULL,
  removed BOOLEAN NOT NULL,
  removedBy TEXT,
  created TIMESTAMP NOT NULL
);

CREATE INDEX ON matches (opens);

CREATE TABLE permissions (
  username TEXT NOT NULL,
  type TEXT NOT NULL,
  PRIMARY KEY (username, type)
);