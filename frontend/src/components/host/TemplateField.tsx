import * as React from 'react';
import { BaseFieldProps, Field, WrappedFieldProps } from 'redux-form';
import { FieldWrapper, RenderErrors, RenderLabel } from '../fields/FieldWrapper';
import * as Mark from 'markup-js';
import * as moment from 'moment';
import { Button, Callout, Classes, H5, HTMLTable, Intent, Tab, Tabs, TextArea } from "@blueprintjs/core";
import { Preset, presets } from './presets';
import {memoizeWith, toString} from 'ramda';
import { Markdown } from '../Markdown';

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
      moment: (date: moment.Moment, format: string): string =>
        date
          .clone()
          .utc()
          .format(format),
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

const PresetButton: React.FunctionComponent<{ readonly onClick: () => void; readonly id: string }> = ({ onClick, id }) => (
  <Button onClick={onClick} intent={Intent.PRIMARY} large>
    {id}
  </Button>
);

const PresetsTab: React.FunctionComponent<{ readonly onPresetClick: (p: Preset) => () => void }> = ({ onPresetClick }) => (
  <Callout intent={Intent.PRIMARY}>
    {presets.map(p => <PresetButton key={p.name} onClick={onPresetClick(p)} id={p.name} />)}
  </Callout>
);

type TemplateFieldComponentState = {
  readonly currentTabId: string | number;
};

class TemplateFieldComponent extends React.Component<
  WrappedFieldProps  & TemplateFieldProps,
  TemplateFieldComponentState
> {
  state = {
    currentTabId: 'host-form-template-tab-template',
  };

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

  render() {
    const Template = <TemplateTab {...this.props} />;
    const Preview = <PreviewTab {...this.props} />;
    const Help = <HelpTab {...this.props} />;
    const Presets = <PresetsTab onPresetClick={this.onPresetClick} />;

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
