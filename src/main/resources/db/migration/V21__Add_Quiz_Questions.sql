ALTER TABLE host_applications ALTER COLUMN content DROP NOT NULL;

CREATE TABLE quiz_questions (
  id BIGSERIAL NOT NULL PRIMARY KEY,
  prompt TEXT NOT NULL,
  type TEXT NOT NULL,
  createdBy TEXT NOT NULL,
  created TIMESTAMP NOT NULL
);

CREATE TABLE quiz_question_choices (
  id BIGSERIAL NOT NULL PRIMARY KEY,
  questionId BIGINT NOT NULL REFERENCES quiz_questions (id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  correct BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX ON quiz_question_choices (questionId);

CREATE TABLE host_application_answers (
  id BIGSERIAL NOT NULL PRIMARY KEY,
  applicationId BIGINT NOT NULL REFERENCES host_applications (id) ON DELETE CASCADE,
  questionPrompt TEXT NOT NULL,
  questionType TEXT NOT NULL,
  choiceText TEXT,
  choiceCorrect BOOLEAN,
  textAnswer TEXT
);

CREATE INDEX ON host_application_answers (applicationId);
