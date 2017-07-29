import { TeamStyle, TeamStyles } from '../../TeamStyles';
import { Match } from '../../Match';
import { HostFormData } from './HostFormData';
import { AuthenticationState } from '../../state/AuthenticationState';
import * as moment from 'moment';
import { Button, Intent } from '@blueprintjs/core';
import { MatchRow } from '../matches/MatchRow';
import { TemplateField } from './TemplateField';
import { TagsField } from '../fields/TagsField';
import { NumberField } from '../fields/NumberField';
import { TextField } from '../fields/TextField';
import { Regions } from '../../Regions';
import { SelectField } from '../fields/SelectField';
import { DateTimeField } from '../fields/DateTimeField';
import { FormProps } from 'redux-form';
import * as React from 'react';
import { range } from 'ramda';
import { nextAvailableSlot } from './nextAvailableSlot';

export type HostFormStateProps = {
  readonly teamStyle?: TeamStyle;
  readonly templateContext: any;
  readonly preview: Match;
  readonly initialValues: HostFormData;
  readonly authentication: AuthenticationState;
};

export type HostFormDispatchProps = {
  readonly changeTemplate: (value: string) => () => void;
};

export const minDate = nextAvailableSlot();

const openingDateProps: Partial<ReactDatePickerProps> = {
  minDate,
  fixedHeight: true,
  maxDate: moment().add(30, 'd').utc(),
  isClearable: false,
  monthsShown: 2,
};

const disabledMinutes = range(0, 60).filter(m => m % 15 !== 0);

const openingTimeProps: Partial<RcTimePickerProps> = {
  disabledMinutes() {
    return disabledMinutes;
  },
  hideDisabledOptions: true,
  showSecond: false,
};

const TeamSizeField: React.SFC<{ readonly disabled?: boolean }> = ({ disabled }) => (
  <NumberField
    name="size"
    className="pt-fill"
    disabled={disabled}
    label="Team size"
    min={1}
    max={32767}
    required
  />
);

const CustomStyleField: React.SFC<{ readonly disabled?: boolean}> = ({ disabled }) => (
  <TextField
    name="customStyle"
    required
    label="Custom Team Style"
    disabled={disabled}
    className="pt-fill"
  />
);

const stopEnterSubmit: React.KeyboardEventHandler<any> = (e: React.KeyboardEvent<any>) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    e.stopPropagation();
  }
};

export const HostForm: React.SFC<FormProps<HostFormData, {}, any> & HostFormStateProps & HostFormDispatchProps> =
  ({ submitting, handleSubmit, teamStyle, valid, templateContext, preview, changeTemplate }) => (
    <form className="host-form" onSubmit={handleSubmit}>

      <fieldset className="opening-time">
        <legend>Opening Time</legend>
        <DateTimeField
          name="opens"
          required
          disabled={submitting}
          datePickerProps={openingDateProps}
          timePickerProps={openingTimeProps}
        >
          <div className="pt-callout pt-intent-danger pt-icon-warning-sign">
            <h5>
              <span> All times must be entered as </span>
              <a href="https://time.is/compare/UTC" target="_blank">UTC</a>
            </h5>
          </div>
        </DateTimeField>
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

          {(teamStyle && teamStyle.requiresTeamSize) && <TeamSizeField disabled={submitting} />}
          {(teamStyle && teamStyle.value === 'custom') && <CustomStyleField disabled={submitting} />}
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
          changeTemplate={changeTemplate}
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

