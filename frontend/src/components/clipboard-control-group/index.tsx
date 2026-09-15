import { Button, Classes, ControlGroup, Intent } from '@blueprintjs/core';
import React, { useCallback, useRef } from 'react';

import { showToast } from '../../services/AppToaster';

type Props = {
  readonly value: string;
};

export const ClipboardControlGroup: React.FC<Props> = ({ value }) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const triggerCopy = useCallback(() => {
    try {
      inputRef.current?.select();
      // eslint-disable-next-line @typescript-eslint/no-deprecated
      document.execCommand('copy');
      void showToast({
        intent: Intent.SUCCESS,
        message: `Added \`${inputRef.current?.value}\` to clipboard`,
      });
    } catch (e) {
      console.error(e);

      void showToast({
        intent: Intent.DANGER,
        message: 'Your browser does not support copy, you must copy manually',
      });
    }
  }, []);

  return (
    <ControlGroup fill>
      <input type="text" className={`${Classes.INPUT} ${Classes.LARGE}`} value={value} readOnly ref={inputRef} />
      <Button size="large" variant="minimal" icon="clipboard" className={Classes.FIXED} onClick={triggerCopy} />
    </ControlGroup>
  );
};
