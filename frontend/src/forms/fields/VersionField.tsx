import {
  Button,
  Classes,
  ControlGroup,
  HTMLSelect,
  InputGroup,
  NonIdealState,
  SegmentedControl,
  Spinner,
} from '@blueprintjs/core';
import { WarningSignIcon } from '@blueprintjs/icons';
import { type FieldWithValue } from '@tanstack/react-form';
import { useQuery } from '@tanstack/react-query';
import { clsx } from 'clsx';
import React, { useState } from 'react';

import { VersionsData } from '../../versions/api';

export type VersionFieldProps = {
  field: FieldWithValue<string>;
};

const LoadedVersionField = ({ field, data }: VersionFieldProps & { data: Array<string> }) => {
  const [isCustom, setIsCustom] = useState(false);
  const isInVersionList = data.includes(field.value);

  const shouldShowAsCustom = isCustom || !isInVersionList;

  const versionOptions: { display: string; value: string }[] = data.map(item => ({ display: item, value: item }));

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
    <ControlGroup fill>
      <SegmentedControl
        size="small"
        className={Classes.FIXED}
        options={[{ value: 'Presets' }, { value: 'Custom' }]}
        value={shouldShowAsCustom ? 'Custom' : 'Presets'}
        onValueChange={handleCustomToggle}
      />
      {shouldShowAsCustom ? (
        <InputGroup
          className={clsx({
            [Classes.INTENT_DANGER]: field.meta.isInvalid,
          })}
          value={field.value}
          onChange={e => {
            field.handleChange(e.target.value);
          }}
          onBlur={field.handleBlur}
        />
      ) : (
        <HTMLSelect
          className={clsx({
            [Classes.INTENT_DANGER]: field.meta.isInvalid,
          })}
          options={versionOptions}
          value={field.value}
          onChange={e => {
            field.handleChange(e.target.value);
          }}
          onBlur={field.handleBlur}
        />
      )}
    </ControlGroup>
  );
};

export const VersionField: React.FC<VersionFieldProps> = ({ field }) => {
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

  return <LoadedVersionField field={field} data={data} />;
};
