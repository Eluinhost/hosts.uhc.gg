CREATE TABLE alert_rules (
  id BIGSERIAL NOT NULL PRIMARY KEY,
  field TEXT NOT NULL,
  alertOn TEXT NOT NULL,
  exact BOOLEAN NOT NULL,
  createdBy TEXT NOT NULL,
  created TIMESTAMP NOT NULL
);

CREATE TABLE alerts (
  matchId BIGINT NOT NULL REFERENCES matches(id),
  triggeredRuleId BIGINT NOT NULL REFERENCES alert_rules(id) ON DELETE CASCADE,
  discord BOOLEAN NOT NULL DEFAULT false,
  PRIMARY KEY (matchId, triggeredRuleId)
);