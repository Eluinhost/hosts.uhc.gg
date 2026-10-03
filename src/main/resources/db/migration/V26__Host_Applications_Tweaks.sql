ALTER TABLE host_application_answers
    DROP COLUMN IF EXISTS choiceText;
ALTER TABLE host_application_answers
    DROP COLUMN IF EXISTS textAnswer;
ALTER TABLE host_application_answers
    ADD COLUMN IF NOT EXISTS answer TEXT NOT NULL DEFAULT '';
ALTER TABLE host_application_answers
    ALTER COLUMN answer DROP DEFAULT;
