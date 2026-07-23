import * as React from 'react';
import { Alert, Button, Classes, Intent, Tag } from '@blueprintjs/core';
import { ManageQuizQuestion } from '../../models/QuizQuestion';

type Props = {
  readonly question: ManageQuizQuestion;
  readonly onDelete: (id: number) => void;
};

type State = {
  readonly isAlertOpen: boolean;
};

export class ExistingQuizQuestion extends React.PureComponent<Props, State> {
  state: State = {
    isAlertOpen: false,
  };

  private onClick = () => this.setState({ isAlertOpen: true });
  private onCancel = () => this.setState({ isAlertOpen: false });
  private onConfirm = () => {
    this.props.onDelete(this.props.question.id);
    this.onCancel();
  };

  render() {
    const { question } = this.props;

    return (
      <div className={`${Classes.CARD} ${Classes.ELEVATION_1}`} style={{ marginBottom: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <strong>{question.prompt}</strong>
          <Button icon="trash" intent={Intent.DANGER} minimal onClick={this.onClick} />
        </div>

        <Tag minimal style={{ marginTop: 5 }}>
          {question.questionType}
        </Tag>

        {question.questionType === 'multiple choice' && (
          <ul>
            {question.choices.map(choice => (
              <li key={choice.id}>
                {choice.text} {choice.correct && <Tag intent={Intent.SUCCESS}>correct</Tag>}
              </li>
            ))}
          </ul>
        )}

        <Alert
          isOpen={this.state.isAlertOpen}
          onConfirm={this.onConfirm}
          onCancel={this.onCancel}
          confirmButtonText="Delete"
          cancelButtonText="Cancel"
          intent={Intent.DANGER}
        >
          <p>Are you sure you want to delete this question?</p>
        </Alert>
      </div>
    );
  }
}
