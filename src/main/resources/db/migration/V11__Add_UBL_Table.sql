CREATE TABLE ubl (
  id BIGSERIAL NOT NULL PRIMARY KEY,
  ign TEXT NOT NULL,
  uuid UUID NOT NULL,
  reason TEXT NOT NULL,
  created DATE NOT NULL,
  expires DATE NOT NULL,
  link TEXT NOT NULL,
  createdBy TEXT NOT NULL
);

CREATE INDEX ON ubl (expires);
CREATE INDEX ON ubl (created);
CREATE INDEX ON ubl (uuid);
CREATE INDEX ON ubl (ign);