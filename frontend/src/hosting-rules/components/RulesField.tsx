import { Tab, Tabs, TextArea } from '@blueprintjs/core';
import type { FieldWithValue } from '@tanstack/react-form';

import { Markdown } from '../../components/Markdown';

export const RulesField = ({ className, field }: { className?: string; field: FieldWithValue<string> }) => {
  return (
    <div className={`markdown-field-wrapper ${className || ''}`}>
      <Tabs id="rules-form-tabs">
        <Tab
          id="rules-form-rules"
          title="Template"
          panel={
            <TextArea
              onChange={e => {
                field.handleChange(e.target.value);
              }}
              onBlur={() => {
                field.handleBlur();
              }}
              value={field.value}
              fill
              rows={15}
            />
          }
        />
        <Tab id="rules-form-preview" title="Preview" panel={<Markdown markdown={field.value} />} />
      </Tabs>
    </div>
  );
};
