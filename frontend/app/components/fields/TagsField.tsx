import * as React from 'react';
import { BaseFieldProps, Field, WrappedFieldInputProps, WrappedFieldProps } from 'redux-form';
import { FieldWrapper } from './FieldWrapper';
import { TagInput } from '@blueprintjs/labs';

export type TagsFieldProps = BaseFieldProps & {
  readonly label: string;
  readonly required: boolean;
  readonly disabled?: boolean;
  readonly className?: string;
};

const onAdd = (input?: WrappedFieldInputProps) => (newValue: string): void => {
  if (!input)
    return;

  const lowered = newValue.toLowerCase();
  const current = (input.value as string[]) || [];

  const exists = current
    .map(it => it.toLowerCase())
    .some(it => it === lowered);

  if (!exists) {
    const newValues = [...current, newValue];

    input.onChange(newValues, newValues, current);
  }
};

const onRemove = (input?: WrappedFieldInputProps) => (removed: string): void => {
  if (!input)
    return;

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
