import { Button, Classes, Dialog, H5, Intent } from '@blueprintjs/core';
import { ArrowLeftIcon, RemoveIcon } from '@blueprintjs/icons';
import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createSelector } from 'reselect';

import { RemovePermission } from '../../actions';
import type { ApplicationState } from '../../state/ApplicationState';
import type { RemovePermissionDialogState } from '../../state/PermissionsState';

type RemovePermissionDialogStateSlice = {
  readonly state: RemovePermissionDialogState | null;
  readonly isDarkMode: boolean;
};

const removePermissionSelector = createSelector(
  (state: ApplicationState) => state.permissions.removeDialog,
  (state: ApplicationState) => state.settings.isDarkMode,
  (state, isDarkMode) => ({ state, isDarkMode }),
);

const RemovePermissionDialogComponent: React.FC<RemovePermissionDialogStateSlice> = ({ state, isDarkMode }) => {
  const dispatch = useDispatch();

  const onClose = useCallback(() => dispatch(RemovePermission.closeDialog()), [dispatch]);

  const onRemove = useCallback(() => {
    dispatch(RemovePermission.start());
    dispatch(RemovePermission.closeDialog());
  }, [dispatch]);

  return (
    <Dialog
      icon={<RemoveIcon />}
      isOpen={!!state}
      onClose={onClose}
      title="Remove role"
      className={isDarkMode ? Classes.DARK : ''}
    >
      <div className={`${Classes.DIALOG_BODY} remove-permission-body`}>
        <H5>
          Are you sure you want to remove &#39;{state ? state.permission : '...'}&#39; from /u/
          {state ? state.username : '...'}
        </H5>
      </div>
      <div className={Classes.DIALOG_FOOTER}>
        <div className={Classes.DIALOG_FOOTER_ACTIONS}>
          <Button onClick={onClose} icon={<ArrowLeftIcon />}>
            Cancel
          </Button>
          <Button intent={Intent.DANGER} onClick={onRemove} icon={<RemoveIcon />}>
            Remove permission
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

export const RemovePermissionDialog: React.ComponentType = () => {
  const state = useSelector(removePermissionSelector);
  return <RemovePermissionDialogComponent {...state} />;
};
