import { Intent, TagInput, type TagInputProps } from '@blueprintjs/core';
import { type FieldWithValue } from '@tanstack/react-form';
import React from 'react';

export type TagsFieldProps = Omit<TagInputProps, 'fill' | 'intent' | 'values' | 'onAdd' | 'onRemove'> & {
  field: FieldWithValue<Array<string>>;
};

const combineTags = (a: string[], b: string[]) => {
  const results = [] as string[];
  const set = new Set<string>();

  const combined = [...a, ...b];

  for (const tag of combined) {
    if (!set.has(tag.toLowerCase())) {
      set.add(tag.toLowerCase());
      results.push(tag);
    }
  }

  return results;
};

export const TagsField: React.FC<TagsFieldProps> = ({ field, ...props }) => {
  return (
    <TagInput
      {...props}
      fill
      intent={field.meta.isValid ? Intent.NONE : Intent.DANGER}
      values={field.value}
      onAdd={newTags => {
        field.handleChange(prev => combineTags(prev, newTags));
      }}
      onRemove={(_: unknown, removed: number) => {
        const newValues = field.value.filter((_, index) => index !== removed);

        if (newValues.length !== field.value.length) {
          field.handleChange(newValues);
        }
      }}
      onKeyDown={e => {
        // Stops enter key from submitting the outer form
        e.stopPropagation();
      }}
    />
  );
};
