import * as React from 'react';
import { Config, FormErrors, FormProps, getFormValues, reduxForm } from 'redux-form';
import * as moment from 'moment';
import { Regions } from '../Regions';
import { renderTeamStyle, TeamStyle, TeamStyles } from '../TeamStyles';
import { Button, Intent } from '@blueprintjs/core';
import { NumberField } from './fields/NumberField';
import { DateTimeField } from './fields/DateTimeField';
import { range } from 'ramda';
import { TextField } from './fields/TextField';
import { SelectField } from './fields/SelectField';
import { connect, Dispatch } from 'react-redux';
import { TagsField } from './fields/TagsField';
import { ApplicationState } from '../state/ApplicationState';
import { RouteComponentProps, withRouter } from 'react-router';
import { AuthenticationActions, AuthenticationState } from '../state/AuthenticationState';
import { BadDataError, createMatch, CreateMatchData, ForbiddenError, NotAuthenticatedError } from '../api/index';
import { TemplateField } from './fields/TemplateField';

type HostFormStateProps = {
  readonly teamStyle?: TeamStyle;
  readonly templateContext: any;
  readonly initialValues: HostFormData;
  readonly authentication: AuthenticationState;
};

type HostFormDispatchProps = {
  readonly logout: () => any;
};

export type HostFormData = CreateMatchData;

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
    e.preventDefault();
    e.stopPropagation();
  }
};

const HostFormComponent: React.SFC<FormProps<HostFormData, {}, any> & HostFormStateProps> =
  ({ submitting, handleSubmit, teamStyle, valid, templateContext }) => (
    <form onSubmit={handleSubmit}>
      <div className="opening-time">
        <DateTimeField
          name="opens"
          label="Opening Time"
          required
          disabled={submitting}
          datePickerProps={openingDateProps}
          timePickerProps={openingTimeProps}
        />
      </div>
      <fieldset>
        <legend>Game Details</legend>
        <div className="host-form-row">
          <NumberField
            name="count"
            label="Game Number"
            className="pt-fill"
            min={1}
            required
            disabled={submitting}
          />
          <TextField
            name="version"
            label="Game version"
            className="pt-fill"
            required
            disabled={submitting}
          />
        </div>
        <div className="host-form-row">
          <NumberField
            name="mapSizeX"
            label="Map size (X)"
            className="pt-fill"
            min={1}
            required
            disabled={submitting}
          />
          <NumberField
            name="mapSizeZ"
            label="Map size (Z)"
            className="pt-fill"
            min={1}
            required
            disabled={submitting}
          />
        </div>
        <div className="host-form-row">
          <NumberField
            name="length"
            label="Game length (minutes)"
            className="pt-fill"
            min={30}
            required
            disabled={submitting}
          />
          <NumberField
            name="pvpEnabledAt"
            label="PVP Enabled (minutes)"
            className="pt-fill"
            min={0}
            required
            disabled={submitting}
          />
        </div>
      </fieldset>

      <fieldset>
        <legend>Scenarios + Teams</legend>
        <div className="host-form-row" onKeyPress={stopEnterSubmit}>
          <TagsField
            name="scenarios"
            label="Scenarios"
            required
            disabled={submitting}
          />
        </div>
        <div className="host-form-row">
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
      </fieldset>

      <fieldset>
        <legend>Server Details</legend>

        <div className="host-form-row">
          <TextField
            name="ip"
            className="pt-fill"
            disabled={submitting}
            label="Server IP Address"
            required
          />
          <TextField
            name="address"
            className="pt-fill"
            disabled={submitting}
            label="Server Address"
            required={false}
          />
        </div>
        <div className="host-form-row">
          <SelectField
            name="region"
            className="pt-fill"
            disabled={submitting}
            label="Region"
            required
            options={Regions}
          />
          <TextField
            name="location"
            className="pt-fill"
            disabled={submitting}
            label="Location"
            required
          />
        </div>
        <div className="host-form-row">
          <NumberField
            name="slots"
            className="pt-fill"
            disabled={submitting}
            label="Available Slots"
            required
            min={2}
          />
          <div onKeyPress={stopEnterSubmit}>
            <TagsField
              name="tags"
              label="Tags"
              required={false}
              disabled={submitting}
            />
          </div>
        </div>
      </fieldset>

      <TemplateField
        name="content"
        label="Extra game information"
        required
        disabled={submitting}
        context={templateContext}
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
    } else if (values.opens.get('minute') % 15 !== 0) {
      errors.opens = 'Must be on 15 minute intervals like xx:15, xx:30 e.t.c.';
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

    if (!values.location || !values.location.length) {
      errors.location = 'Must provide a location';
    }

    if (!values.version || !values.version.length) {
      errors.version = 'Must provide a version';
    }

    if (!values.slots || values.slots < 2) {
      errors.slots = 'Slots must be at least 2';
    }

    if (!values.length || values.length < 30) {
      errors.length = 'Must be at least 30 minutes';
    }

    if (!values.mapSizeX || values.mapSizeX < 0) {
      errors.mapSizeX = 'Must be positive';
    }

    if (!values.mapSizeZ || values.mapSizeZ < 0) {
      errors.mapSizeZ = 'Must be positive';
    }

    if (!values.pvpEnabledAt || values.pvpEnabledAt < 0) {
      errors.pvpEnabledAt = 'Must be positive';
    }

    return errors;
  },
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
          props.logout();
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
    templateContext: {
      ...formValues,
      // overwite teams value with rendered version
      teams: renderTeamStyle(teams!, formValues.size, formValues.customStyle),
      teamStyle: teams!.value,
    },
    teamStyle: teams,
    initialValues: state.host.formInitialState,
    authentication: state.authentication,
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
