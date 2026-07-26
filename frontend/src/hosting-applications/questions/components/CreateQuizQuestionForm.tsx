import * as React from 'react';
import { Button, Classes, HTMLSelect, InputGroup, Intent, Radio, RadioGroup } from '@blueprintjs/core';
import { CreateQuizQuestionData, QuestionType } from '../../../models/QuizQuestion';
import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useMemo, useState } from 'react';
import { getCreateQuizQuestionApiState } from '../selectors';
import { QuizQuestions } from '../actions';

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

const Choice = React.memo(function Choice({
  index,
  text,
  isCorrect,
  isDisabled,
  canRemove,
  onSelect,
  onChange,
  onRemove,
}: ChoiceProps) {
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
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
      <Radio value={index} checked={isCorrect} onChange={handleChange} style={{ marginBottom: 0, marginRight: 10 }} />
      <InputGroup
        placeholder={`Choice ${index + 1}`}
        value={text}
        onChange={handleTextChange}
        disabled={isDisabled}
        style={{ flex: 1 }}
      />
      {canRemove && (
        <Button icon="trash" minimal onClick={handleRemove} disabled={isDisabled} style={{ marginLeft: 5 }} />
      )}
    </div>
  );
});

const emptyChoices: ChoiceDraft[] = [{ text: '' }, { text: '' }];

export const CreateQuizQuestionForm = React.memo(function CreateQuizQuestionForm() {
  const { isFetching } = useSelector(getCreateQuizQuestionApiState);
  const dispatch = useDispatch();

  const [prompt, setPrompt] = useState('');
  const [questionType, setQuestionType] = useState<QuestionType>('multiple choice');
  const [choices, setChoices] = useState(emptyChoices);
  const [correctIndex, setCorrectIndex] = useState(0);

  const reset = useCallback(() => {
    setPrompt('');
    setQuestionType('multiple choice');
    setChoices(emptyChoices);
    setCorrectIndex(0);
  }, []);

  const handlePromptChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setPrompt(e.target.value), []);

  const handleTypeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => setQuestionType(e.target.value as QuestionType),
    [],
  );

  const handleChoiceTextChange = useCallback(
    (index: number, text: string) => setChoices(prev => prev.map((choice, i) => (i === index ? { text } : choice))),
    [],
  );

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

  const handleSubmit = useCallback(() => {
    const data: CreateQuizQuestionData =
      questionType === 'multiple choice'
        ? {
            prompt: prompt.trim(),
            questionType: 'multiple choice',
            choices: choices.map((choice, index) => ({
              text: choice.text.trim(),
              correct: index === correctIndex,
            })),
          }
        : {
            prompt: prompt.trim(),
            questionType: 'text',
            choices: [],
          };

    dispatch(
      QuizQuestions.create.start({
        data,
        onSuccess: reset,
      }),
    );
  }, [choices, correctIndex, dispatch, prompt, questionType, reset]);

  const isValid = useMemo(() => {
    if (!prompt.trim()) {
      return false;
    }

    if (questionType === 'multiple choice') {
      const filled = choices.filter(c => c.text.trim().length > 0);
      return filled.length >= 2 && choices.every(c => c.text.trim().length > 0);
    }

    return true;
  }, [choices, prompt, questionType]);

  return (
    <div>
      <InputGroup
        className={Classes.LARGE}
        placeholder="Question prompt"
        value={prompt}
        onChange={handlePromptChange}
        disabled={isFetching}
      />

      <div style={{ marginTop: 10 }}>
        <HTMLSelect value={questionType} onChange={handleTypeChange} disabled={isFetching}>
          <option value="multiple choice">Multiple choice</option>
          <option value="text">Text answer</option>
        </HTMLSelect>
      </div>

      {questionType === 'multiple choice' && (
        <RadioGroup label="Choices (select the correct answer)" onChange={() => undefined} selectedValue={correctIndex}>
          {choices.map((choice, index) => (
            <Choice
              index={index}
              text={choice.text}
              isCorrect={index === correctIndex}
              onSelect={handleCorrectChoiceChange}
              onChange={handleChoiceTextChange}
              isDisabled={isFetching}
              canRemove={choices.length > 2}
              onRemove={handleRemoveChoice}
            />
          ))}
        </RadioGroup>
      )}

      {questionType === 'multiple choice' && (
        <Button icon="add" minimal onClick={handleAddChoice} disabled={isFetching}>
          Add choice
        </Button>
      )}

      <div style={{ marginTop: 10 }}>
        <Button intent={Intent.PRIMARY} icon="add" disabled={isFetching || !isValid} onClick={handleSubmit}>
          Create question
        </Button>
      </div>
    </div>
  );
});
