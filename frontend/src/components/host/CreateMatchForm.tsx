import { ConfigProps, InjectedFormProps, reduxForm } from "redux-form";
import { DateTimeField } from '../fields/DateTimeField';
import { NumberField } from '../fields/NumberField';
import { TextField } from '../fields/TextField';
import * as React from 'react';
import { nextAvailableSlot } from './nextAvailableSlot';
import * as moment from 'moment';
import { TagsField } from '../fields/TagsField';
import { SelectField } from '../fields/SelectField';
import { SuggestionsField } from '../fields/SuggestionsField';
import { TeamStyles } from '../../models/TeamStyles';
import { Regions } from '../../models/Regions';
import { TemplateField } from './TemplateField';
import { MatchRow } from '../match-row';
import { Match } from '../../models/Match';
import { Button, Callout, Classes, H5, Intent } from "@blueprintjs/core";
import { asyncValidation, validator } from './validation';
import { HostingRules } from '../hosting-rules';
import { PotentialConflicts } from './PotentialConflicts';
import { SwitchField } from '../fields/SwitchField';
import { Title } from '../Title';
import { Versions } from '../../models/Versions';
import { CreateMatchData } from '../../models/CreateMatchData';

export type CreateMatchFormProps = {
  readonly currentValues: CreateMatchData;
  readonly templateContext: any;
  readonly username: string;
  readonly is12h: boolean;
  readonly changeTemplate: (newTemplate: string) => void;
  readonly createMatch: (data: CreateMatchData) => void;
};

const stopEnterSubmit: React.KeyboardEventHandler<any> = (e: React.KeyboardEvent<any>): void => {
  if (e.key === 'Enter') {
    e.preventDefault();
    e.stopPropagation();
  }
};

const TeamSizeField: React.FunctionComponent<{ readonly disabled?: boolean }> = ({ disabled }) => (
  <NumberField
    name="size"
    className={Classes.FILL}
    disabled={disabled}
    label="Team size (0 for 'ToX')"
    min={0}
    max={32767}
    required
  />
);

const CustomStyleField: React.FunctionComponent<{ readonly disabled?: boolean }> = ({ disabled }) => (
  <TextField name="customStyle" required label="Custom Team Style" disabled={disabled} className={Classes.FILL} />
);

class CreateMatchFormComponent extends React.Component<
  InjectedFormProps<CreateMatchData, CreateMatchFormProps> & CreateMatchFormProps
> {
  componentDidMount() {
    this.props.asyncValidate!();
  }

  render() {
    const {
      handleSubmit,
      submitting,
      currentValues,
      templateContext,
      username,
      changeTemplate,
      valid,
      createMatch,
      error,
      asyncValidating,
    } = this.props;

    const disabledAsync = submitting || asyncValidating !== false; // asyncvalidating is string | boolean

    const teamStyle = TeamStyles.find(it => it.value === currentValues.teams) || TeamStyles[0];

    const preview: Match = {
      ...currentValues,
      id: 0,
      author: username,
      removed: false,
      removedBy: null,
      removedReason: null,
      approvedBy: null,
      created: moment.utc(),
    };

    return (
      <form className="host-form" onSubmit={handleSubmit!(createMatch)}>
        <Title>Create a match</Title>
        <HostingRules />

        <fieldset className="opening-time">
          <legend>Opening Time</legend>
          <DateTimeField
            name="opens"
            required
            disabled={disabledAsync}
            datePickerProps={{
              minDate: nextAvailableSlot().toDate(),
              fixedHeight: true,
              maxDate: moment.utc().add(30, 'd').toDate(),
              isClearable: false,
              showTimeSelect: true,
              monthsShown: 2,
              timeIntervals: 15,
              timeFormat: this.props.is12h ? 'hh:mm aa' : 'HH:mm',
            }}
          />
          <Callout intent={Intent.WARNING} icon="warning-sign">
            <H5>
              <span> All times must be entered as </span>
              <a href="https://time.is/compare/UTC" target="_blank" rel="noopener noreferrer">
                UTC
              </a>
            </H5>
          </Callout>
        </fieldset>
        <fieldset>
          <legend>Game Details</legend>
          <div className="host-form-row host-form-row--tournament">
            <SwitchField
              name="tournament"
              label="Is this a Tournament?"
              disabled={disabledAsync}
              className={Classes.LARGE}
            />
          </div>
          <div className="host-form-row">
            <TextField
              name="hostingName"
              label="Hosting Name (optional)"
              className={Classes.FILL}
              required={false}
              disabled={submitting}
            />
            <NumberField name="count" label="Game Number" className={Classes.FILL} min={1} required disabled={submitting} />
          </div>
          <div className="host-form-row">
            <SuggestionsField
              name="version"
              label="Game version"
              className={Classes.FILL}
              required
              disabled={submitting}
              suggestions={Versions}
              suggestionText="Choose"
            />
            <NumberField
              name="mapSize"
              label="Map size (diameter)"
              className={Classes.FILL}
              min={1}
              required
              disabled={submitting}
            />
          </div>
          <div className="host-form-row">
            <NumberField
              name="length"
              label="Meetup @ (minutes)"
              className={Classes.FILL}
              min={30}
              required
              disabled={submitting}
            />
            <NumberField
              name="pvpEnabledAt"
              label="PVP Enabled (minutes)"
              className={Classes.FILL}
              min={0}
              required
              disabled={submitting}
            />
          </div>
        </fieldset>

        <fieldset>
          <legend>Scenarios + Teams</legend>
          <div className="host-form-row" onKeyPress={stopEnterSubmit}>
            <TagsField name="scenarios" label="Scenarios" required disabled={submitting}>
              <em>* Press Enter after each scenario to add it to the list</em>
            </TagsField>
          </div>
          <div className="host-form-row">
            <SelectField
              name="teams"
              className={Classes.FILL}
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
            <TextField name="ip" className={Classes.FILL} disabled={submitting} label="Server IP Address" required={false} />
            <TextField
              name="address"
              className={Classes.FILL}
              disabled={submitting}
              label="Server Address"
              required={false}
            />
          </div>
          <div className="host-form-row">
            <SelectField
              name="region"
              className={Classes.FILL}
              disabled={disabledAsync}
              label="Region"
              required
              options={Regions}
            />
            <TextField name="location" className={Classes.FILL} disabled={submitting} label="Location" required />
          </div>
          <div className="host-form-row">
            <NumberField
              name="slots"
              className={Classes.FILL}
              disabled={submitting}
              label="Available Slots"
              required
              min={2}
            />
            <div onKeyPress={stopEnterSubmit}>
              <TagsField name="tags" label="Tags" required={false} disabled={submitting}>
                <em>* Press Enter after each tag to add it to the list</em>
              </TagsField>
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

          <div style={{ paddingLeft: 10, paddingRight: 10 }}>
            <MatchRow match={preview} disableRemoval disableApproval disableLink />
          </div>
        </fieldset>

        <fieldset>
          <legend>Potential Conflicts</legend>
          <p>
            Here you can see all games in the region +- 15 minutes of the chosen time. Please review any conflicts to
            avoid your game being removed
          </p>
          <div style={{ paddingLeft: 10, paddingRight: 10 }}>
            <PotentialConflicts />
          </div>
        </fieldset>

        {!!error && (
          <Callout intent={Intent.DANGER}>
            <H5>{error}</H5>
          </Callout>
        )}

        <div className="host-form-actions">
          <Button
            type="submit"
            disabled={disabledAsync || !valid}
            icon="cloud-upload"
            loading={submitting}
            intent={valid ? Intent.SUCCESS : Intent.WARNING}
          >
            {submitting ? 'Creating...' : 'Create Match'}
          </Button>
        </div>
      </form>
    );
  }
}

export const CreateMatchForm: React.ComponentType<
  CreateMatchFormProps & ConfigProps<CreateMatchData, CreateMatchFormProps>
> = reduxForm<CreateMatchData, CreateMatchFormProps>({
  validate: validator.validate,
  asyncValidate: asyncValidation,
  asyncBlurFields: ['opens', 'region', 'tournament'],
})(CreateMatchFormComponent);
