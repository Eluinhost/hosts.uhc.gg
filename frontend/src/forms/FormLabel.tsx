import { FormGroup, type FormGroupProps, Intent } from '@blueprintjs/core';
import type { FieldWithValue } from '@tanstack/react-form';
import { type PropsWithChildren } from 'react';

export type FormLabelProps<T> = Partial<FormGroupProps> & {
  showRequiredStar?: boolean;
  hideErrors?: boolean;
  hideOptionalityLabel?: boolean;
  field: FieldWithValue<T>;
};

export const FormLabel = <T,>({
  hideErrors,
  children,
  showRequiredStar,
  hideOptionalityLabel,
  labelInfo,
  field,
  ...others
}: PropsWithChildren<FormLabelProps<T>>) => {
  let label = labelInfo;

  if (!hideOptionalityLabel) {
    const optionality = showRequiredStar ? <span className="required-star">*</span> : '(optional)';

    label = (
      <>
        {optionality} {labelInfo}
      </>
    );
  }

  return (
    <FormGroup
      labelInfo={label}
      helperText={hideErrors || field.errors.length === 0 ? undefined : field.errors.map(x => x.message).join(', ')}
      intent={field.meta.isInvalid ? Intent.DANGER : Intent.NONE}
      fill
      {...others}
    >
      {children}
    </FormGroup>
  );
};
