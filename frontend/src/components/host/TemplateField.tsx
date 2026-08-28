import * as React from 'react';
import { BaseFieldProps, Field, WrappedFieldProps } from 'redux-form';
import { FieldWrapper, RenderErrors, RenderLabel } from '../fields/FieldWrapper';
import * as Mark from 'markup-js';
import moment from 'moment-timezone';
import { Button, Callout, Classes, H5, HTMLTable, Intent, Tab, Tabs, TextArea } from '@blueprintjs/core';
import { Preset, presets } from './presets';
import { memoizeWith, toString } from 'ramda';
import { Markdown } from '../Markdown';

const LOCAL_PRESETS_STORAGE_KEY = 'host-form-template-presets-v1';

const isValidPreset = (value: any): value is Preset =>
  !!value && typeof value.name === 'string' && value.name.trim().length > 0 && typeof value.template === 'string';

const readLocalPresets = (): Preset[] => {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(LOCAL_PRESETS_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(isValidPreset).map(p => ({
      name: p.name.trim(),
      template: p.template,
    }));
  } catch {
    return [];
  }
};

const writeLocalPresets = (localPresets: Preset[]): void => {
  if (typeof window === 'undefined') return;

  window.localStorage.setItem(LOCAL_PRESETS_STORAGE_KEY, JSON.stringify(localPresets));
};

export type TemplateFieldProps = BaseFieldProps & {
  readonly label?: React.ReactElement | string;
  readonly required: boolean;
  readonly disabled?: boolean;
  readonly className?: string;
  readonly context: any;
  readonly changeTemplate: (value: string) => void;
};

export const renderToMarkdown = (template: string, context: any): string =>
  Mark.up(template, context, {
    pipes: {
      moment: (date: moment.Moment, format: string): string => date.clone().utc().format(format),
    },
  });

const TemplateTab: React.FunctionComponent<WrappedFieldProps & TemplateFieldProps> = ({ input, disabled }) => (
  <TextArea {...input} disabled={disabled} fill rows={15} />
);

const PreviewTab: React.FunctionComponent<WrappedFieldProps & TemplateFieldProps> = ({ input, context }) => (
  <Markdown markdown={renderToMarkdown(input!.value, context)} />
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

const renderSamples = (context: any): React.ReactElement[] =>
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
    <HTMLTable bordered small striped>
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
  <Button onClick={onClick} intent={Intent.PRIMARY} large>
    {id}
  </Button>
);

const PresetsTab: React.FunctionComponent<{
  readonly onPresetClick: (p: Preset) => () => void;
  readonly onSaveCurrentAsPreset: () => void;
  readonly onDeleteLocalPreset: (presetName: string) => () => void;
  readonly localPresets: Preset[];
}> = ({ onPresetClick, onSaveCurrentAsPreset, onDeleteLocalPreset, localPresets }) => (
  <Callout intent={Intent.PRIMARY}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
      <H5 style={{ margin: 0 }}>Built-in presets</H5>
      <Button minimal icon="floppy-disk" onClick={onSaveCurrentAsPreset}>
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
            <Button minimal icon="trash" intent={Intent.DANGER} onClick={onDeleteLocalPreset(preset.name)}>
              Remove
            </Button>
          </div>
        ))}
      </div>
    )}
  </Callout>
);

type TemplateFieldComponentState = {
  readonly currentTabId: string | number;
  readonly localPresets: Preset[];
};

class TemplateFieldComponent extends React.PureComponent<
  WrappedFieldProps & TemplateFieldProps,
  TemplateFieldComponentState
> {
  state = {
    currentTabId: 'host-form-template-tab-template',
    localPresets: [] as Preset[],
  };

  componentDidMount() {
    this.setState({
      localPresets: readLocalPresets(),
    });
  }

  onTabChange = (newTabId: string | number): void =>
    this.setState({
      currentTabId: newTabId,
    });

  onPresetClick: (p: Preset) => () => void = memoizeWith(toString, (p: Preset) => (): void => {
    this.props.changeTemplate(p.template);
    this.setState({
      currentTabId: 'host-form-template-tab-template',
    });
  });

  onSaveCurrentAsPreset = (): void => {
    if (typeof window === 'undefined') return;

    const name = window.prompt('Preset name');
    const trimmedName = (name || '').trim();

    if (!trimmedName) return;

    const alreadyExists = this.state.localPresets.some(
      existing => existing.name.toLowerCase() === trimmedName.toLowerCase(),
    );

    if (alreadyExists && !window.confirm(`Preset "${trimmedName}" already exists. Overwrite it?`)) return;

    const preset = {
      name: trimmedName,
      template: this.props.input.value || '',
    };

    const nextLocalPresets = [...this.state.localPresets.filter(p => p.name.toLowerCase() !== trimmedName.toLowerCase()), preset]
      .sort((a, b) => a.name.localeCompare(b.name));

    writeLocalPresets(nextLocalPresets);
    this.setState({ localPresets: nextLocalPresets });
  };

  onDeleteLocalPreset: (presetName: string) => () => void = memoizeWith(
    toString,
    (presetName: string) => (): void => {
      if (typeof window === 'undefined') return;

      if (!window.confirm(`Remove preset "${presetName}"?`)) return;

      const nextLocalPresets = this.state.localPresets.filter(
        preset => preset.name.toLowerCase() !== presetName.toLowerCase(),
      );

      writeLocalPresets(nextLocalPresets);
      this.setState({ localPresets: nextLocalPresets });
    },
  );

  render() {
    const Template = <TemplateTab {...this.props} />;
    const Preview = <PreviewTab {...this.props} />;
    const Help = <HelpTab {...this.props} />;
    const Presets = (
      <PresetsTab
        onPresetClick={this.onPresetClick}
        onSaveCurrentAsPreset={this.onSaveCurrentAsPreset}
        onDeleteLocalPreset={this.onDeleteLocalPreset}
        localPresets={this.state.localPresets}
      />
    );

    return (
      <FieldWrapper meta={this.props.meta} required={this.props.required} hideErrors>
        <div className={`markdown-field-wrapper ${this.props.className || ''}`}>
          {!!this.props.label && <RenderLabel label={this.props.label!} required={this.props.required} />}
          <Tabs id="host-form-template-tabs" onChange={this.onTabChange} selectedTabId={this.state.currentTabId}>
            <Tab id="host-form-template-tab-template" title="Template" panel={Template} />
            <Tab id="host-form-template-tab-preview" title="Preview" panel={Preview} />
            <Tab id="host-form-template-tab-help" title="Help" panel={Help} />
            <Tab id="host-form-template-tab-presets" title="Presets" panel={Presets} />
          </Tabs>
        </div>
        <RenderErrors {...this.props.meta} />
      </FieldWrapper>
    );
  }
}

export const TemplateField: React.FunctionComponent<TemplateFieldProps> = props => (
  <Field {...props} component={TemplateFieldComponent} />
);
