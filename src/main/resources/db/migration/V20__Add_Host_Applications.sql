CREATE TABLE host_applications (
  id BIGSERIAL NOT NULL PRIMARY KEY,
  username TEXT NOT NULL,
  content TEXT NOT NULL,
  created TIMESTAMP NOT NULL,
  status TEXT NOT NULL,
  reviewedBy TEXT,
  reviewedAt TIMESTAMP
);

CREATE INDEX ON host_applications (created);
CREATE INDEX ON host_applications (status);