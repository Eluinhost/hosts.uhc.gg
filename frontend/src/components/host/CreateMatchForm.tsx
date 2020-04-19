import { ConfigProps, SubmissionError, InjectedFormProps, reduxForm } from 'redux-form';
import * as React from 'react';
import moment from 'moment-timezone';
import { Button, Callout, Classes, FormGroup, H5, Intent } from '@blueprintjs/core';
import { Dispatch } from 'redux';

import { DateTimeField } from '../fields/DateTimeField';
import { NumberField } from '../fields/NumberField';
import { TextField } from '../fields/TextField';
import { nextAvailableSlot } from './nextAvailableSlot';
import { TagsField } from '../fields/TagsField';
import { SelectField } from '../fields/SelectField';
import { TeamStyles } from '../../models/TeamStyles';
import { Regions } from '../../models/Regions';
import { TemplateField } from './TemplateField';
import { validator } from './validation';
import { HostingRules } from '../hosting-rules';
import { PotentialConflicts } from './PotentialConflicts';
import { SwitchField } from '../fields/SwitchField';
import { Title } from '../Title';
import { CreateMatchData } from '../../models/CreateMatchData';
import { sagaMiddleware } from '../../state/ApplicationState';
import { ModifierSelector } from '../../modifiers/components/ModifiersSelector';
import { MainVersionField } from '../../versions/components/MainVersionField';
import { checkForConflicts, createMatch } from './saga';
import { MatchRowPreview } from './MatchRowPreview';

export type CreateMatchFormProps = {
  readonly currentValues: CreateMatchData;
  readonly templateContext: any;
  readonly is12h: boolean;
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

  handleTemplateChange = (value: string): void => this.props.change('content', value);

  render() {
    const { handleSubmit, submitting, currentValues, templateContext, valid, error, asyncValidating } = this.props;

    const disabledAsync = submitting || asyncValidating !== false; // asyncvalidating is string | boolean

    const teamStyle = TeamStyles.find(it => it.value === currentValues.teams) || TeamStyles[0];

    return (
      <form className="host-form" onSubmit={handleSubmit}>
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
            changeTemplate={this.handleTemplateChange}
          />
        </fieldset>

        <fieldset>
          <legend>Game preview</legend>

          <div style={{ paddingLeft: 10, paddingRight: 10 }}>
            <MatchRowPreview />
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
  onSubmit: async (values): Promise<void> => {
    try {
      return await sagaMiddleware.run(createMatch, values).toPromise();
    } catch (err) {
      if (err instanceof SubmissionError) {
        throw err.errors; // redux-form doesn't like the SubmissionError instance and wants the errors object
      }

      throw err;
    }
  },
  asyncBlurFields: ['opens', 'region', 'tournament', 'mainVersion'],
})(CreateMatchFormComponent);
