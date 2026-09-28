import { TagsInput, type TagsInputProps } from '@mantine/core';
import { type FieldWithValue } from '@tanstack/react-form';
import React from 'react';

export type TagsFieldProps = Omit<TagsInputProps, 'values' | 'onAdd' | 'onRemove' | 'error'> & {
  field: FieldWithValue<Array<string>>;
};

const combineTags = (tags: string[]) => {
  const results = [] as string[];
  const set = new Set<string>();

  for (const tag of tags) {
    if (!set.has(tag.toLowerCase())) {
      set.add(tag.toLowerCase());
      results.push(tag);
    }
  }

  return results;
};

export const TagsField: React.FC<TagsFieldProps> = ({ field, ...props }) => {
  return (
    <TagsInput
      {...props}
      error={field.errors[0]?.message}
      value={field.value}
      onChange={newTags => {
        field.handleChange(combineTags(newTags));
      }}
    />
  );
};
