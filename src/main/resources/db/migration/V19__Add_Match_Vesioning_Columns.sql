ALTER TABLE matches ADD COLUMN originalEditId BIGINT REFERENCES matches(id) DEFAULT NULL;

CREATE INDEX ON matches(originalEditId);
