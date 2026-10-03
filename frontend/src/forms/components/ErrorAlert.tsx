import { Alert } from '@mantine/core';
import type { AnyFieldApi } from '@tanstack/react-form';

import { useFormSelector } from '@/forms/useAppForm';

export const ErrorAlert = ({ field }: { field: AnyFieldApi }) => {
  const errors = useFormSelector(field.atom, s => s.meta.errors);

  return errors.length > 0 ? <Alert color="red">{errors[0].message}</Alert> : null;
};
