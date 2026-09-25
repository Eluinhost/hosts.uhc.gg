import { Tabs, Textarea } from '@mantine/core';
import { ChatCircleIcon } from '@phosphor-icons/react';
import type { FieldWithValue } from '@tanstack/react-form';

import { Markdown } from '../../components/Markdown';

export const RulesField = ({ field }: { field: FieldWithValue<string> }) => {
  return (
    <Tabs defaultValue="template">
      <Tabs.List>
        <Tabs.Tab value="template" leftSection={<ChatCircleIcon size={12} />}>
          Template
        </Tabs.Tab>
        <Tabs.Tab value="preview" leftSection={<ChatCircleIcon size={12} />}>
          Preview
        </Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="template">
        <Textarea
          onChange={e => {
            field.handleChange(e.target.value);
          }}
          onBlur={() => {
            field.handleBlur();
          }}
          value={field.value}
          w="100%"
          rows={15}
        />
      </Tabs.Panel>

      <Tabs.Panel value="preview">
        <Markdown markdown={field.value} />
      </Tabs.Panel>

      <Tabs.Panel value="settings">Settings tab content</Tabs.Panel>
    </Tabs>
  );
};
