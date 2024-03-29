import { ConfigProps, SubmissionError, InjectedFormProps, reduxForm } from 'redux-form';
import * as React from 'react';
import moment from 'moment-timezone';
import { Button, Callout, Classes, FormGroup, H5, Intent } from '@blueprintjs/core';
import { Dispatch } from 'redux';
import { SagaIterator } from 'redux-saga';
import { all, put, race, take } from 'redux-saga/effects';
import { find } from 'ramda';

import { DateTimeField } from '../fields/DateTimeField';
import { NumberField } from '../fields/NumberField';
import { TextField } from '../fields/TextField';
import { nextAvailableSlot } from './nextAvailableSlot';
import { TagsField } from '../fields/TagsField';
import { SelectField } from '../fields/SelectField';
import { TeamStyles } from '../../models/TeamStyles';
import { Regions } from '../../models/Regions';
import { TemplateField } from './TemplateField';
import { MatchRow } from '../match-row';
import { Match } from '../../models/Match';
import { validator } from './validation';
import { HostingRules } from '../hosting-rules';
import { PotentialConflicts } from './PotentialConflicts';
import { SwitchField } from '../fields/SwitchField';
import { Title } from '../Title';
import { CreateMatchData } from '../../models/CreateMatchData';
import { HostFormConflicts } from '../../actions';
import { sagaMiddleware } from '../../state/ApplicationState';
import { ModifierSelector } from '../../modifiers/components/ModifiersSelector';
import { MainVersionField } from '../../versions/components/MainVersionField';

export type CreateMatchFormProps = {
  readonly currentValues: CreateMatchData;
  readonly templateContext: any;
  readonly username: string;
  readonly is12h: boolean;
  readonly changeTemplate: (newTemplate: string) => void;
  readonly createMatch: (data: CreateMatchData) => Promise<void>;
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

function* checkForConflicts(values: CreateMatchData): SagaIterator<void> {
  const {
    result: { success, failure },
  } = yield all({
    start: put(HostFormConflicts.start({ data: values })),
    result: race({
      success: take(HostFormConflicts.success),
      failure: take(HostFormConflicts.failure),
    }),
  });

  if (failure) {
    throw new SubmissionError<CreateMatchData>({
      opens: 'Failed to lookup conflicts',
      region: 'Failed to lookup conflicts',
      tournament: 'Failed to lookup conflicts',
      mainVersion: 'Failed to lookup conflicts',
    });
  }

  const payload: NonNullable<ReturnType<typeof HostFormConflicts.success>['payload']> = success.payload;

  let confirmedConflicts = payload.result.filter(conflict => conflict.opens.isSame(payload.parameters.data.opens));

  // If the game being hosted is not a tournament it is allowed to overhost tournaments
  if (!payload.parameters.data.tournament) {
    confirmedConflicts = confirmedConflicts.filter(conflict => !conflict.tournament);
  }

  if (confirmedConflicts.length) {
    // conflict should be whatever isn't a tournament, if they're all tournaments just return whatever is first
    const conflict = find<Match>(m => !m.tournament, confirmedConflicts) || confirmedConflicts[0];

    // tslint:disable-next-line:max-line-length
    const message = `Conflicts with /u/${conflict.author}'s #${conflict.count} (${
      conflict.region
    } - ${conflict.opens.format('HH:mm z')})`;

    throw new SubmissionError<CreateMatchData>({
      opens: message,
      region: message,
    });
  }
}

class CreateMatchFormComponent extends React.PureComponent<
  InjectedFormProps<CreateMatchData, CreateMatchFormProps> & CreateMatchFormProps
> {
  componentDidMount(): void {
    this.props.asyncValidate();
  }

  useVanillaPlus = () => {
    this.props.change('scenarios', ['Vanilla+']);
  };

  onModifierAdded = (modifier: string) => {
    this.props.change('scenarios', [...this.props.currentValues.scenarios, modifier]);
  };

  onModifierRemoved = (modifier: string) => {
    this.props.change(
      'scenarios',
      this.props.currentValues.scenarios.filter(x => x !== modifier),
    );
  };

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
      removedAt: null,
      removedBy: null,
      removedReason: null,
      approvedBy: null,
      created: moment.utc(),
      version: currentValues.version || currentValues.mainVersion,
    };

    return (
      <form className="host-form" onSubmit={handleSubmit(createMatch)}>
        <Title>Create a match</Title>
        <HostingRules />

        <fieldset className="opening-time">
          <legend>Opening Time</legend>
          <DateTimeField
            name="opens"
            required
            disabled={disabledAsync}
            minDate={nextAvailableSlot().set('hours', 0)} // required so react-dates minDate works (it looks at midday)
            maxDate={moment.utc().add(30, 'd').set('hours', 23)}
            datePickerProps={{
              numberOfMonths: 2,
            }}
            timePicker={{
              minuteStep: 15,
              use12Hours: this.props.is12h,
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
            <NumberField
              name="count"
              label="Game Number"
              className={Classes.FILL}
              min={1}
              required
              disabled={submitting}
            />
          </div>
          <div className="host-form-row">
            <MainVersionField
              className={Classes.FILL}
              label="Main Version"
              required
              name="mainVersion"
              disabled={submitting}
            />
            <TextField
              name="version"
              label="Version Range"
              className={Classes.FILL}
              disabled={submitting}
              required={false}
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
              <div>
                <em>* Press Enter after each scenario to add it to the list</em>
              </div>
              {currentValues.scenarios.length === 0 && (
                <div>
                  If no scenarios please use <Button onClick={this.useVanillaPlus}>Vanilla+</Button> instead
                </div>
              )}
            </TagsField>
          </div>
          <div className="host-form-row host-form-row--modifiers">
            <FormGroup label="Here are the scenarios that will not cause conflicts with surrounding matches:">
              <ModifierSelector
                onAdded={this.onModifierAdded}
                onRemoved={this.onModifierRemoved}
                selected={this.props.currentValues.scenarios}
              />
            </FormGroup>
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
            <TextField
              name="ip"
              className={Classes.FILL}
              disabled={submitting}
              label="Server IP Address"
              required={false}
            />
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
  asyncValidate: async (
    values: CreateMatchData,
    dispatch: Dispatch<any>,
    props: CreateMatchFormProps & InjectedFormProps<CreateMatchData, CreateMatchFormProps>,
  ): Promise<void> => {
    try {
      // a quick check for when we don't have any initial values then fallback to the ones provided in
      // props, kinda weird and janky but gets around the componentDidMount asyncvalidate race condition
      // we should be relying on `values` as it is the most up to date over props
      const haveValues = Object.keys(values || {}).length > 0;

      return await sagaMiddleware.run(checkForConflicts, haveValues ? values : props.currentValues).toPromise();
    } catch (err) {
      if (err instanceof SubmissionError) {
        throw err.errors; // redux-form doesn't like the SubmissionError instance and wants the errors object
      }

      throw err;
    }
  },
  asyncBlurFields: ['opens', 'region', 'tournament', 'mainVersion'],
})(CreateMatchFormComponent);
