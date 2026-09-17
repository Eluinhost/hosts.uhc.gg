import { Button, Callout, Classes, H5, HTMLTable, Intent, Tab, Tabs, TextArea } from '@blueprintjs/core';
import { FloppyDiskIcon, TrashIcon } from '@blueprintjs/icons';
import * as Mark from 'markup-js';
import React, { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { type BaseFieldProps, Field, type WrappedFieldProps } from 'redux-form';

import { Presets } from '../../actions';
import type { Dayjs } from '../../dayjs';
import type { CreateMatchData } from '../../models/CreateMatchData';
import { getLocalPresets } from '../../state/Selectors';
import { FieldWrapper, RenderErrors, RenderLabel } from '../fields/FieldWrapper';
import { Markdown } from '../Markdown';

import { type Preset, presets } from './presets';

export type TemplateContext = CreateMatchData & { teamStyle: string; author: string };

export type TemplateFieldProps = BaseFieldProps & {
  readonly label?: React.ReactElement | string;
  readonly required: boolean;
  readonly disabled?: boolean;
  readonly className?: string;
  readonly context: TemplateContext;
  readonly changeTemplate: (value: string) => void;
};

export const renderToMarkdown = (template: string, context: TemplateContext): string =>
  Mark.up(template, context, {
    pipes: {
      moment: (date: Dayjs, format: string): string => date.utc().format(format),
    },
  });

const TemplateTab: React.FunctionComponent<WrappedFieldProps & TemplateFieldProps> = ({ input, disabled }) => (
  <TextArea {...input} disabled={disabled} fill rows={15} />
);

const PreviewTab: React.FunctionComponent<WrappedFieldProps & TemplateFieldProps> = ({ input, context }) => (
  <Markdown markdown={renderToMarkdown(typeof input.value === 'string' ? input.value : String(input.value), context)} />
);

const samples = [
  ['{{author}}', 'The creator of the post (you!)'],
  ['{{hostingName}}', 'Any hosting name override'],
  ['{{tournament}}', 'Is a tournament?'],
  ['{{opens}}', 'When the match opens, default formatting'],
  ['{{opens|moment>MMM Do HH:mm z}}', 'Use `|moment>FORMAT` to specify a custom format'],
  ['{{address}}', 'The address of the server'],
  ['{{ip}}', 'The direct IP of the server'],
  ['{{address|blank>`ip`}}', 'Use the address, if it is blank use the IP instead'],
  ['{{scenarios|join>, }}', 'List of scenarios, comma separated'],
  ['{{tags|join>, }}', 'List of tags, comma separated'],
  ['{{teams}}', 'Full rendered team style'],
  ['{{teamStyle}}', 'The raw team style'],
  ['{{size}}', 'The size of the teams'],
  ['{{customStyle}}', 'Any custom defined style'],
  ['{{count}}', 'Game counter'],
  ['{{region}}', 'The region the server is in'],
  ['{{location}}', 'The location of the server'],
  ['{{version}}', 'The version of the server'],
  ['{{slots}}', 'How many slots the server has'],
  ['{{length}}', 'The length of the game'],
  ['{{mapSize}}', 'Map dimensions'],
  ['{{pvpEnabledAt}}', 'When PVP turns on'],
];

const renderSamples = (context: TemplateContext): React.ReactElement[] =>
  samples.map((sample, index) => (
    <tr key={index}>
      <td className={Classes.MONOSPACE_TEXT}>{sample[0]}</td>
      <td>{sample[1]}</td>
      <td>{Mark.up(sample[0], context)}</td>
    </tr>
  ));

const HelpTab: React.FunctionComponent<WrappedFieldProps & TemplateFieldProps> = ({ context }) => (
  <Callout intent={Intent.PRIMARY}>
    <H5>Template information</H5>
    <div>
      <span>Templates can use </span>
      <a href="https://www.reddit.com/wiki/commenting" target="_blank" rel="noopener noreferrer">
        Reddit Formatting
      </a>
      <span> as well as </span>
      <a href="https://github.com/adammark/Markup.js/blob/master/README.md" target="_blank" rel="noopener noreferrer">
        Markup Templating
      </a>
      <span> for generating content. Here are some template examples:</span>
    </div>
    <HTMLTable bordered striped>
      <thead>
        <tr>
          <th>Example</th>
          <th>Description</th>
          <th>Output</th>
        </tr>
      </thead>
      <tbody>{renderSamples(context)}</tbody>
    </HTMLTable>
  </Callout>
);

const PresetButton: React.FunctionComponent<{ readonly onClick: () => void; readonly id: string }> = ({
  onClick,
  id,
}) => (
  <Button onClick={onClick} intent={Intent.PRIMARY} size="large">
    {id}
  </Button>
);

const PresetsTab: React.FunctionComponent<{
  readonly onPresetClick: (p: Preset) => () => void;
  readonly onSaveCurrentAsPreset: () => void;
  readonly onDeleteLocalPreset: (presetName: string) => void;
  readonly localPresets: Preset[];
}> = ({ onPresetClick, onSaveCurrentAsPreset, onDeleteLocalPreset, localPresets }) => (
  <Callout intent={Intent.PRIMARY}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
      <H5 style={{ margin: 0 }}>Built-in presets</H5>
      <Button variant="minimal" icon={<FloppyDiskIcon />} onClick={onSaveCurrentAsPreset}>
        Save current template as preset
      </Button>
    </div>

    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
      {presets.map(p => (
        <PresetButton key={p.name} onClick={onPresetClick(p)} id={p.name} />
      ))}
    </div>

    <H5 style={{ marginBottom: 8 }}>Your saved presets</H5>
    {localPresets.length === 0 ? (
      <div>No saved presets yet.</div>
    ) : (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {localPresets.map(preset => (
          <div key={preset.name} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <PresetButton onClick={onPresetClick(preset)} id={preset.name} />
            <Button
              variant="minimal"
              icon={<TrashIcon />}
              intent={Intent.DANGER}
              onClick={() => {
                onDeleteLocalPreset(preset.name);
              }}
            >
              Remove
            </Button>
          </div>
        ))}
      </div>
    )}
  </Callout>
);

const TemplateFieldComponent: React.FunctionComponent<WrappedFieldProps & TemplateFieldProps> = props => {
  const { meta, required, className, label, changeTemplate, input } = props;
  const localPresets = useSelector(getLocalPresets);
  const dispatch = useDispatch();

  const [currentTabId, setCurrentTabId] = useState<string | number>('host-form-template-tab-template');

  const onTabChange = (newTabId: string | number): void => {
    setCurrentTabId(newTabId);
  };

  const onPresetClick = useCallback(
    (p: Preset) => () => {
      changeTemplate(p.template);
      setCurrentTabId('host-form-template-tab-template');
    },
    [changeTemplate],
  );

  const onSaveCurrentAsPreset = useCallback((): void => {
    if (typeof window === 'undefined') return;

    const name = window.prompt('Preset name');
    const trimmedName = (name || '').trim();

    if (!trimmedName) return;

    const alreadyExists = localPresets.some(existing => existing.name.toLowerCase() === trimmedName.toLowerCase());

    if (alreadyExists && !window.confirm(`Preset "${trimmedName}" already exists. Overwrite it?`)) return;

    const preset = {
      name: trimmedName,
      template: input.value as string,
    };

    const nextLocalPresets = [
      ...localPresets.filter(p => p.name.toLowerCase() !== trimmedName.toLowerCase()),
      preset,
    ].sort((a, b) => a.name.localeCompare(b.name));

    dispatch(Presets.save(nextLocalPresets));
  }, [dispatch, input.value, localPresets]);

  const onDeleteLocalPreset = useCallback(
    (presetName: string): void => {
      if (typeof window === 'undefined') return;

      if (!window.confirm(`Remove preset "${presetName}"?`)) return;

      const nextLocalPresets = localPresets.filter(preset => preset.name.toLowerCase() !== presetName.toLowerCase());

      dispatch(Presets.save(nextLocalPresets));
    },
    [dispatch, localPresets],
  );

  return (
    <FieldWrapper meta={meta} required={required} hideErrors>
      <div className={`markdown-field-wrapper ${className || ''}`}>
        {!!label && <RenderLabel label={label} required={required} />}
        <Tabs id="host-form-template-tabs" onChange={onTabChange} selectedTabId={currentTabId}>
          <Tab id="host-form-template-tab-template" title="Template" panel={<TemplateTab {...props} />} />
          <Tab id="host-form-template-tab-preview" title="Preview" panel={<PreviewTab {...props} />} />
          <Tab id="host-form-template-tab-help" title="Help" panel={<HelpTab {...props} />} />
          <Tab
            id="host-form-template-tab-presets"
            title="Presets"
            panel={
              <PresetsTab
                onPresetClick={onPresetClick}
                onSaveCurrentAsPreset={onSaveCurrentAsPreset}
                onDeleteLocalPreset={onDeleteLocalPreset}
                localPresets={localPresets}
              />
            }
          />
        </Tabs>
      </div>
      <RenderErrors {...meta} />
    </FieldWrapper>
  );
};

export const TemplateField: React.FC<TemplateFieldProps> = props => (
  <Field {...props} component={TemplateFieldComponent} />
);
