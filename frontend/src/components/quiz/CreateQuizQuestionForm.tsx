import * as React from 'react';
import { Button, Classes, HTMLSelect, InputGroup, Intent, Radio, RadioGroup } from '@blueprintjs/core';
import { CreateQuizQuestionData, QuestionType } from '../../models/QuizQuestion';

type Props = {
  readonly onSubmit: (question: CreateQuizQuestionData) => Promise<boolean>;
};

type ChoiceDraft = {
  readonly text: string;
};

type State = {
  readonly prompt: string;
  readonly questionType: QuestionType;
  readonly choices: ChoiceDraft[];
  readonly correctIndex: number;
  readonly submitting: boolean;
};

const emptyChoices: ChoiceDraft[] = [{ text: '' }, { text: '' }];

export class CreateQuizQuestionForm extends React.PureComponent<Props, State> {
  state: State = {
    prompt: '',
    questionType: 'multiple choice',
    choices: emptyChoices,
    correctIndex: 0,
    submitting: false,
  };

  private reset = () =>
    this.setState({
      prompt: '',
      questionType: 'multiple choice',
      choices: emptyChoices,
      correctIndex: 0,
      submitting: false,
    });

  private onPromptChange = (e: React.ChangeEvent<HTMLInputElement>) => this.setState({ prompt: e.target.value });

  private onTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) =>
    this.setState({ questionType: e.target.value as QuestionType });

  private onChoiceTextChange = (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    this.setState(prev => ({
      choices: prev.choices.map((choice, i) => (i === index ? { text } : choice)),
    }));
  };

  private onCorrectChange = (index: number) => () => this.setState({ correctIndex: index });

  private addChoice = () => this.setState(prev => ({ choices: [...prev.choices, { text: '' }] }));

  private removeChoice = (index: number) => () =>
    this.setState(prev => ({
      choices: prev.choices.filter((_, i) => i !== index),
      correctIndex: prev.correctIndex >= index && prev.correctIndex > 0 ? prev.correctIndex - 1 : prev.correctIndex,
    }));

  private isValid = (): boolean => {
    if (!this.state.prompt.trim()) return false;

    if (this.state.questionType === 'multiple choice') {
      const filled = this.state.choices.filter(c => c.text.trim().length > 0);
      return filled.length >= 2 && this.state.choices.every(c => c.text.trim().length > 0);
    }

    return true;
  };

  private submit = () => {
    const data: CreateQuizQuestionData =
      this.state.questionType === 'multiple choice'
        ? {
            prompt: this.state.prompt.trim(),
            questionType: 'multiple choice',
            choices: this.state.choices.map((choice, index) => ({
              text: choice.text.trim(),
              correct: index === this.state.correctIndex,
            })),
          }
        : {
            prompt: this.state.prompt.trim(),
            questionType: 'text',
            choices: [],
          };

    this.setState({ submitting: true });
    this.props.onSubmit(data).then(reset => {
      if (reset) this.reset();
      else this.setState({ submitting: false });
    });
  };

  render() {
    const { prompt, questionType, choices, correctIndex, submitting } = this.state;

    return (
      <div>
        <InputGroup
          className={Classes.LARGE}
          placeholder="Question prompt"
          value={prompt}
          onChange={this.onPromptChange}
          disabled={submitting}
        />

        <div style={{ marginTop: 10 }}>
          <HTMLSelect value={questionType} onChange={this.onTypeChange} disabled={submitting}>
            <option value="multiple choice">Multiple choice</option>
            <option value="text">Text answer</option>
          </HTMLSelect>
        </div>

        {questionType === 'multiple choice' && (
          <RadioGroup label="Choices (select the correct answer)" onChange={() => undefined} selectedValue={correctIndex}>
            {choices.map((choice, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                <Radio value={index} checked={index === correctIndex} onChange={this.onCorrectChange(index)} style={{ marginBottom: 0, marginRight: 10 }} />
                <InputGroup
                  placeholder={`Choice ${index + 1}`}
                  value={choice.text}
                  onChange={this.onChoiceTextChange(index)}
                  disabled={submitting}
                  style={{ flex: 1 }}
                />
                {choices.length > 2 && (
                  <Button icon="trash" minimal onClick={this.removeChoice(index)} disabled={submitting} style={{ marginLeft: 5 }} />
                )}
              </div>
            ))}
          </RadioGroup>
        )}

        {questionType === 'multiple choice' && (
          <Button icon="add" minimal onClick={this.addChoice} disabled={submitting}>
            Add choice
          </Button>
        )}

        <div style={{ marginTop: 10 }}>
          <Button intent={Intent.PRIMARY} icon="add" disabled={submitting || !this.isValid()} onClick={this.submit}>
            Create question
          </Button>
        </div>
      </div>
    );
  }
}
