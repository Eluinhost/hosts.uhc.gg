import { Button, HTMLSelect, type HTMLSelectProps, NonIdealState, Spinner } from '@blueprintjs/core';
import { WarningSignIcon } from '@blueprintjs/icons';
import { type FieldWithValue } from '@tanstack/react-form';
import { useQuery } from '@tanstack/react-query';
import React from 'react';

import { VersionsData } from '../api';

export const VERSION_PICKER_OTHER = 'Other (specify in range)';

export const VersionPicker: React.FC<
  Omit<HTMLSelectProps, 'options' | 'value' | 'onChange' | 'onBlur'> & { field: FieldWithValue<string> }
> = ({ field, ...props }) => {
  const { isPending, error, data, refetch } = useQuery(VersionsData.getAllVersions);

  if (isPending) {
    return <Spinner />;
  }

  if (error) {
    return (
      <NonIdealState
        icon={<WarningSignIcon />}
        title="Failed to load versions list"
        action={
          <Button
            onClick={() => {
              void refetch();
            }}
          >
            Try Again
          </Button>
        }
      />
    );
  }

  const options = [...data, VERSION_PICKER_OTHER].map(item => ({
    display: item,
    value: item,
  }));

  return (
    <HTMLSelect
      {...props}
      options={options}
      value={field.value}
      onChange={e => {
        field.handleChange(e.target.value);
      }}
      onBlur={field.handleBlur}
    />
  );
};
