import { Button, Intent } from '@blueprintjs/core';
import * as React from 'react';

export type RemoveMatchButtonProps = {
  readonly onPress: () => any;
};

export const RemoveMatchButton: React.SFC<RemoveMatchButtonProps> = ({ onPress }) => (
  <Button
    onClick={onPress}
    intent={Intent.DANGER}
    rightIconName="delete"
    className="match-remove-button"
  >
    Remove
  </Button>
);
