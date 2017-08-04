import * as React from 'react';
import { BaseFieldProps, Field, WrappedFieldProps } from 'redux-form';
import { FieldWrapper, RenderErrors, renderLabel } from '../fields/FieldWrapper';
import * as Snuownd from 'snuownd';
import * as Mark from 'markup-js';
import * as moment from 'moment';
import { Button, Intent, Tab2, Tabs2 } from '@blueprintjs/core';
import { Preset, presets } from './presets';
import { memoize } from 'ramda';

const parser = Snuownd.getParser();

export type TemplateFieldProps = BaseFieldProps & {
  readonly label?: React.ReactElement<any> | string;
  readonly required: boolean;
  readonly disabled?: boolean;
  readonly className?: string;
  readonly context: any;
  readonly changeTemplate: (value: string) => void;
};

export const renderToMarkdown = (template: string, context: any): string => Mark.up(template, context, {
  pipes: {
    moment: (date: moment.Moment, format: string): string => date.utc().format(format),
  },
});

export const renderToHtml = (template: string, context: any): string =>
  parser.render(renderToMarkdown(template, context));

const TemplateTab: React.SFC<WrappedFieldProps<any> & TemplateFieldProps> = ({ input, disabled }) => (
  <textarea {...input} disabled={disabled} className="pt-fill pt-input" rows={15}/>
);

const PreviewTab: React.SFC<WrappedFieldProps<any> & TemplateFieldProps> = ({ input, context }) => (
  <pre dangerouslySetInnerHTML={{ __html: renderToHtml(input!.value, context) }} />
);

const samples = [
  ['{{author}}', 'The creator of the post (you!)'],
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
  ['{{mapSizeX}} x {{mapSizeZ}}', 'Map dimensions'],
  ['{{pvpEnabledAt}}', 'When PVP turns on'],
];

const renderSamples = (context: any): React.ReactElement<any>[] => samples.map((sample, index) => (
  <tr key={index}>
    <td className="pt-monospace-text">{sample[0]}</td>
    <td>{sample[1]}</td>
    <td>{Mark.up(sample[0], context)}</td>
  </tr>
));

const HelpTab: React.SFC<WrappedFieldProps<any> & TemplateFieldProps> = ({ input, context }) => (
  <div className="pt-callout pt-intent-primary">
    <h5>Template information</h5>
    <div>
      <span>Templates can use </span>
      <a href="https://www.reddit.com/wiki/commenting" target="_blank">Reddit Formatting</a>
      <span> as well as </span>
      <a href="https://github.com/adammark/Markup.js/blob/master/README.md" target="_blank">Markup Templating</a>
      <span> for generating content. Here are some template examples:</span>
    </div>
    <table className="pt-table pt-bordered pt-condensed pt-striped">
      <thead>
      <tr>
        <th>Example</th>
        <th>Description</th>
        <th>Output</th>
      </tr>
      </thead>
      <tbody>
        {renderSamples(context)}
      </tbody>
    </table>
  </div>
);

const PresetButton: React.SFC<{ readonly onClick: () => void; readonly id: string }> =
  ({ onClick, id }) => (
    <Button onClick={onClick} intent={Intent.PRIMARY} className="pt-large">{id}</Button>
  );

const PresetsTab: React.SFC<{ readonly onPresetClick: (p: Preset) => () => void }> = ({ onPresetClick }) => (
  <div className="pt-callout pt-intent-primary">
    {presets.map(p => <PresetButton key={p.name} onClick={onPresetClick(p)} id={p.name}/>)}
  </div>
);

type TemplateFieldComponentState = {
  readonly currentTabId: string | number;
};

class TemplateFieldComponent
  extends React.Component<WrappedFieldProps<any> & TemplateFieldProps, TemplateFieldComponentState> {
  state = {
    currentTabId: 'host-form-template-tab-template',
  };

  onTabChange = (newTabId: string | number, prevTabId: string | number, event: React.MouseEvent<HTMLElement>): void =>
    this.setState({
      currentTabId: newTabId,
    })

  onPresetClick: (p: Preset) => () => void = memoize((p: Preset) => (): void => {
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
          {renderLabel(this.props)}
          <Tabs2 id="host-form-template-tabs" onChange={this.onTabChange} selectedTabId={this.state.currentTabId}>
            <Tab2 id="host-form-template-tab-template" title="Template" panel={Template}/>
            <Tab2 id="host-form-template-tab-preview" title="Preview" panel={Preview}/>
            <Tab2 id="host-form-template-tab-help" title="Help" panel={Help}/>
            <Tab2 id="host-form-template-tab-presets" title="Presets" panel={Presets}/>
          </Tabs2>
        </div>
        <RenderErrors {...this.props.meta} />
      </FieldWrapper>
    );
  }
}

export const TemplateField: React.SFC<TemplateFieldProps> = props => (
  <Field
    {...props}
    component={TemplateFieldComponent}
  />
);
