import { Intent, TagInput, type TagInputProps } from '@blueprintjs/core';
import { type FieldWithValue } from '@tanstack/react-form';
import { uniqBy, toLower, union } from 'ramda';
import React from 'react';

export type TagsFieldProps = Omit<TagInputProps, 'fill' | 'intent' | 'values' | 'onAdd' | 'onRemove'> & {
  field: FieldWithValue<Array<string>>;
};

const combineTags = (a: string[], b: string[]) => uniqBy(toLower, union(a, b));

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
