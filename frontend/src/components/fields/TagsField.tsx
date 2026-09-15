import { Intent, TagInput } from '@blueprintjs/core';
import { uniqBy, toLower, union } from 'ramda';
import React, { PropsWithChildren } from 'react';
import { BaseFieldProps, Field, WrappedFieldInputProps, WrappedFieldProps } from 'redux-form';

import { FieldWrapper } from './FieldWrapper';

export type TagsFieldProps = BaseFieldProps & {
  readonly label: string;
  readonly required: boolean;
  readonly disabled?: boolean;
  readonly className?: string;
};

const combineTags = (a: string[], b: string[]) => uniqBy(toLower, union(a, b));

const onAdd =
  (input?: WrappedFieldInputProps) =>
  (newValues: string[]): void => {
    if (!input) return;

    const current = (input.value as string[] | undefined) || [];
    const combined = combineTags(current, newValues);

    input.onChange(combined);
  };

const onRemove =
  (input?: WrappedFieldInputProps) =>
  (_: unknown, removed: number): void => {
    if (!input) return;

    const current = (input.value as string[] | undefined) || [];

    const newValues = current.filter((_, index) => index !== removed);

    if (newValues.length !== current.length) {
      input.onChange(newValues);
    }
  };

const renderField: React.FC<PropsWithChildren<WrappedFieldProps & TagsFieldProps>> = props => {
  const { meta, label, required, input, disabled, children } = props;

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const values = input && input.value ? (input.value as string[]) : [];

  return (
    <FieldWrapper meta={meta} label={label} required={required}>
      <TagInput
        intent={!meta.valid ? Intent.DANGER : Intent.NONE}
        values={values}
        onAdd={onAdd(input)}
        onRemove={onRemove(input)}
        inputProps={{ disabled }}
      />
      {children}
    </FieldWrapper>
  );
};

export const TagsField: React.FC<PropsWithChildren<TagsFieldProps>> = props => (
  <Field {...props} component={renderField} />
);
