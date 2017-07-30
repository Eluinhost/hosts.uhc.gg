CREATE TABLE authentication_log (
  username TEXT NOT NULL,
  ip INET NOT NULL,
  lastToken TIMESTAMP NOT NULL,
  PRIMARY KEY (username, ip)
);
