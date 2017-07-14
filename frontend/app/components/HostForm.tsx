import * as React from 'react';
import { Config, FormErrors, FormProps, formValueSelector, reduxForm } from 'redux-form';
import * as moment from 'moment';
import { Regions } from '../Regions';
import { TeamStyle, TeamStyles } from '../TeamStyles';
import { Button, Intent } from '@blueprintjs/core';
import { NumberField } from './fields/NumberField';
import { DateTimeField } from './fields/DateTimeField';
import { range } from 'ramda';
import { TextField } from './fields/TextField';
import { SelectField } from './fields/SelectField';
import { connect, Dispatch } from 'react-redux';
import { MarkdownField } from './fields/MarkdownField';
import { TagsField } from './fields/TagsField';
import { ApplicationState } from '../state/ApplicationState';
import { RouteComponentProps, withRouter } from 'react-router';
import { AuthenticationActions } from '../state/AuthenticationState';

type HostFormStateProps = {
  readonly teamStyle?: TeamStyle;
  readonly initialValues: HostFormData;
  readonly authToken: string;
};

type HostFormDispatchProps = {
  readonly logout: () => any;
};

export type HostFormData = {
  address?: string;
  ip: string;
  scenarios: string[];
  opens: moment.Moment;
  region: string;
  content: string;
  tags: string[];
  size: number;
  teams: string;
  customStyle?: string;
  count: number;
};

function nextSlot(): moment.Moment {
  const time = moment().add(30, 'minute');

  const minute = time.get('minute');
  const next15 = Math.ceil(minute / 15) * 15;

  const diff = next15 - minute;

  return time.add(diff, 'minute');
}

export const minDate = nextSlot();

const disabledMinutes = range(0, 60).filter(m => m % 15 !== 0);

const openingDateProps: Partial<ReactDatePickerProps> = {
  minDate,
  fixedHeight: true,
  maxDate: moment().add(30, 'd'),
  isClearable: false,
  monthsShown: 2,
};

const openingTimeProps: Partial<RcTimePickerProps> = {
  disabledMinutes() {
    return disabledMinutes;
  },
  hideDisabledOptions: true,
  showSecond: false,
};

const TeamSize: React.SFC<{ teamStyle?: TeamStyle, submitting?: boolean }> = ({ teamStyle, submitting }) => {
  if (!teamStyle || !teamStyle.requiresTeamSize)
    return null;

  return (
    <NumberField
      name="size"
      className="pt-fill"
      disabled={submitting}
      label="Team size"
      min={1}
      required
    />
  );
};

const CustomTeamStyle: React.SFC<{ teamStyle?: TeamStyle, submitting?: boolean }> = ({ teamStyle, submitting }) => {
  if (teamStyle && teamStyle.value === 'custom')
    return (
      <TextField
        name="customStyle"
        required
        label="Custom Team Style"
        disabled={submitting}
        className="pt-fill"
      />
    );

  return null;
};

const stopEnterSubmit: React.KeyboardEventHandler<any> = (e: React.KeyboardEvent<any>) => {
  if (e.key === 'Enter') {
    e.stopPropagation();
  }
};

const HostFormComponent: React.SFC<FormProps<HostFormData, {}, any> & HostFormStateProps> =
  ({ submitting, handleSubmit, teamStyle, valid }) => (
    <form onSubmit={handleSubmit}>

      <NumberField
        name="count"
        label="Game #"
        className="pt-fill"
        min={1}
        required
        disabled={submitting}
      />

      <DateTimeField
        name="opens"
        label="Opening Time (in the timezone of your PC)"
        required
        disabled={submitting}
        datePickerProps={openingDateProps}
        timePickerProps={openingTimeProps}
      />

      <div className="server-details">
        <TextField
          name="address"
          className="pt-fill"
          disabled={submitting}
          label="Server Address"
          required={false}
        />
        <TextField
          name="ip"
          className="pt-fill"
          disabled={submitting}
          label="Server IP Address"
          required
        />
        <SelectField
          name="region"
          className="pt-fill"
          disabled={submitting}
          label="Region"
          required
          options={Regions}
        />
      </div>

      <div className="teams-styles">
        <SelectField
          name="teams"
          className="pt-fill"
          disabled={submitting}
          label="Team Style"
          required
          options={TeamStyles}
        />

        <TeamSize teamStyle={teamStyle} submitting={submitting} />
        <CustomTeamStyle teamStyle={teamStyle} submitting={submitting} />
      </div>

      <div className="scenarios-and-tags" onKeyPress={stopEnterSubmit}>
        <TagsField
          name="scenarios"
          label="Scenarios"
          required
          disabled={submitting}
        />

        <TagsField
          name="tags"
          label="Tags"
          required={false}
          disabled={submitting}
        />
      </div>

      <MarkdownField
        name="content"
        label="Game Information"
        required
        className="game-information"
        disabled={submitting}
      />

      <Button
        type="submit"
        disabled={submitting || !valid}
        iconName="cloud-upload"
        loading={submitting}
        intent={valid ? Intent.SUCCESS : Intent.WARNING}
      >
        {submitting ? 'Creating...' : 'Create Match'}
      </Button>
    </form>
  );

const formConfig: Config<HostFormData, HostFormStateProps & HostFormDispatchProps & RouteComponentProps<any>, {}> = {
  form: 'host',
  validate: (values) => {
    const errors: FormErrors<HostFormData> = {};

    if (!values.count || values.count < 1) {
      errors.count = 'Must provide a valid game #';
    }

    if (!values.opens) {
      errors.opens = 'Must provide an opening time';
    } else if (values.opens.get('minute') % 5 !== 0) {
      errors.opens = 'Must be on 5 minute intervals like xx:05, xx:10 e.t.c.';
    } else if (values.opens.isBefore(moment().add(30, 'minutes'))) {
      errors.opens = 'Must be at least 30 minutes in advance';
    }

    if (!values.ip) {
      errors.ip = 'A direct IP address is required';
    } else if (!/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d{1,5})?$/.test(values.ip)) {
      errors.ip = 'Invalid IP adress, expected formatted like 123.123.123.123:12345';
    }

    if (!values.region) {
      errors.region = 'You must select a region';
    }

    if (!values.teams) {
      errors.teams = 'You must select a team style';
    } else {
      const style = TeamStyles.find(i => i.value === values.teams);

      if (style!.requiresTeamSize && !values.size) {
        errors.size = 'Must provide a team size with this scenario';
      }

      if (style!.value === 'custom' && !values.customStyle) {
        errors.customStyle = 'Must provide a custom style if \'custom\' is selected';
      }
    }

    if (!values.content) {
      errors.content = 'Must provide some content for the post';
    }

    if (!values.scenarios || !values.scenarios.length) {
      errors.scenarios = 'Must provide at least 1 scenario';
    }

    return errors;
  },
  onSubmit: (values, dispatch, props) => {
    return fetch('/api/matches', {
      credentials: 'include',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${props.authToken}`,
      },
      body: JSON.stringify(values),
    }).then((response) => {
      switch (response.status) {
        case 201:
          // Post created
          // TODO go to 'completed' route
          alert('Created');
          break;
        case 400:
          // Bad request
          response.text().then(text => alert(`Bad data ${text}`));
          break;
        case 401:
          // User cookie has expired, get them to reauthenticate
          window.location.href = '/authenticate';
          break;
        case 403:
          alert('You do not have hosting permission');
          // force log them out
          props.logout();
          props.history.push('/');
          break;
        default:
          alert('Unexpected server issue, please contact an admin if this persists');
      }
    }).catch((err) => {
      console.error(err);
      alert(`Unexpected error: ${err}`);
    });
  },
};

const selector = formValueSelector('host');

function mapStateToProps(state: ApplicationState): HostFormStateProps {
  return {
    teamStyle: TeamStyles.find(t => t.value === selector(state, 'teams')),
    initialValues: state.hostFormInitialData,
    authToken: state.authentication.data ? state.authentication.data.raw : '',// TODO this page should be auth only
  };
}

function mapDispatchToProps(dispatch: Dispatch<any>): HostFormDispatchProps {
  return {
    logout: () => dispatch(AuthenticationActions.logout()),
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
