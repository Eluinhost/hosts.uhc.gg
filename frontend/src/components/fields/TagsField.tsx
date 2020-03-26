import * as React from 'react';
import { BaseFieldProps, Field, WrappedFieldInputProps, WrappedFieldProps } from 'redux-form';
import { FieldWrapper } from './FieldWrapper';
import { TagInput } from '@blueprintjs/core';
import { uniqBy, toLower, union } from 'ramda';

export type TagsFieldProps = BaseFieldProps & {
  readonly label: string;
  readonly required: boolean;
  readonly disabled?: boolean;
  readonly className?: string;
};

const combineTags = (a: string[], b: string[]) => uniqBy(toLower, union(a, b));

const onAdd = (input?: WrappedFieldInputProps) => (newValues: string[]): void => {
  if (!input) return;

  const current = (input.value as string[]) || [];
  const combined = combineTags(current, newValues);

  input.onChange(combined, combined, current);
};

const onRemove = (input?: WrappedFieldInputProps) => (removed: string): void => {
  if (!input) return;

  const current = (input.value as string[]) || [];

  const newValues = current.filter(it => it !== removed);

  if (newValues.length !== current.length) {
    input.onChange(newValues, newValues, current);
  }
};

const renderField: React.SFC<WrappedFieldProps<any> & TagsFieldProps> = props => (
  <FieldWrapper meta={props.meta} label={props.label} required={props.required}>
    <TagInput
      values={props.input && props.input.value ? props.input.value : []}
      onAdd={onAdd(props.input!)}
      onRemove={onRemove(props.input!)}
      inputProps={{ disabled: props.disabled }}
    />
  </FieldWrapper>
);

export const TagsField: React.SFC<TagsFieldProps> = props => <Field {...props} component={renderField} />;