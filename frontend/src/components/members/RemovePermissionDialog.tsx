import React, { useCallback } from 'react';
import { InjectedFormProps, reduxForm, SubmissionError } from 'redux-form';
import { useSelector, useDispatch } from 'react-redux';
import { createSelector } from 'reselect';
import { ApplicationState } from '../../state/ApplicationState';
import { Button, Callout, Classes, Dialog, H5, Intent } from '@blueprintjs/core';
import { RemovePermissionDialogState } from '../../state/PermissionsState';
import { RemovePermission } from '../../actions';

type RemovePermissionDialogStateSlice = {
  readonly state: RemovePermissionDialogState | null;
  readonly isDarkMode: boolean;
};

const removePermissionSelector = createSelector(
  (state: ApplicationState) => state.permissions.removeDialog,
  state => state.settings.isDarkMode,
  (state, isDarkMode) => ({ state, isDarkMode }),
);

const RemovePermissionDialogComponent: React.FunctionComponent<
  RemovePermissionDialogStateSlice & InjectedFormProps<{}, RemovePermissionDialogStateSlice>
> = ({ state, submitting, invalid, handleSubmit, error, isDarkMode }) => {
  const dispatch = useDispatch();

  const onClose = useCallback(() => dispatch(RemovePermission.closeDialog()), [dispatch]);

  return (
    <Dialog
      icon="remove"
      isOpen={!!state}
      onClose={onClose}
      title="Remove role"
      className={isDarkMode ? Classes.DARK : ''}
    >
      <div className={`${Classes.DIALOG_BODY} remove-permission-body`}>
        <H5>
          Are you sure you want to remove '{state ? state.permission : '...'}' from /u/{state ? state.username : '...'}
        </H5>
        {!!error && <Callout intent={Intent.DANGER}>{error}</Callout>}
      </div>
      <div className={Classes.DIALOG_FOOTER}>
        <div className={Classes.DIALOG_FOOTER_ACTIONS}>
          <Button onClick={onClose} icon="arrow-left">
            Cancel
          </Button>
          <Button intent={Intent.DANGER} onClick={handleSubmit} disabled={submitting || invalid} icon="remove">
            Remove permission
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

const RemovePermissionDialogForm: React.ComponentType<RemovePermissionDialogStateSlice> = reduxForm<
  {},
  RemovePermissionDialogStateSlice
>({
  form: 'remove-permission-form',
  onSubmit: async (values, dispatch): Promise<void> => {
    try {
      await dispatch(RemovePermission.start());
      dispatch(RemovePermission.closeDialog());
    } catch (err) {
      throw new SubmissionError({ __error: 'Unexpected response from the server' });
    }
  },
})(RemovePermissionDialogComponent);

export const RemovePermissionDialog: React.ComponentType = () => {
  const state = useSelector(removePermissionSelector);
  return <RemovePermissionDialogForm {...state} />;
};
