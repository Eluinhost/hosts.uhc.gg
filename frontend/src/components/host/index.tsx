import { Button, Intent, NonIdealState } from '@blueprintjs/core';
import { CloudUploadIcon, ErrorIcon } from '@blueprintjs/icons';
import React, { useEffect, useMemo, useState } from 'react';
import { useSelector, useStore } from 'react-redux';
import { useNavigate } from 'react-router';

import { SetSavedHostFormData } from '../../actions';
import { MatchesApi } from '../../api';
import dayjs from '../../dayjs';
import { FormLabel } from '../../forms/FormLabel';
import { useAppForm, useFormSelector } from '../../forms/useAppForm';
import type { CreateMatchData } from '../../models/CreateMatchData';
import type { Match } from '../../models/Match';
import { Regions } from '../../models/Regions';
import { renderTeamStyle, TeamStyles } from '../../models/TeamStyles';
import { ModifierSelector } from '../../modifiers/components/ModifiersSelector';
import { getUsername, getPermissions, getTimezone, getAccessToken } from '../../state/Selectors';
import { MatchRow } from '../match-row';

import { nextAvailableSlot } from './nextAvailableSlot';
import { PotentialConflicts } from './PotentialConflicts';
import { applyScenarioRules } from './scenarioRules';
import { suite } from './schema';
import { renderToMarkdown, type TemplateContext } from './TemplateField';
import { usePersistence } from './usePersistence';

import './index.sass';

const createTemplateContext = (values: CreateMatchData, author: string): TemplateContext => {
  const style = TeamStyles.find(x => x.value === values.teams);

  return {
    ...values,
    // overwite teams value with rendered version
    teams: !style ? '' : renderTeamStyle(style, values.size, values.customStyle),
    author,
  };
};

export const HostingPage: React.FC = () => {
  const username = useSelector(getUsername) ?? 'Unknown User';
  const roles = useSelector(getPermissions);
  const accessToken = useSelector(getAccessToken);
  const timezone = useSelector(getTimezone);
  const store = useStore();
  const navigate = useNavigate();

  const [defaultValues] = useState<CreateMatchData>(() => ({
    ...store.getState().hostFormSavedData,
    opens: nextAvailableSlot().tz(timezone),
  }));

  const form = useAppForm({
    defaultValues,
    validators: [
      {
        run: suite,
        triggers: ['change'],
      },
    ],
    onSubmit: async state => {
      const withRenderedTemplate = {
        ...state.value,
        // we convert the template to Markdown only, we don't want to send HTML
        content: renderToMarkdown(state.value.content, createTemplateContext(state.value, username)),
      };

      // TODO throws 400 if conflicts, surface error properly\
      // TODO include conflicts in validation logic instead
      // notes - create match endpoint does same logic as potential conflicts, but does extra tournament
      // + overhost checking, so just make the actual call and log the error response body on the form
      // to match the previous logic

      await MatchesApi.create(withRenderedTemplate, accessToken ?? 'NO ACCESS TOKEN IN STORE');

      // if success send them to the matches page to view it
      void navigate('/matches');
    },
  });

  usePersistence(form.atom, SetSavedHostFormData.start);

  // updates visible TZ of opening time when global tz changes
  useEffect(() => {
    form.setFieldValue(
      'opens',
      prev => {
        // @ts-expect-error $x and $timezone are hidden from TS, no equivalent available
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (prev['$x']['$timezone'] !== timezone) {
          return prev.tz(timezone);
        }

        return prev;
      },
      // doesn't change anything fundamental about the value of the field, just the TZ
      { markAsDirty: false, markAsTouched: false, markAsBlurred: false },
    );
  }, [form, timezone]);

  // ensures vanilla+ scenario handling
  const scenarios = useFormSelector(form.atom, state => state.values.scenarios);
  useEffect(() => {
    const newScenarios = applyScenarioRules(scenarios);

    if (newScenarios !== scenarios) {
      form.setFieldValue('scenarios', newScenarios);
    }
  }, [form, scenarios]);

  // preview Markdown modifications
  const templateContext = useFormSelector(form.atom, state => createTemplateContext(state.values, username));

  const minDate = useMemo(() => defaultValues.opens.utc().hour(0), [defaultValues.opens]);
  const maxDate = useMemo(() => defaultValues.opens.utc().add(30, 'days').hour(23), [defaultValues.opens]);

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        e.stopPropagation();
        void form.handleSubmit();
      }}
      className="host-form"
    >
      <title>uhc.gg | Create Match</title>
      <fieldset className="host-form-preview">
        <legend>Game preview</legend>

        <div style={{ paddingLeft: 10, paddingRight: 10 }}>
          <form.Subscribe selector={state => state.values}>
            {state => {
              const preview: Match = {
                ...state,
                id: 0,
                author: username,
                removed: false,
                removedAt: null,
                removedBy: null,
                removedReason: null,
                approvedBy: null,
                created: dayjs.utc(),
                version: state.version,
                roles,
              };

              return <MatchRow match={preview} disableRemoval disableApproval disableLink />;
            }}
          </form.Subscribe>
        </div>
      </fieldset>

      <form.Field name="opens">
        {field => <field.DateTimeField field={field} minDate={minDate} maxDate={maxDate} />}
      </form.Field>

      <fieldset>
        <legend>Host Details</legend>

        <div className="host-form-row">
          <form.Field name="hostingName">
            {field => (
              <FormLabel field={field} label="Hosting Name">
                <field.TextField field={field} />
              </FormLabel>
            )}
          </form.Field>
          <form.Field name="count">
            {field => (
              <FormLabel field={field} label="Game Number" showRequiredStar>
                <field.NumberField field={field} min={1} />
              </FormLabel>
            )}
          </form.Field>
        </div>
      </fieldset>

      <fieldset>
        <legend>Game Details</legend>
        <div className="host-form-row host-form-row--tournament">
          <form.Field name="tournament">
            {field => <field.SwitchField field={field} label="Is this a Tournament?" size="large" />}
          </form.Field>
        </div>

        <div className="host-form-row">
          <form.Field name="scenarios">
            {field => (
              <FormLabel
                field={field}
                label="Scenarios"
                showRequiredStar
                subLabel="Press Enter after each scenario to add it to the list"
              >
                <field.TagsField field={field} />
              </FormLabel>
            )}
          </form.Field>
        </div>

        <div className="host-form-row host-form-row--modifiers">
          <form.Field name="scenarios">
            {field => (
              <FormLabel
                field={field}
                label="Here are the scenarios that will not cause conflicts with surrounding matches:"
                hideOptionalityLabel
              >
                <ModifierSelector
                  onAdded={modifier => {
                    field.handleChange(prev => [...prev, modifier]);
                  }}
                  onRemoved={modifier => {
                    field.handleChange(prev => prev.filter(x => x !== modifier));
                  }}
                  selected={scenarios}
                />
              </FormLabel>
            )}
          </form.Field>
        </div>

        <div className="host-form-row">
          <form.Field name="teams">
            {field => (
              <FormLabel field={field} label="Team Style" showRequiredStar>
                <field.SelectField
                  field={field}
                  options={TeamStyles.map(t => ({ label: t.display, value: t.value }))}
                />
              </FormLabel>
            )}
          </form.Field>
          <form.Subscribe selector={state => state.values.teams}>
            {teams => {
              const teamStyle = TeamStyles.find(x => x.value === teams);

              return (
                <>
                  {teamStyle?.requiresTeamSize && (
                    <form.Field name="size">
                      {field => (
                        <FormLabel field={field} label="Team size (0 for 'ToX')" showRequiredStar>
                          <field.NumberField field={field} min={0} max={32767} />
                        </FormLabel>
                      )}
                    </form.Field>
                  )}
                  {teamStyle?.value === 'custom' && (
                    <form.Field name="customStyle">
                      {field => (
                        <FormLabel field={field} label="Custom Team Style" showRequiredStar>
                          <field.TextField field={field} />
                        </FormLabel>
                      )}
                    </form.Field>
                  )}
                </>
              );
            }}
          </form.Subscribe>
        </div>

        <div className="host-form-row">
          <form.Field name="mapSize">
            {field => (
              <FormLabel field={field} label="Map size (diameter)" showRequiredStar>
                <field.NumberField field={field} min={1} />
              </FormLabel>
            )}
          </form.Field>
          <form.Field name="length">
            {field => (
              <FormLabel field={field} label="Meetup @ (minutes)" showRequiredStar>
                <field.NumberField field={field} min={30} />
              </FormLabel>
            )}
          </form.Field>
          <form.Field name="pvpEnabledAt">
            {field => (
              <FormLabel field={field} label="PVP Enabled (minutes)" showRequiredStar>
                <field.NumberField field={field} min={0} />
              </FormLabel>
            )}
          </form.Field>
        </div>
      </fieldset>

      <fieldset>
        <legend>Server Details</legend>

        <div className="host-form-row">
          <form.Field name="region">
            {field => (
              <FormLabel field={field} label="Region" showRequiredStar>
                <field.SegmentedField
                  field={field}
                  options={Regions.map(x => ({ label: x.display, value: x.value }))}
                />
              </FormLabel>
            )}
          </form.Field>
        </div>

        <div className="host-form-row">
          <form.Field name="location">
            {field => (
              <FormLabel field={field} label="Location" showRequiredStar>
                <field.TextField field={field} />
              </FormLabel>
            )}
          </form.Field>
        </div>

        <div className="host-form-row">
          <form.Field name="ip">
            {field => (
              <FormLabel field={field} label="Server IP Address">
                <field.TextField field={field} />
              </FormLabel>
            )}
          </form.Field>
          <form.Field name="address">
            {field => (
              <FormLabel field={field} label="Server Address">
                <field.TextField field={field} />
              </FormLabel>
            )}
          </form.Field>
        </div>

        <div className="host-form-row">
          <form.Field name="tags">
            {field => (
              <FormLabel field={field} label="Tags" subLabel="Press Enter after each tag to add it to the list">
                <field.TagsField field={field} />
              </FormLabel>
            )}
          </form.Field>
        </div>

        <div className="host-form-row">
          <form.Field name="slots">
            {field => (
              <FormLabel field={field} label="Available Slots" showRequiredStar>
                <field.NumberField field={field} min={2} />
              </FormLabel>
            )}
          </form.Field>
        </div>

        <div className="host-form-row">
          <form.Field name="version">
            {field => (
              <FormLabel field={field} label="Version" showRequiredStar>
                <field.VersionField field={field} />
              </FormLabel>
            )}
          </form.Field>
        </div>
      </fieldset>

      <fieldset>
        <legend>Content Preview</legend>

        <form.Field name="content">
          {field => <field.TemplateField field={field} context={templateContext} />}
        </form.Field>
      </fieldset>

      <form.Subscribe
        selector={state => ({
          region: state.values.region,
          time: state.values.opens,
          version: state.values.version,
          isInvalid: state.errors.some(x => ['region', 'opens', 'version'].some(path => x.path?.[0] === path)),
        })}
      >
        {props => (
          <fieldset>
            <legend>Potential Conflicts</legend>
            <p>
              Here you can see all games in the region +- 15 minutes of the chosen time in your chosen region (
              {props.region}) and version ({props.version}). Please review any conflicts to avoid your game being
              removed
            </p>
            <div style={{ paddingLeft: 10, paddingRight: 10 }}>
              {props.isInvalid ? (
                <NonIdealState
                  icon={<ErrorIcon />}
                  title="Cannot search for conflicts until opens/region/version fields are valid"
                />
              ) : (
                <PotentialConflicts {...props} />
              )}
            </div>
          </fieldset>
        )}
      </form.Subscribe>

      <div className="host-form-actions">
        <Button
          type="submit"
          disabled={!form.state.canSubmit}
          icon={<CloudUploadIcon />}
          loading={form.state.isSubmitting}
          intent={form.state.isValid ? Intent.SUCCESS : Intent.WARNING}
        >
          {form.state.isSubmitting ? 'Creating...' : 'Create Match'}
        </Button>
      </div>
    </form>
  );
};
