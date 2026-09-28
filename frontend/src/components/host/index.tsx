import { Alert, Box, Button, Fieldset, Group, InputWrapper, Stack } from '@mantine/core';
import { CloudArrowUpIcon, WarningIcon } from '@phosphor-icons/react';
import { useAtom, useAtomValue } from 'jotai';
import { HTTPError } from 'ky';
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

import { permissionsAtom, usernameAtom } from '../../atoms/authentication';
import { hostFormDataAtom } from '../../atoms/hostFormData';
import { timezoneAtom } from '../../atoms/timezone';
import dayjs from '../../dayjs';
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
import styles from './index.module.css';
import { nextAvailableSlot } from './nextAvailableSlot';
import { applyScenarioRules } from './scenarioRules';
import { suite } from './schema';
import { renderToMarkdown, type TemplateContext } from './TemplateField';

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
      className={styles.hostForm}
    >
      <title>uhc.gg | Create Match</title>

      <Box className={styles.preview} p="xs" pt="lg">
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
      </Box>

      <Fieldset legend="Opening Time">
        <form.Field name="opens">
          {field => (
            <field.DateTimeField
              field={field}
              minDate={minDate}
              maxDate={maxDate}
              timePickerProps={{ minutesStep: 15 }}
            />
          )}
        </form.Field>
      </Fieldset>

      <Fieldset legend="Host Details">
        <form.Field name="hostingName">
          {field => <field.TextField label="Hosting Name (optional)" field={field} />}
        </form.Field>
        <form.Field name="count">
          {field => (
            <field.NumberField
              label="Game Number"
              required
              field={field}
              min={1}
              allowDecimal={false}
              allowNegative={false}
              selectAllOnFocus
            />
          )}
        </form.Field>
      </Fieldset>

      <Fieldset legend="Game Details">
        <Stack>
          <form.Field name="tournament">
            {field => (
              <field.SwitchField
                field={field}
                onLabel="Yes"
                offLabel="No"
                label="Tournament?"
                labelPosition="left"
                size="lg"
              />
            )}
          </form.Field>

          <form.Field name="scenarios">
            {field => (
              <field.TagsField
                field={field}
                label="Scenarios"
                description="Press Enter after each scenario to add it to the list"
              />
            )}
          </form.Field>

          <form.Field name="scenarios">
            {field => (
              <ModifierSelector
                onAdded={modifier => {
                  field.handleChange(prev => [...prev, modifier]);
                }}
                onRemoved={modifier => {
                  field.handleChange(prev => prev.filter(x => x !== modifier));
                }}
                selected={scenarios}
              />
            )}
          </form.Field>

          <Group align="flex-start">
            <form.Field name="teams">
              {field => (
                <field.SelectField
                  field={field}
                  label="Team Style"
                  required
                  data={TeamStyles.map(t => ({ label: t.display, value: t.value }))}
                  flex={1}
                />
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
                          <field.NumberField
                            field={field}
                            label="Team size (0 for 'ToX')"
                            required
                            min={0}
                            max={32767}
                            flex={1}
                            allowDecimal={false}
                          />
                        )}
                      </form.Field>
                    )}
                    {teamStyle?.value === 'custom' && (
                      <form.Field name="customStyle">
                        {field => <field.TextField field={field} label="Custom Team Style" required flex={1} />}
                      </form.Field>
                    )}
                  </>
                );
              }}
            </form.Subscribe>
          </Group>

          <Group align="flex-start">
            <form.Field name="mapSize">
              {field => (
                <field.NumberField
                  allowDecimal={false}
                  field={field}
                  flex={1}
                  label="Map size (diameter)"
                  required
                  min={1}
                />
              )}
            </form.Field>
            <form.Field name="length">
              {field => (
                <field.NumberField
                  allowDecimal={false}
                  field={field}
                  flex={1}
                  label="Meetup @ (minutes)"
                  required
                  min={30}
                />
              )}
            </form.Field>
            <form.Field name="pvpEnabledAt">
              {field => (
                <field.NumberField
                  allowDecimal={false}
                  flex={1}
                  field={field}
                  label="PVP Enabled (minutes)"
                  required
                  min={0}
                />
              )}
            </form.Field>
          </Group>
        </Stack>
      </Fieldset>

      <Fieldset legend="Server Details">
        <Stack>
          <form.Field name="region">
            {field => (
              <InputWrapper required error={field.errors[0]?.message}>
                <field.SegmentedField
                  fullWidth
                  color="primary"
                  field={field}
                  data={Regions.map(x => ({ label: x.display, value: x.value }))}
                />
              </InputWrapper>
            )}
          </form.Field>

          <form.Field name="location">
            {field => <field.TextField field={field} label="Location" required />}
          </form.Field>

          <Group align="flex-start">
            <form.Field name="ip">
              {field => <field.TextField flex={1} field={field} label="Server IP Address" />}
            </form.Field>
            <form.Field name="address">
              {field => <field.TextField flex={1} field={field} label="Server Address" />}
            </form.Field>
          </Group>

          <form.Field name="tags">
            {field => (
              <field.TagsField
                field={field}
                label="Tags"
                description="Press Enter after each tag to add it to the list"
              />
            )}
          </form.Field>

          <form.Field name="slots">
            {field => <field.NumberField field={field} min={2} label="Available Slots" required />}
          </form.Field>

          <form.Field name="version">
            {field => (
              <InputWrapper label="Version" required>
                <field.VersionField field={field} />
              </InputWrapper>
            )}
          </form.Field>
        </Stack>
      </Fieldset>

      <Fieldset legend="Content Preview">
        <form.Field name="content">
          {field => <field.TemplateField field={field} context={templateContext} />}
        </form.Field>

        <form.Subscribe selector={state => state.values.content}>
          {content =>
            content === defaultPreset && (
              <Alert
                color="yellow"
                icon={<WarningIcon />}
                title="This is the default preset. You may want to customize it and save it in the Presets menu before
                submitting."
              />
            )
          }
        </form.Subscribe>
      </Fieldset>

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
          <Fieldset legend="Potential Conflicts">
            <p>
              Here you can see all games in the region +- 15 minutes of the chosen time in your chosen region (
              {props.region}) and version ({props.version}). Please review any conflicts to avoid your game being
              removed
            </p>
            <PotentialConflicts {...props} />
          </Fieldset>
        )}
      </form.Subscribe>

      <form.Subscribe selector={({ errors }) => ({ errors })}>
        {({ errors }) =>
          errors.map((error, index) => {
            // only showing form-level errors
            if ('path' in error) {
              return null;
            }

            return <Alert color="red" key={index} icon={<WarningIcon />} title={error.message} />;
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
              leftSection={<CloudArrowUpIcon />}
              loading={isSubmitting}
              color={isValid ? 'green' : 'yellow'}
            >
              {isSubmitting ? 'Creating...' : 'Create Match'}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
};
