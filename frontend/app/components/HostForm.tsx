import * as React from 'react';
import { Config, FormProps, getFormValues, reduxForm } from 'redux-form';
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
import { MatchRow } from './matches/MatchRow';
import { Match } from '../Match';
import { Spec, validate } from '../validate';

type HostFormStateProps = {
  readonly teamStyle?: TeamStyle;
  readonly templateContext: any;
  readonly preview: Match;
  readonly initialValues: HostFormData;
  readonly authentication: AuthenticationState;
};

type HostFormDispatchProps = {
  readonly logout: () => any;
};

export type HostFormData = CreateMatchData;

function nextSlot(): moment.Moment {
  const in30 = moment.utc().add(30, 'minute');

  const targetMinute = in30.get('minute');
  const diffToNext15 = (Math.ceil(targetMinute / 15) * 15) - targetMinute;

  return in30.add(diffToNext15, 'minute');
}

export const minDate = nextSlot();

const disabledMinutes = range(0, 60).filter(m => m % 15 !== 0);

const openingDateProps: Partial<ReactDatePickerProps> = {
  minDate,
  fixedHeight: true,
  maxDate: moment().add(30, 'd').utc(),
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
  ({ submitting, handleSubmit, teamStyle, valid, templateContext, preview }) => (
    <form className="host-form" onSubmit={handleSubmit}>

      <fieldset className="opening-time">
        <legend>Timing</legend>
        <DateTimeField
          name="opens"
          required
          disabled={submitting}
          datePickerProps={openingDateProps}
          timePickerProps={openingTimeProps}
        />
        <div className="pt-callout pt-intent-warning">
          <h5>Note</h5>
          All times must be entered in the <a href="https://time.is/compare/UTC" target="_blank">UTC</a> timezone.
        </div>
      </fieldset>
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

      <fieldset>
        <legend>Extra Information</legend>

        <TemplateField
          name="content"
          required
          disabled={submitting}
          context={templateContext}
        />
      </fieldset>

      <fieldset>
        <legend>Game preview</legend>

        <MatchRow
          match={preview}
          canRemove={false}
        />
      </fieldset>

      <div className="host-form-actions">
        <Button
          type="submit"
          disabled={submitting || !valid}
          iconName="cloud-upload"
          loading={submitting}
          intent={valid ? Intent.SUCCESS : Intent.WARNING}
        >
          {submitting ? 'Creating...' : 'Create Match'}
        </Button>
      </div>
    </form>
  );

const validationSpec: Spec<HostFormData> = {
  count: count => !count || count < 0 ? 'Must provide a valid game #' : undefined,
  opens: (opens) => {
    if (!opens)
      return 'Must provide an opening time';

    if (opens.get('minute') % 15 !== 0) // TODO handle as UTC specifically
      return 'Must be on 15 minute intervals like xx:15, xx:30 e.t.c.';

    if (opens.isBefore(moment.utc().add(30, 'minutes')))
      return 'Must be at least 30 minutes in advance';

    return undefined;
  },
  ip: (ip) => {
    if (!ip)
      return 'A direct IP address is required';

    // TODO handle octets properly
    if (!/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d{1,5})?$/.test(ip))
      return 'Invalid IP adress, expected formatted like 123.123.123.123:12345';

    return undefined;
  },
  region: region => region ? undefined : 'You must select a region',
  teams: (teams, obj) => {
    if (!teams)
      return 'You must select a team style';

    const style = TeamStyles.find(i => i.value === teams);

    if (style!.requiresTeamSize && (!obj.size || obj.size < 1))
      return 'Must provide a valid team size with this scenario';

    if (style!.value === 'custom' && !obj.customStyle)
      return 'Must provide a custom style if \'custom\' is selected';

    return undefined;
  },
  content: content => content ? undefined : 'Must provide some content for the post',
  scenarios: scenarios => scenarios && scenarios.length ? undefined : 'Must provide at least 1 scenario',
  location: location => location ? undefined : 'Must provide a location',
  version: version => version && version.length ? undefined :  'Must provide a version',
  slots: slots => slots && slots > 1 ? undefined : 'Slots must be at least 2',
  length: length => length && length >= 30 ? undefined : 'Must be at least 30 minutes',
  mapSizeX: mapSizeX => mapSizeX && mapSizeX > 0 ? undefined : 'Must be positive',
  mapSizeZ: mapSizeZ => mapSizeZ && mapSizeZ > 0 ? undefined : 'Must be positive',
  pvpEnabledAt: pvpEnabledAt => pvpEnabledAt && pvpEnabledAt >= 0 ? undefined : 'Must be positive',
  address: address => undefined,
  tags: tags => undefined,
  size: size => undefined,
  customStyle: customStyle => undefined,
};

const formConfig: Config<HostFormData, HostFormStateProps & HostFormDispatchProps & RouteComponentProps<any>, {}> = {
  form: 'host',
  validate: validate(validationSpec),
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
