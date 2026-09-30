import { ActionIcon, TextInput } from '@mantine/core';
import { ClipboardIcon } from '@phosphor-icons/react';
import React, { useCallback } from 'react';

import { showToast } from '../../services/AppToaster';

interface ClipboardControlGroupProps {
  value: string;
  label?: string;
}

export const ClipboardControlGroup: React.FC<ClipboardControlGroupProps> = ({ value, label }) => {
  const triggerCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      showToast({
        color: 'green',
        message: `Added \`${value}\` to clipboard`,
      });
    } catch (e) {
      console.error(e);

      showToast({
        color: 'red',
        message: 'Your browser does not support copy, you must copy manually',
      });
    }
  }, [value]);

  return (
    <TextInput
      size="lg"
      value={value}
      readOnly
      label={label}
      rightSection={
        <ActionIcon
          size="lg"
          bdrs={100}
          variant="subtle"
          color="green"
          onClick={() => {
            void triggerCopy();
          }}
        >
          <ClipboardIcon />
        </ActionIcon>
      }
    />
  );
};
