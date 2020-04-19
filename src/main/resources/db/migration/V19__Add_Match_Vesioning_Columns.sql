ALTER TABLE matches ADD COLUMN originalEditId BIGINT REFERENCES matches(id) DEFAULT NULL;
ALTER TABLE matches ADD COLUMN previousEditId BIGINT REFERENCES matches(id) DEFAULT NULL;
ALTER TABLE matches ADD COLUMN nextEditId BIGINT REFERENCES matches(id) DEFAULT NULL;

CREATE INDEX ON matches(originalEditId);
CREATE INDEX ON matches(previousEditId);
CREATE INDEX ON matches(nextEditId);
