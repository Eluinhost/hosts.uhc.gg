import { Button, Callout, Classes, FormGroup, H5, Intent } from '@blueprintjs/core';
import { CloudUploadIcon, WarningSignIcon } from '@blueprintjs/icons';
import moment from 'moment-timezone';
import { find } from 'ramda';
import React, { useCallback, useEffect } from 'react';
import { SubmissionError, type InjectedFormProps, reduxForm } from 'redux-form';
import type { SagaIterator } from 'redux-saga';
import { all, put, race, take } from 'redux-saga/effects';

import { HostFormConflicts } from '../../actions';
import type { CreateMatchData } from '../../models/CreateMatchData';
import type { Match } from '../../models/Match';
import { Regions } from '../../models/Regions';
import { TeamStyles } from '../../models/TeamStyles';
import { ModifierSelector } from '../../modifiers/components/ModifiersSelector';
import { sagaMiddleware } from '../../state/ApplicationState';
import { MainVersionField } from '../../versions/components/MainVersionField';
import { DateTimeField } from '../fields/DateTimeField';
import { NumberField } from '../fields/NumberField';
import { SelectField } from '../fields/SelectField';
import { SwitchField } from '../fields/SwitchField';
import { TagsField } from '../fields/TagsField';
import { TextField } from '../fields/TextField';
import { HostingRules } from '../hosting-rules';
import { MatchRow } from '../match-row';
import { Title } from '../Title';

import { nextAvailableSlot } from './nextAvailableSlot';
import { PotentialConflicts } from './PotentialConflicts';
import { type TemplateContext, TemplateField } from './TemplateField';
import { validator } from './validation';

export type CreateMatchFormProps = {
  readonly currentValues: CreateMatchData;
  readonly templateContext: TemplateContext;
  readonly username: string;
  readonly is12h: boolean;
  readonly changeTemplate: (newTemplate: string) => void;
  readonly createMatch: (data: CreateMatchData) => Promise<void>;
  readonly roles: Array<string>;
};

const stopEnterSubmit: React.KeyboardEventHandler = (e: React.KeyboardEvent): void => {
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
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
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

const CreateMatchFormComponent: React.FunctionComponent<
  InjectedFormProps<CreateMatchData, CreateMatchFormProps> & CreateMatchFormProps
> = props => {
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
    roles,
    // both coming from reduxForm, no way to change types and considered safe access
    // eslint-disable-next-line @typescript-eslint/unbound-method
    change,
    // eslint-disable-next-line @typescript-eslint/unbound-method
    asyncValidate,
    is12h,
  } = props;

  useEffect(() => {
    asyncValidate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onVanillaPlusChange = useCallback(() => {
    change('scenarios', ['Vanilla+']);
  }, [change]);

  const onModifierAdded = useCallback(
    (modifier: string) => {
      change('scenarios', [...currentValues.scenarios, modifier]);
    },
    [change, currentValues],
  );

  const onModifierRemoved = useCallback(
    (modifier: string) => {
      change(
        'scenarios',
        currentValues.scenarios.filter(x => x !== modifier),
      );
    },
    [change, currentValues],
  );

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
    roles,
  };

  return (
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    <form className="host-form" onSubmit={handleSubmit(createMatch)}>
      <Title>Create a match</Title>
      <HostingRules />

      <fieldset className="opening-time">
        <legend>Opening Time</legend>
        <DateTimeField
          name="opens"
          required
          disabled={disabledAsync}
          minDate={nextAvailableSlot().set('hours', 0)} // midnight so the boundary day is still selectable
          maxDate={moment.utc().add(30, 'd').set('hours', 23)}
          timePicker={{
            minuteStep: 15,
            use12Hours: is12h,
          }}
        />
        <Callout intent={Intent.WARNING} icon={<WarningSignIcon />}>
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
        <div className="host-form-row" onKeyDown={stopEnterSubmit}>
          <TagsField name="scenarios" label="Scenarios" required disabled={submitting}>
            <div>
              <em>* Press Enter after each scenario to add it to the list</em>
            </div>
            {currentValues.scenarios.length === 0 && (
              <div>
                If no scenarios please use <Button onClick={onVanillaPlusChange}>Vanilla+</Button> instead
              </div>
            )}
          </TagsField>
        </div>
        <div className="host-form-row host-form-row--modifiers">
          <FormGroup label="Here are the scenarios that will not cause conflicts with surrounding matches:">
            <ModifierSelector
              onAdded={onModifierAdded}
              onRemoved={onModifierRemoved}
              selected={currentValues.scenarios}
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
          <div onKeyDown={stopEnterSubmit}>
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
          icon={<CloudUploadIcon />}
          loading={submitting}
          intent={valid ? Intent.SUCCESS : Intent.WARNING}
        >
          {submitting ? 'Creating...' : 'Create Match'}
        </Button>
      </div>
    </form>
  );
};

export const CreateMatchForm = reduxForm<CreateMatchData, CreateMatchFormProps>({
  validate: validator.validate,
  asyncValidate: async (values, _dispatch, props): Promise<void> => {
    try {
      // a quick check for when we don't have any initial values then fallback to the ones provided in
      // props, kinda weird and janky but gets around the componentDidMount asyncvalidate race condition
      // we should be relying on `values` as it is the most up to date over props
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      const haveValues = Object.keys(values || {}).length > 0;

      await sagaMiddleware.run(checkForConflicts, haveValues ? values : props.currentValues).toPromise();
      return;
    } catch (err) {
      if (err instanceof SubmissionError) {
        // eslint-disable-next-line @typescript-eslint/only-throw-error
        throw err.errors; // redux-form doesn't like the SubmissionError instance and wants the errors object
      }

      throw err;
    }
  },
  asyncBlurFields: ['opens', 'region', 'tournament', 'mainVersion'],
})(CreateMatchFormComponent);
