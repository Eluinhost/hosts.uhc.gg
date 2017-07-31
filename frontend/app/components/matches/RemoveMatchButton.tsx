import { Button, IButtonProps, Intent } from '@blueprintjs/core';
import * as React from 'react';

export type RemoveMatchButtonProps = IButtonProps;

export const RemoveMatchButton: React.SFC<RemoveMatchButtonProps> = props => (
  <Button
    intent={Intent.DANGER}
    rightIconName="delete"
    className="match-remove-button"
    {...props}
  >
    Remove
  </Button>
);
