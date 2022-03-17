ALTER TABLE matches ADD COLUMN originalEditId BIGINT REFERENCES matches(id) DEFAULT NULL;
ALTER TABLE matches ADD COLUMN latestEditId BIGINT REFERENCES matches(id) DEFAULT NULL;

CREATE INDEX ON matches(originalEditId);
CREATE INDEX ON matches(latestEditId);
