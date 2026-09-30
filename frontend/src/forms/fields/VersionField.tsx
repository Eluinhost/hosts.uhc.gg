import { Group, SegmentedControl, Select, TextInput, Loader, EmptyState, Button } from '@mantine/core';
import { WarningIcon } from '@phosphor-icons/react';
import { type FieldWithValue } from '@tanstack/react-form';
import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';

import { VersionsData } from '@/versions/api';

export type VersionFieldProps = {
  field: FieldWithValue<string>;
};

const LoadedVersionField = ({ field, data }: VersionFieldProps & { data: Array<string> }) => {
  const [isCustom, setIsCustom] = useState(false);
  const isInVersionList = data.includes(field.value);

  const shouldShowAsCustom = isCustom || !isInVersionList;

  const handleCustomToggle = (choice: string) => {
    const isWantingCustom = choice === 'Custom';

    // ensures that if they've got something custom entered when
    // swapping back then it's forced into something valid
    if (shouldShowAsCustom && !isWantingCustom && !isInVersionList) {
      field.handleChange(data[0]);
    }

    setIsCustom(isWantingCustom);
  };

  return (
    <Group align="flex-start">
      <SegmentedControl
        size="sm"
        data={['Presets', 'Custom']}
        value={shouldShowAsCustom ? 'Custom' : 'Presets'}
        onChange={handleCustomToggle}
      />
      {shouldShowAsCustom ? (
        <TextInput
          error={field.errors[0]?.message}
          value={field.value}
          onChange={e => {
            field.handleChange(e.target.value);
          }}
          onBlur={field.handleBlur}
          flex={1}
        />
      ) : (
        <Select
          data={data}
          error={field.errors[0]?.message}
          value={field.value}
          onChange={value => {
            if (value) {
              field.handleChange(value);
            }
          }}
          onBlur={field.handleBlur}
          flex={1}
        />
      )}
    </Group>
  );
};

export const VersionField: React.FC<VersionFieldProps> = ({ field }) => {
  const { isPending, error, data, refetch } = useQuery(VersionsData.getAllVersions);

  if (isPending) {
    return <Loader />;
  }

  if (error) {
    return (
      <EmptyState icon={<WarningIcon />} title="Failed to load versions list">
        <Button
          onClick={() => {
            void refetch();
          }}
        >
          Try Again
        </Button>
      </EmptyState>
    );
  }

  return <LoadedVersionField field={field} data={data} />;
};
