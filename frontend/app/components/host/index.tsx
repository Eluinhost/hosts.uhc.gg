import * as React from 'react';
import { ApplicationState } from '../../state/ApplicationState';
import { RouteComponentProps } from 'react-router';
import { CreateMatchForm } from './CreateMatchForm';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { nextAvailableSlot } from './nextAvailableSlot';
import { renderTeamStyle, TeamStyles } from '../../models/TeamStyles';
import { MatchesApi, ApiErrors } from '../../api';
import { change, getFormValues, SubmissionError } from 'redux-form';
import { renderToMarkdown } from './TemplateField';
import { getAccessToken, getUsername, isDarkMode, is12hFormat } from '../../state/Selectors';
import { createSelector } from 'reselect';
import { CreateMatchData } from '../../models/CreateMatchData';
import { SetSavedHostFormData } from '../../actions';

export type HostingPageStateProps = {
  readonly formValues: CreateMatchData | undefined;
  readonly username: string;
  readonly accessToken: string;
  readonly is12h: boolean;
  readonly savedData: CreateMatchData;
};

export type HostingPageDispatchProps = {
  readonly changeTemplate: (newTemplate: string) => void;
  readonly saveData: (data: CreateMatchData) => void;
  readonly updateOpeningTime: () => void;
};

const formKey: string = 'create-match-form';
const valuesSelector: (state: ApplicationState) => CreateMatchData = getFormValues<CreateMatchData>(formKey);

// Main goal of this is to save form data back to local storage when the component unmounts
class HostingPageComponent extends React.PureComponent<
  HostingPageStateProps & HostingPageDispatchProps & RouteComponentProps<any>
> {
  public onUnload = (): void => {
    // only save if we have values we can replace it with
    if (this.props.formValues) {
      this.props.saveData(this.props.formValues);
    }
  };

  public componentDidMount(): void {
    // when mounting we want to register for page unloads + load the stored values from local storage
    window.addEventListener('beforeunload', this.onUnload);

    // change the opening time
    this.props.updateOpeningTime();
  }

  public componentWillUnmount(): void {
    // remove the listener and fire the manual unload
    window.removeEventListener('beforeunload', this.onUnload);
    this.onUnload();
  }

  private createTemplateContext = (data: CreateMatchData): any => {
    const teams = TeamStyles.find(it => it.value === data.teams) || TeamStyles[0];

    return {
      ...data,
      // overwite teams value with rendered version
      teams: renderTeamStyle(teams, data.size, data.customStyle),
      teamStyle: teams.value,
      author: this.props.username,
    };
  };

  private handleCreateMatch = async (values: CreateMatchData): Promise<void> => {
    const withRenderedTemplate = {
      ...values,
      // we convert the template to markdown only, we don't want to send HTML
      content: renderToMarkdown(values.content, this.createTemplateContext(values)),
    };

    // Remove the team size if it isn't required to avoid potential non-ints being sent and rejected at decoding
    if (!TeamStyles.find(it => it.value === values.teams)!.requiresTeamSize) {
      withRenderedTemplate.size = null;
    }

    try {
      // fire API call
      await MatchesApi.create(withRenderedTemplate, this.props.accessToken);

      // if success send them to the matches page to view it
      this.props.history.push('/matches');
    } catch (err) {
      if (err instanceof ApiErrors.BadDataError) throw new SubmissionError({ _error: `Bad data: ${err.message}` });

      if (err instanceof ApiErrors.NotAuthenticatedError) {
        // User cookie has expired, get them to reauthenticate
        window.location.href = '/authenticate?path=/host';
        return;
      }

      if (err instanceof ApiErrors.ForbiddenError) {
        throw new SubmissionError({ _error: 'You no longer have hosting permission' });
      }

      throw new SubmissionError({ _error: 'Unexpected server issue, please contact an admin if this persists' });
    }
  };

  public render() {
    // Base data, use the current form value or the stored data if it doesn't exist (first-render I think)
    const data: CreateMatchData = this.props.formValues || this.props.savedData;

    const context = this.createTemplateContext(data);

    return (
      <CreateMatchForm
        form="create-match-form"
        initialValues={this.props.savedData!}
        currentValues={data}
        templateContext={context}
        username={this.props.username}
        changeTemplate={this.props.changeTemplate}
        createMatch={this.handleCreateMatch}
        is12h={this.props.is12h}
      />
    );
  }
}

const stateSelector = createSelector<
  ApplicationState,
  string | null,
  CreateMatchData,
  string | null,
  boolean,
  boolean,
  CreateMatchData,
  HostingPageStateProps
>(
  getUsername,
  valuesSelector,
  getAccessToken,
  isDarkMode,
  is12hFormat,
  state => state.hostFormSavedData,
  (username, formValues, accessToken, isDarkMode, is12h, savedData) => ({
    formValues,
    is12h,
    savedData,
    username: username || 'ERROR NO USERNAME IN STORE',
    accessToken: accessToken || 'ERROR NO ACCESS TOKEN IN STORE',
  }),
);

export const HostingPage = connect<HostingPageStateProps, HostingPageDispatchProps, RouteComponentProps<any>>(
  stateSelector,
  (dispatch: Dispatch<ApplicationState>): HostingPageDispatchProps => ({
    changeTemplate: (newTemplate: string) => dispatch(change(formKey, 'content', newTemplate)),
    saveData: (data: CreateMatchData) => dispatch(SetSavedHostFormData.start(data)),
    updateOpeningTime: () => dispatch(change(formKey, 'opens', nextAvailableSlot())),
  }),
)(HostingPageComponent);
