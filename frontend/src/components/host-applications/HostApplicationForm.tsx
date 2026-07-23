import * as React from 'react';
import { Button, Classes, H5, Intent, Radio, RadioGroup, TextArea } from '@blueprintjs/core';
import { QuizQuestion } from '../../models/QuizQuestion';
import { SubmitAnswerData } from '../../models/HostApplication';

type Props = {
  readonly questions: QuizQuestion[];
  readonly submitting: boolean;
  readonly onSubmit: (answers: SubmitAnswerData[]) => void;
};

type AnswerState = {
  readonly choiceId?: number;
  readonly textAnswer?: string;
};

type State = {
  readonly answers: { [questionId: number]: AnswerState };
};

export class HostApplicationForm extends React.PureComponent<Props, State> {
  state: State = {
    answers: {},
  };

  private onChoiceChange = (questionId: number) => (e: React.FormEvent<HTMLInputElement>) => {
    const choiceId = Number(e.currentTarget.value);
    this.setState(prev => ({
      answers: { ...prev.answers, [questionId]: { choiceId } },
    }));
  };

  private onTextChange = (questionId: number) => (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textAnswer = e.target.value;
    this.setState(prev => ({
      answers: { ...prev.answers, [questionId]: { textAnswer } },
    }));
  };

  private isComplete = (): boolean =>
    this.props.questions.every(question => {
      const answer = this.state.answers[question.id];
      if (!answer) return false;

      return question.questionType === 'multiple choice'
        ? answer.choiceId !== undefined
        : !!answer.textAnswer && answer.textAnswer.trim().length > 0;
    });

  private submit = () => {
    const answers: SubmitAnswerData[] = this.props.questions.map(question => ({
      questionId: question.id,
      choiceId: this.state.answers[question.id] && this.state.answers[question.id].choiceId,
      textAnswer: this.state.answers[question.id] && this.state.answers[question.id].textAnswer,
    }));

    this.props.onSubmit(answers);
  };

  render() {
    const { questions, submitting } = this.props;

    return (
      <div>
        {questions.map(question => (
          <div key={question.id} style={{ marginBottom: 20 }}>
            <H5>{question.prompt}</H5>

            {question.questionType === 'multiple choice' ? (
              <RadioGroup
                onChange={this.onChoiceChange(question.id)}
                selectedValue={this.state.answers[question.id] && this.state.answers[question.id].choiceId}
              >
                {question.choices.map(choice => (
                  <Radio key={choice.id} label={choice.text} value={choice.id} disabled={submitting} />
                ))}
              </RadioGroup>
            ) : (
              <TextArea
                className={Classes.FILL}
                fill
                value={(this.state.answers[question.id] && this.state.answers[question.id].textAnswer) || ''}
                onChange={this.onTextChange(question.id)}
                disabled={submitting}
              />
            )}
          </div>
        ))}

        <Button
          type="button"
          intent={Intent.PRIMARY}
          icon="add"
          disabled={submitting || !this.isComplete()}
          onClick={this.submit}
        >
          Submit Application
        </Button>
      </div>
    );
  }
}
