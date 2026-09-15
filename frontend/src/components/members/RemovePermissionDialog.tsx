import { Button, Callout, Classes, Dialog, H5, Intent } from '@blueprintjs/core';
import { ArrowLeftIcon, RemoveIcon } from '@blueprintjs/icons';
import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { Dispatch } from 'redux';
import { type InjectedFormProps, reduxForm } from 'redux-form';
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

const RemovePermissionDialogComponent: React.FunctionComponent<
  RemovePermissionDialogStateSlice & InjectedFormProps<Record<string, never>, RemovePermissionDialogStateSlice>
> = ({ state, submitting, invalid, handleSubmit, error, isDarkMode }) => {
  const dispatch = useDispatch();

  const onClose = useCallback(() => dispatch(RemovePermission.closeDialog()), [dispatch]);

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
        {!!error && <Callout intent={Intent.DANGER}>{error}</Callout>}
      </div>
      <div className={Classes.DIALOG_FOOTER}>
        <div className={Classes.DIALOG_FOOTER_ACTIONS}>
          <Button onClick={onClose} icon={<ArrowLeftIcon />}>
            Cancel
          </Button>
          <Button intent={Intent.DANGER} onClick={handleSubmit} disabled={submitting || invalid} icon={<RemoveIcon />}>
            Remove permission
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

const RemovePermissionDialogForm = reduxForm<Record<string, never>, RemovePermissionDialogStateSlice>({
  form: 'remove-permission-form',
  onSubmit: (_values: Record<string, never>, dispatch: Dispatch) => {
    dispatch(RemovePermission.start());
    dispatch(RemovePermission.closeDialog());
  },
})(RemovePermissionDialogComponent);

export const RemovePermissionDialog: React.ComponentType = () => {
  const state = useSelector(removePermissionSelector);
  return <RemovePermissionDialogForm {...state} />;
};
