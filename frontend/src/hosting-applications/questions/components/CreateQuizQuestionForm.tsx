import { Button, Select, Group, Stack, Radio, RadioGroup, TextInput } from '@mantine/core';
import { PlusIcon, TrashIcon } from '@phosphor-icons/react';
import React, { useCallback, useMemo, useState } from 'react';

import { QuizQuestionsData } from '@/hosting-applications/questions/api';
import { type CreateQuizQuestionData, QuestionType } from '@/models/QuizQuestion';

type ChoiceDraft = {
  readonly text: string;
};

interface ChoiceProps {
  index: number;
  text: string;
  isCorrect: boolean;
  onSelect: (index: number) => void;
  onChange: (index: number, newString: string) => void;
  isDisabled: boolean;
  canRemove: boolean;
  onRemove: (index: number) => void;
}

const Choice: React.FC<ChoiceProps> = ({
  index,
  text,
  isCorrect,
  isDisabled,
  canRemove,
  onSelect,
  onChange,
  onRemove,
}: ChoiceProps) => {
  const handleChange = useCallback(() => {
    onSelect(index);
  }, [onSelect, index]);

  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(index, e.target.value);
    },
    [onChange, index],
  );

  const handleRemove = useCallback(() => {
    onRemove(index);
  }, [onRemove, index]);

  return (
    <Group justify="center">
      <Radio value={index} checked={isCorrect} onChange={handleChange} style={{ marginBottom: 0, marginRight: 10 }} />
      <TextInput
        placeholder={`Choice ${index + 1}`}
        value={text}
        onChange={handleTextChange}
        disabled={isDisabled}
        style={{ flex: 1 }}
      />
      {canRemove && (
        <Button
          leftSection={<TrashIcon />}
          color="red"
          onClick={handleRemove}
          disabled={isDisabled}
          style={{ marginLeft: 5 }}
        />
      )}
    </Group>
  );
};

const emptyChoices: ChoiceDraft[] = [{ text: '' }, { text: '' }];

export const CreateQuizQuestionForm = () => {
  const { mutateAsync: createQuestion, isPending } = QuizQuestionsData.mutations.useCreateQuizQuestion();

  const [prompt, setPrompt] = useState('');
  const [questionType, setQuestionType] = useState<QuestionType>(QuestionType.MULTIPLE_CHOICE);
  const [choices, setChoices] = useState(emptyChoices);
  const [correctIndex, setCorrectIndex] = useState(0);

  const reset = useCallback(() => {
    setPrompt('');
    setQuestionType(QuestionType.MULTIPLE_CHOICE);
    setChoices(emptyChoices);
    setCorrectIndex(0);
  }, []);

  const handlePromptChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPrompt(e.target.value);
  }, []);

  const handleChoiceTextChange = useCallback((index: number, text: string) => {
    setChoices(prev => prev.map((choice, i) => (i === index ? { text } : choice)));
  }, []);

  const handleCorrectChoiceChange = useCallback((index: number) => {
    setCorrectIndex(index);
  }, []);

  const handleRemoveChoice = useCallback((index: number) => {
    setChoices(prev => prev.filter((_, i) => i !== index));
    setCorrectIndex(prev => (prev >= index && prev > 0 ? prev - 1 : prev));
  }, []);

  const handleAddChoice = useCallback(() => {
    setChoices(prev => [...prev, { text: '' }]);
  }, []);

  const handleSubmit = useCallback(async () => {
    const data: CreateQuizQuestionData =
      questionType === QuestionType.MULTIPLE_CHOICE
        ? {
            prompt: prompt.trim(),
            questionType: QuestionType.MULTIPLE_CHOICE,
            choices: choices.map((choice, index) => ({
              text: choice.text.trim(),
              correct: index === correctIndex,
            })),
          }
        : {
            prompt: prompt.trim(),
            questionType: QuestionType.TEXT,
            choices: [],
          };

    await createQuestion(data);
    reset();
  }, [choices, correctIndex, createQuestion, prompt, questionType, reset]);

  const isValid = useMemo(() => {
    if (!prompt.trim()) {
      return false;
    }

    if (questionType === QuestionType.MULTIPLE_CHOICE) {
      const filled = choices.filter(c => c.text.trim().length > 0);
      return filled.length >= 2 && choices.every(c => c.text.trim().length > 0);
    }

    return true;
  }, [choices, prompt, questionType]);

  return (
    <Stack>
      <TextInput
        size="lg"
        placeholder="Question prompt"
        value={prompt}
        onChange={handlePromptChange}
        disabled={isPending}
      />

      <div style={{ marginTop: 10 }}>
        <Select
          value={questionType}
          onChange={value => {
            if (value) {
              setQuestionType(value);
            }
          }}
          disabled={isPending}
          data={[
            { value: QuestionType.MULTIPLE_CHOICE, label: 'Multiple choice' },
            { value: QuestionType.TEXT, label: 'Text answer' },
          ]}
        />
      </div>

      {questionType === QuestionType.MULTIPLE_CHOICE && (
        <RadioGroup label="Choices (select the correct answer)" onChange={() => undefined} value={correctIndex}>
          {choices.map((choice, index) => (
            <Choice
              key={index}
              index={index}
              text={choice.text}
              isCorrect={index === correctIndex}
              onSelect={handleCorrectChoiceChange}
              onChange={handleChoiceTextChange}
              isDisabled={isPending}
              canRemove={choices.length > 2}
              onRemove={handleRemoveChoice}
            />
          ))}
        </RadioGroup>
      )}

      {questionType === QuestionType.MULTIPLE_CHOICE && (
        <Button leftSection={<PlusIcon />} color="green" onClick={handleAddChoice} disabled={isPending}>
          Add choice
        </Button>
      )}

      <div style={{ marginTop: 10 }}>
        <Button
          color="green"
          leftSection={<PlusIcon />}
          disabled={isPending || !isValid}
          onClick={() => {
            void handleSubmit();
          }}
        >
          Create question
        </Button>
      </div>
    </Stack>
  );
};
