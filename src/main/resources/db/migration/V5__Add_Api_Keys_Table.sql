CREATE TABLE user_api_keys (
  username TEXT NOT NULL PRIMARY KEY,
  apiKey CHAR (96) NOT NULL
);
