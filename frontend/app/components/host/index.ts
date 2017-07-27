import { ApplicationState } from '../../state/ApplicationState';
import { change, Config, getFormValues, reduxForm } from 'redux-form';
import { renderTeamStyle, TeamStyles } from '../../TeamStyles';
import * as moment from 'moment';
import { AuthenticationActions } from '../../state/AuthenticationState';
import { RouteComponentProps, withRouter } from 'react-router';
import { connect } from 'react-redux';
import { BadDataError, createMatch, ForbiddenError, NotAuthenticatedError } from '../../api/index';
import { validate } from '../../validate';
import { validation } from './validation';
import { HostFormData } from './HostFormData';
import { HostFormStateProps, HostForm as HostFormComponent, HostFormDispatchProps } from './HostForm';
import { Dispatch } from 'redux';

const formConfig: Config<HostFormData, HostFormStateProps & HostFormDispatchProps & RouteComponentProps<any>, {}> = {
  form: 'host',
  validate: validate(validation),
  onSubmit: (values, dispatch, props) => {
    return createMatch(values, props.authentication)
      .then(() => {
        props.history.push('/matches');
      })
      .catch((err) => {
        if (err instanceof BadDataError)
          return alert(`Bad data: ${err.message}`);

        if (err instanceof NotAuthenticatedError) {
          // User cookie has expired, get them to reauthenticate
          window.location.href = '/authenticate?path=/host';
          return;
        }

        if (err instanceof ForbiddenError) {
          alert('You no longer have hosting permission');
          // force log them out
          dispatch(AuthenticationActions.logout());
          props.history.push('/');
          return;
        }

        alert('Unexpected server issue, please contact an admin if this persists');
      });
  },
};

function mapStateToProps(state: ApplicationState): HostFormStateProps {
  const formValues = getFormValues<HostFormData>('host')(state) || state.host.formInitialState;
  const teams = TeamStyles.find(t => t.value === formValues.teams);

  return {
    preview: {
      ...formValues,
      id: 0,
      author: state.authentication.data!.accessTokenClaims.username,
      removed: false,
      removedBy: null,
      removedReason: null,
      created: moment.utc(),
    },
    templateContext: {
      ...formValues,
      // overwite teams value with rendered version
      teams: renderTeamStyle(teams!, formValues.size, formValues.customStyle),
      teamStyle: teams!.value,
      author: state.authentication.data!.accessTokenClaims.username,
    },
    teamStyle: teams,
    initialValues: state.host.formInitialState,
    authentication: state.authentication,
  };
}

function mapDispatchToProps(dispatch: Dispatch<ApplicationState>): HostFormDispatchProps {
  return {
    // TODO change tabs to controlled mode so we can switch tab to preview when using presets
    changeTemplate: value => () => dispatch(change('host', 'content', value)),
  };
}

export const HostForm =
  withRouter<{}>(
    connect<HostFormStateProps, HostFormDispatchProps, RouteComponentProps<any>>(mapStateToProps, mapDispatchToProps)(
      reduxForm(formConfig)(
        HostFormComponent,
      ),
    ),
  );
