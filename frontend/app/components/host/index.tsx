import * as React from 'react';
import { ApplicationState } from '../../state/ApplicationState';
import { RouteComponentProps } from 'react-router';
import { CreateMatchForm } from './CreateMatchForm';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { nextAvailableSlot } from './nextAvailableSlot';
import { Regions } from '../../Regions';
import { renderTeamStyle, TeamStyles } from '../../TeamStyles';
import { BadDataError, createMatch, CreateMatchData, ForbiddenError, NotAuthenticatedError } from '../../api/index';
import { storage } from '../../storage';
import { change, getFormValues, SubmissionError } from 'redux-form';
import { omit } from 'ramda';
import { renderToMarkdown } from './TemplateField';
import { presets } from './presets';
import { Match } from '../../Match';
import { HostFormActions } from '../../state/HostFormState';
import * as moment from 'moment-timezone';
import { getAccessToken, getUsername, isDarkMode } from '../../state/Selectors';
import { createSelector } from 'reselect';

export type HostingPageStateProps = {
  readonly formValues: CreateMatchData | undefined;
  readonly username: string;
  readonly accessToken: string;
};

export type HostingPageDispatchProps = {
  readonly changeTemplate: (newTemplate: string) => void;
  readonly getConflicts: (region: string, opens: moment.Moment) => Promise<Match[]>;
};

export type HostingPageState = {
  readonly storedData: CreateMatchData | null;
};

const formKey: string = 'create-match-form';
const storageKey: string = formKey;
const valuesSelector: (state: ApplicationState) => CreateMatchData = getFormValues<CreateMatchData>(formKey);

// Main goal of this is not to render the form until data is loaded from local storage + to save form data
// back to local storage when the component unmounts
class HostingPageComponent extends React.Component<
  HostingPageStateProps & HostingPageDispatchProps & RouteComponentProps<any>,
  HostingPageState> {
  state = {
    storedData: null,
  };

  fallback: CreateMatchData = {
    opens: nextAvailableSlot(),
    region: Regions[0].value,
    teams: TeamStyles[0].value,
    scenarios: ['Vanilla+'],
    tags: [],
    size: null,
    customStyle: '',
    address: '',
    content: presets[0].template,
    ip: '',
    count: 1,
    location: '',
    length: 90,
    version: '1.8.8',
    mapSize: 1500,
    pvpEnabledAt: 20,
    slots: 80,
    hostingName: null,
    tournament: false,
  };

  onUnload = async (): Promise<any> => {
    // only save if we have values we can replace it with
    if (this.props.formValues) {
      await storage.setItem<CreateMatchData>(storageKey, omit(['opens'], this.props.formValues));
    }
  }

  async componentDidMount(): Promise<void> {
    // when mounting we want to register for page unloads + load the stored values from local storage
    window.addEventListener('beforeunload', this.onUnload);

    const data = await storage.getItem<CreateMatchData>(storageKey);

    // always overwrite opens time
    // then all the data that was stored (if there)
    // then fallback to the fallback values
    this.setState({
      storedData: {
        ...this.fallback,
        ...(data || {}),
        opens: nextAvailableSlot(),
      },
    });
  }

  componentWillUnmount(): void {
    // remove the listener and fire the manual unload
    window.removeEventListener('beforeunload', this.onUnload);
    this.onUnload();
  }

  createTemplateContext = (data: CreateMatchData): any => {
    const teams = TeamStyles.find(it => it.value === data.teams) || TeamStyles[0];

    return {
      ...data,
      // overwite teams value with rendered version
      teams: renderTeamStyle(teams, data.size, data.customStyle),
      teamStyle: teams.value,
      author: this.props.username,
    };
  }

  handleCreateMatch = async (values: CreateMatchData): Promise<void> => {
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
      await createMatch(withRenderedTemplate, this.props.accessToken);

      // if success send them to the matches page to view it
      this.props.history.push('/matches');
    } catch (err) {
      if (err instanceof BadDataError)
        throw new SubmissionError({ _error: `Bad data: ${err.message}` });

      if (err instanceof NotAuthenticatedError) {
        // User cookie has expired, get them to reauthenticate
        window.location.href = '/authenticate?path=/host';
        return;
      }

      if (err instanceof ForbiddenError)
        throw new SubmissionError({ _error: 'You no longer have hosting permission' });

      throw new SubmissionError({ _error: 'Unexpected server issue, please contact an admin if this persists' });
    }
  }

  render() {
    // don't render the form if the pre-load data isn't there yet
    if (this.state.storedData === null)
      return null;

    // Base data, use the current form value or the stored data if it doesn't exist (first-render I think)
    const data: CreateMatchData = this.props.formValues || this.state.storedData!;

    const context = this.createTemplateContext(data);

    return (
      <CreateMatchForm
        form="create-match-form"
        initialValues={this.state.storedData!}
        currentValues={data}
        templateContext={context}
        username={this.props.username}
        changeTemplate={this.props.changeTemplate}
        createMatch={this.handleCreateMatch}
        recheckConflicts={this.props.getConflicts}
      />
    );
  }
}

const stateSelector =
  createSelector<ApplicationState, string | null, CreateMatchData, string | null, boolean, HostingPageStateProps>(
    getUsername,
    valuesSelector,
    getAccessToken,
    isDarkMode,
    (username, formValues, accessToken, isDarkMode) => ({
      formValues,
      username: username || 'ERROR NO USERNAME IN STORE',
      accessToken: accessToken || 'ERROR NO ACCESS TOKEN IN STORE',
    }),
  );

export const HostingPage = connect<HostingPageStateProps, HostingPageDispatchProps, RouteComponentProps<any>>(
  stateSelector,
  (dispatch: Dispatch<ApplicationState>): HostingPageDispatchProps => ({
    changeTemplate: (newTemplate: string) => dispatch(change(formKey, 'content', newTemplate)),
    getConflicts: (region: string, opens: moment.Moment) => dispatch(HostFormActions.getConflicts(region, opens)),
  }),
)(HostingPageComponent);
