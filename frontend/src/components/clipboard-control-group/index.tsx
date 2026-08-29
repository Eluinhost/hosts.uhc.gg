import React, { useCallback, useRef } from 'react';
import { Button, Classes, ControlGroup, Intent } from '@blueprintjs/core';
import { AppToaster } from '../../services/AppToaster';

type Props = {
  readonly value: string;
};

export const ClipboardControlGroup = React.memo(({ value }: Props) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const triggerCopy = useCallback(() => {
    try {
      inputRef.current!.select();
      document.execCommand('copy');
      AppToaster.show({
        intent: Intent.SUCCESS,
        message: `Added \`${inputRef.current!.value}\` to clipboard`,
      });
    } catch (e) {
      console.error(e);

      AppToaster.show({
        intent: Intent.DANGER,
        message: 'Your browser does not support copy, you must copy manually',
      });
    }
  }, []);

  return (
    <ControlGroup fill>
      <input
        type="text"
        className={`${Classes.INPUT} ${Classes.LARGE}`}
        value={value}
        readOnly
        ref={inputRef}
      />
      <Button large minimal icon="clipboard" className={Classes.FIXED} onClick={triggerCopy} />
    </ControlGroup>
  );
});
