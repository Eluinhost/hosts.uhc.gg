import { FormProps, reduxForm, StrictFormProps } from 'redux-form';
import { ApplicationState } from '../../state/ApplicationState';
import { DateTimeField } from '../fields/DateTimeField';
import { NumberField } from '../fields/NumberField';
import { TextField } from '../fields/TextField';
import * as React from 'react';
import { nextAvailableSlot } from './nextAvailableSlot';
import * as moment from 'moment';
import { range } from 'ramda';
import { TagsField } from '../fields/TagsField';
import { SelectField } from '../fields/SelectField';
import { TeamStyles } from '../../TeamStyles';
import { Regions } from '../../Regions';
import { TemplateField } from './TemplateField';
import { MatchRow } from '../matches/MatchRow';
import { Match } from '../../Match';
import { Button, Intent } from '@blueprintjs/core';
import { validate } from '../../validate';
import { validation } from './validation';
import { CreateMatchData } from '../../api/index';
import { HostingRules } from '../HostingRules';

const noop = (): void => {};

export type CreateMatchFormProps = {
  readonly currentValues: CreateMatchData;
  readonly templateContext: any;
  readonly username: string;
  readonly changeTemplate: (newTemplate: string) => void;
  readonly createMatch: (data: CreateMatchData) => Promise<void>;
};

const disabledMinutes = range(0, 60).filter(m => m % 15 !== 0);

const openingTimeProps: Partial<RcTimePickerProps> = {
  disabledMinutes() {
    return disabledMinutes;
  },
  hideDisabledOptions: true,
  showSecond: false,
};

const stopEnterSubmit: React.KeyboardEventHandler<any> = (e: React.KeyboardEvent<any>) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    e.stopPropagation();
  }
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

const CustomStyleField: React.SFC<{ readonly disabled?: boolean }> = ({ disabled }) => (
  <TextField
    name="customStyle"
    required
    label="Custom Team Style"
    disabled={disabled}
    className="pt-fill"
  />
);

const CreateMatchFormComponent:
  React.SFC<StrictFormProps<CreateMatchData, {}, ApplicationState> & CreateMatchFormProps> =
  ({
     handleSubmit,
     submitting,
     currentValues,
     templateContext,
     username,
     changeTemplate,
     valid,
     createMatch,
     error,
  }) => {
    const teamStyle = TeamStyles.find(it => it.value === currentValues.teams) || TeamStyles[0];
  
    const openingDateProps: Partial<ReactDatePickerProps> = {
      minDate: nextAvailableSlot(),
      fixedHeight: true,
      maxDate: moment().add(30, 'd').utc(),
      isClearable: false,
      monthsShown: 2,
    };
    
    const preview: Match = {
      ...currentValues,
      id: 0,
      author: username,
      removed: false,
      removedBy: null,
      removedReason: null,
      created: moment(),
    };

    return (
      <form className="host-form" onSubmit={handleSubmit(createMatch)}>

        <HostingRules />

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

            {teamStyle.requiresTeamSize && <TeamSizeField disabled={submitting} />}
            {teamStyle.value === 'custom' && <CustomStyleField disabled={submitting} />}
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
            onRemovePress={noop}
          />
        </fieldset>

        {error && <div className="pt-callout pt-intent-danger"><h5>{error}</h5></div>}
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
  };

const CreateMatchWithForm: React.SFC<FormProps<CreateMatchData, {}, ApplicationState> & CreateMatchFormProps> =
  reduxForm<CreateMatchData, CreateMatchFormProps>({
    validate: validate(validation),
  })(CreateMatchFormComponent);

export const CreateMatchForm = CreateMatchWithForm;
