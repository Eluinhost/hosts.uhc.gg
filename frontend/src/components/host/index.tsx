import { Button, Callout, Intent } from '@blueprintjs/core';
import { CloudUploadIcon } from '@blueprintjs/icons';
import { useAtom, useAtomValue } from 'jotai';
import { HTTPError } from 'ky';
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

import { permissionsAtom, usernameAtom } from '../../atoms/authentication';
import { hostFormDataAtom } from '../../atoms/hostFormData';
import { timezoneAtom } from '../../atoms/timezone';
import dayjs from '../../dayjs';
import { FormLabel } from '../../forms/FormLabel';
import { useAppForm, useFormSelector } from '../../forms/useAppForm';
import { MatchesData } from '../../matches/api';
import { MatchRow } from '../../matches/components/MatchRow';
import { PotentialConflicts } from '../../matches/components/PotentialConflicts';
import type { CreateMatchData } from '../../models/CreateMatchData';
import type { Match } from '../../models/Match';
import { Regions } from '../../models/Regions';
import { renderTeamStyle, TeamStyles } from '../../models/TeamStyles';
import { ModifierSelector } from '../../modifiers/components/ModifiersSelector';

import { defaultPreset } from './defaultPreset';
import { nextAvailableSlot } from './nextAvailableSlot';
import { applyScenarioRules } from './scenarioRules';
import { suite } from './schema';
import { renderToMarkdown, type TemplateContext } from './TemplateField';

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
  const username = useAtomValue(usernameAtom) ?? 'Unknown User';
  const roles = useAtomValue(permissionsAtom) ?? [];
  const timezone = useAtomValue(timezoneAtom);
  const [savedValues, setSavedValues] = useAtom(hostFormDataAtom);
  const navigate = useNavigate();
  const { mutateAsync: createMatch } = MatchesData.mutations.useCreateMatch();

  const [defaultValues] = useState<CreateMatchData>(() => ({
    ...savedValues,
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

      try {
        await createMatch(withRenderedTemplate);
      } catch (error) {
        if (error instanceof HTTPError && error.response.status === 400) {
          const message = typeof error.data === 'string' ? error.data : 'Invalid data';

          return state.createValidationError({ form: message, fields: {} });
        }

        throw error;
      }

      // if success send them to the matches page to view it
      void navigate('/matches');
    },
  });

  useFormSelector(form.atom, ({ values: { opens: _opens, ...others } }) => {
    setSavedValues(others);
  });

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

        <form.Subscribe selector={state => state.values.content}>
          {content =>
            content === defaultPreset && (
              <Callout intent={Intent.WARNING}>
                This is the default preset. You may want to customize it and save it in the Presets menu before
                submitting.
              </Callout>
            )
          }
        </form.Subscribe>
      </fieldset>

      <form.Subscribe
        selector={state => ({
          region: state.values.region,
          time: state.values.opens,
          version: state.values.version,
          isInvalid: state.errors.some(x =>
            ['region', 'opens', 'version'].some(path => {
              if ('path' in x) {
                return x.path?.[0] === path;
              }
              return false;
            }),
          ),
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
              <PotentialConflicts {...props} />
            </div>
          </fieldset>
        )}
      </form.Subscribe>

      <form.Subscribe selector={({ errors }) => ({ errors })}>
        {({ errors }) =>
          errors.map((error, index) => {
            // only showing form-level errors
            if ('path' in error) {
              return null;
            }

            return <Callout key={index} intent={Intent.DANGER} title={error.message} />;
          })
        }
      </form.Subscribe>

      <div className="host-form-actions">
        <form.Subscribe
          selector={({ isSubmitting, isValid, canSubmit }) => ({
            isSubmitting,
            isValid,
            canSubmit,
          })}
        >
          {({ isSubmitting, isValid, canSubmit }) => (
            <Button
              type="submit"
              disabled={!canSubmit}
              icon={<CloudUploadIcon />}
              loading={isSubmitting}
              intent={isValid ? Intent.SUCCESS : Intent.WARNING}
            >
              {isSubmitting ? 'Creating...' : 'Create Match'}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
};
