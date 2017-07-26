import * as React from 'react';
import { BaseFieldProps, Field, WrappedFieldProps } from 'redux-form';
import { FieldWrapper, RenderErrors, renderLabel } from './FieldWrapper';
import * as Snuownd from 'snuownd';
import * as Mark from 'markup-js';
import * as moment from 'moment';
import { Tab2, Tabs2 } from '@blueprintjs/core';

const parser = Snuownd.getParser();

export interface TemplateFieldProps extends BaseFieldProps {
  readonly label?: React.ReactElement<any> | string;
  readonly required: boolean;
  readonly disabled?: boolean;
  readonly className?: string;
  readonly context: any;
}

const renderText = (template: string, context: any) => ({
  __html: parser.render(Mark.up(template, context, {
    pipes: {
      moment: (date: moment.Moment, format: string) => date.utc().format(format),
    },
  })),
});

const TemplateTab: React.SFC<WrappedFieldProps<any> & TemplateFieldProps> = ({ input, disabled }) => (
  <textarea {...input} disabled={disabled} className="pt-fill pt-input" rows={15}/>
);

const PreviewTab: React.SFC<WrappedFieldProps<any> & TemplateFieldProps> = ({ input, context }) => (
  <pre dangerouslySetInnerHTML={renderText(input!.value, context)} />
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

const renderSamples = (context: any): React.ReactElement<any>[] => samples.map(sample => (
  <tr>
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

const renderTemplateField: React.SFC<WrappedFieldProps<any> & TemplateFieldProps> = props => (
  <FieldWrapper meta={props.meta} required={props.required} hideErrors>
    <div className={`markdown-field-wrapper ${props.className || ''}`}>
      {renderLabel(props)}
      <Tabs2 id="host-form-template-tabs">
        <Tab2 id="host-from-template-tab-template" title="Template" panel={<TemplateTab {...props} />}/>
        <Tab2 id="host-form-template-tab-preview" title="Preview" panel={<PreviewTab {...props} />}/>
        <Tab2 id="host-form-template-tab-help" title="Help" panel={<HelpTab {...props} />}/>
      </Tabs2>
    </div>
    <RenderErrors {...props.meta} />
  </FieldWrapper>
);

export const TemplateField: React.SFC<TemplateFieldProps> = props => (
  <Field
    {...props}
    component={renderTemplateField}
  />
);
