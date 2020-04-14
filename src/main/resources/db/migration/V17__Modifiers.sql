CREATE TABLE modifiers (
  id SERIAL NOT NULL PRIMARY KEY,
  displayName TEXT NOT NULL UNIQUE
);

INSERT INTO modifiers (displayName) VALUES
    ('CutClean'),
    ('Fast Smelting'),
    ('Beta Zombies'),
    ('Hasty Boys'),
    ('Veinminer'),
    ('Timber');
