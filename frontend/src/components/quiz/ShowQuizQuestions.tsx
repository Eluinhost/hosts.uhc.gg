import * as React from 'react';
import { Classes, H3, H5, Intent, NonIdealState, Spinner } from '@blueprintjs/core';
import { ComponentType } from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { ApplicationState } from '../../state/ApplicationState';
import { getAccessToken } from '../../state/Selectors';
import { QuizApi } from '../../api';
import { CreateQuizQuestionData, ManageQuizQuestion } from '../../models/QuizQuestion';
import { CreateQuizQuestionForm } from './CreateQuizQuestionForm';
import { ExistingQuizQuestion } from './ExistingQuizQuestion';
import { AppToaster } from '../../services/AppToaster';

type DispatchProps = {
  readonly accessToken: string;
};

type State = {
  readonly loading: boolean;
  readonly error: string | null;
  readonly questions: ManageQuizQuestion[];
};

class ShowQuizQuestionsComponent extends React.PureComponent<DispatchProps, State> {
  state: State = {
    loading: true,
    error: null,
    questions: [],
  };

  componentDidMount() {
    this.onRefresh();
  }

  private onRefresh = () =>
    QuizApi.fetchQuizQuestionsForManagement(this.props.accessToken)
      .then(questions => this.setState({ questions, loading: false, error: null }))
      .catch(err => {
        console.error(err);
        this.setState({ loading: false, error: 'Unable to load quiz questions' });
      });

  private onSubmit = (question: CreateQuizQuestionData): Promise<boolean> =>
    QuizApi.createQuizQuestion(question, this.props.accessToken)
      .then(() => {
        AppToaster.show({ message: 'Created new question', intent: Intent.SUCCESS });
        return this.onRefresh().then(() => true);
      })
      .catch(() => {
        AppToaster.show({ message: 'Error creating question', intent: Intent.DANGER });
        return false;
      });

  private onDelete = (id: number) =>
    QuizApi.deleteQuizQuestion(id, this.props.accessToken)
      .then(() => {
        AppToaster.show({ message: 'Question deleted', intent: Intent.SUCCESS });
        this.setState(prev => ({ questions: prev.questions.filter(q => q.id !== id) }));
      })
      .catch(() => {
        AppToaster.show({ message: 'Error deleting question', intent: Intent.DANGER });
      });

  render() {
    let top;
    if (this.state.error) {
      top = (
        <div className={`${Classes.CALLOUT} ${Classes.INTENT_DANGER}`}>
          <H5>Error: {this.state.error}</H5>
        </div>
      );
    } else if (this.state.loading) {
      top = <NonIdealState icon={<Spinner />} title="Loading...." />;
    } else if (this.state.questions.length === 0) {
      top = <NonIdealState icon="help" title="No questions setup" />;
    } else {
      top = (
        <div>
          {this.state.questions.map(question => (
            <ExistingQuizQuestion question={question} key={question.id} onDelete={this.onDelete} />
          ))}
        </div>
      );
    }

    return (
      <div>
        {top}

        <H3>Create new question</H3>
        <CreateQuizQuestionForm onSubmit={this.onSubmit} />
      </div>
    );
  }
}

const stateSelector = createSelector<ApplicationState, string | null, DispatchProps>(getAccessToken, accessToken => ({
  accessToken: accessToken || 'NO ACCESS TOKEN IN STORE',
}));

export const ShowQuizQuestions: ComponentType = connect<DispatchProps, {}, {}>(stateSelector)(ShowQuizQuestionsComponent);
