CREATE TABLE authentication_log (
  id BIGSERIAL NOT NULL,
  username TEXT NOT NULL,
  ip INET NOT NULL,
  lastToken TIMESTAMP NOT NULL
);

CREATE UNIQUE INDEX ON authentication_log (username, ip);