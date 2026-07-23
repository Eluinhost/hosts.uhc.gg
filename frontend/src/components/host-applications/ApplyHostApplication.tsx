import * as React from 'react';
import { Button, Callout, H1, Intent, NonIdealState, Spinner } from '@blueprintjs/core';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { RouteComponentProps } from 'react-router';
import { createSelector } from 'reselect';
import { ApplicationState } from '../../state/ApplicationState';
import { getAccessToken, getPermissions, getUsername } from '../../state/Selectors';
import { ApiErrors, PermissionsApi, QuizApi } from '../../api';
import { QuizQuestion } from '../../models/QuizQuestion';
import { SubmitAnswerData } from '../../models/HostApplication';
import { HostApplicationForm } from './HostApplicationForm';

type StateProps = {
  readonly accessToken: string | null;
  readonly username: string | null;
  readonly permissions: string[];
};

type State = {
  readonly questions: QuizQuestion[];
  readonly loading: boolean;
  readonly submitting: boolean;
  readonly submitted: boolean;
  readonly error: string | null;
};

class ApplyHostApplicationPageComponent extends React.PureComponent<StateProps & RouteComponentProps<any>, State> {
  state: State = {
    questions: [],
    loading: true,
    submitting: false,
    submitted: false,
    error: null,
  };

  public componentDidMount() {
    this.load();
  }

  private canApply = () =>
    !!this.props.username && !this.props.permissions.includes('host') && !this.props.permissions.includes('trial host') && !this.props.permissions.includes('hosting banned');

  private isBanned = () => this.props.permissions.includes('hosting banned');

  private load = async () => {
    try {
      const questions = await QuizApi.fetchQuizQuestions();
      this.setState({ questions, loading: false, error: null });
    } catch (e) {
      this.setState({ loading: false, error: 'Unable to load quiz questions' });
    }
  };

  private submit = async (answers: SubmitAnswerData[]) => {
    if (!this.props.accessToken) return;

    this.setState({ submitting: true, error: null });
    try {
      await PermissionsApi.createHostApplication(answers, this.props.accessToken);
      this.setState({ submitting: false, submitted: true });
    } catch (error) {
      const message =
        error instanceof ApiErrors.BadDataError ? error.message.replace(/^User supplied invalid data: /, '') : 'Unable to submit host application';
      this.setState({ submitting: false, error: message });
    }
  };

  public render() {
    if (this.isBanned()) {
      return (
        <NonIdealState
          icon="ban-circle"
          title="You cannot apply"
          description="You are banned from hosting and cannot submit an application."
          action={
            <Link to="/host-applications">
              <Button>Back to Host Applications</Button>
            </Link>
          }
        />
      );
    }

    if (!this.canApply()) {
      return (
        <NonIdealState
          icon="tick-circle"
          title="You don't need to apply"
          description="You're already a host, or you're not logged in."
          action={
            <Link to="/host-applications">
              <Button>Back to Host Applications</Button>
            </Link>
          }
        />
      );
    }

    if (this.state.submitted) {
      return (
        <NonIdealState
          icon="tick"
          title="Application submitted"
          description="Head back to Host Applications to check on its status."
          action={
            <Link to="/host-applications">
              <Button intent={Intent.PRIMARY}>Back to Host Applications</Button>
            </Link>
          }
        />
      );
    }

    return (
      <div>
        <H1>Apply to Host</H1>

        {this.state.error && <Callout intent={Intent.DANGER}>{this.state.error}</Callout>}

        {this.state.loading ? (
          <Spinner />
        ) : this.state.questions.length === 0 ? (
          <NonIdealState icon="help" title="No quiz questions have been configured yet" />
        ) : (
          <HostApplicationForm questions={this.state.questions} submitting={this.state.submitting} onSubmit={this.submit} />
        )}
      </div>
    );
  }
}

const stateSelector = createSelector<ApplicationState, string | null, string | null, string[], StateProps>(
  getAccessToken,
  getUsername,
  getPermissions,
  (accessToken, username, permissions) => ({ accessToken, username, permissions }),
);

export const ApplyHostApplicationPage: React.ComponentType<RouteComponentProps<any>> = connect<
  StateProps,
  {},
  RouteComponentProps<any>
>(stateSelector)(ApplyHostApplicationPageComponent);
