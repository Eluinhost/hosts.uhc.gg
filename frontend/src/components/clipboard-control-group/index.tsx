import { ActionIcon, TextInput } from '@mantine/core';
import { ClipboardIcon } from '@phosphor-icons/react';
import React, { useCallback, useRef } from 'react';

import { showToast } from '../../services/AppToaster';

interface ClipboardControlGroupProps {
  value: string;
  label?: string;
}

export const ClipboardControlGroup: React.FC<ClipboardControlGroupProps> = ({ value, label }) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const triggerCopy = useCallback(() => {
    try {
      inputRef.current?.select();
      // eslint-disable-next-line @typescript-eslint/no-deprecated
      document.execCommand('copy');
      showToast({
        color: 'green',
        message: `Added \`${inputRef.current?.value}\` to clipboard`,
      });
    } catch (e) {
      console.error(e);

      showToast({
        color: 'red',
        message: 'Your browser does not support copy, you must copy manually',
      });
    }
  }, []);

  return (
    <TextInput
      size="lg"
      value={value}
      readOnly
      ref={inputRef}
      label={label}
      rightSection={
        <ActionIcon size="lg" bdrs={100} variant="subtle" color="green" onClick={triggerCopy}>
          <ClipboardIcon />
        </ActionIcon>
      }
    />
  );
};
