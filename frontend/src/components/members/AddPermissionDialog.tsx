import { Button, Classes, Dialog, Intent } from '@blueprintjs/core';
import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { Dispatch } from 'redux';
import { type InjectedFormProps, reduxForm } from 'redux-form';
import { createSelector } from 'reselect';

import { AddPermission } from '../../actions';
import { Validator } from '../../services/Validator';
import type { ApplicationState } from '../../state/ApplicationState';
import { TextField } from '../fields/TextField';

type AddPermissionDialogData = {
  username: string;
};

const addPermissionSelector = createSelector(
  (state: ApplicationState) => state.permissions.addDialog,
  (state: ApplicationState) => state.settings.isDarkMode,
  (state, isDarkMode) => ({ state, isDarkMode }),
);

const AddPermissionDialogComponent: React.FunctionComponent<InjectedFormProps<AddPermissionDialogData>> = ({
  handleSubmit,
  submitting,
  invalid,
}) => {
  const dispatch = useDispatch();
  const { state, isDarkMode } = useSelector(addPermissionSelector);

  const onClose = useCallback(() => dispatch(AddPermission.closeDialog()), [dispatch]);

  return (
    <Dialog
      icon="add"
      isOpen={!!state}
      onClose={onClose}
      title={`Add '${state ? state.permission : 'NOT OPEN'}' role`}
      className={isDarkMode ? Classes.DARK : ''}
    >
      <div className={`${Classes.DIALOG_BODY} add-permission-body`}>
        <form onSubmit={handleSubmit}>
          <TextField name="username" label="Username" required disabled={submitting} className={Classes.FILL} />
        </form>
      </div>
      <div className={Classes.DIALOG_FOOTER}>
        <div className={Classes.DIALOG_FOOTER_ACTIONS}>
          <Button onClick={onClose} icon="arrow-left">
            Cancel
          </Button>
          <Button intent={Intent.SUCCESS} onClick={handleSubmit} disabled={invalid || submitting} icon="add">
            Add Permission
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

const validator = new Validator<AddPermissionDialogData>().withValidationFunction('username', username => {
  if (!username) return 'This field is required';

  if (username.length < 3) return 'Must be at least 3 characters long';

  if (username.length > 256) return 'Must be at most 256 characters long';

  return undefined;
});

export const AddPermissionDialog = reduxForm<AddPermissionDialogData>({
  form: 'add-permission-form',
  validate: validator.validate,
  onSubmit: (values: AddPermissionDialogData, dispatch: Dispatch) => {
    dispatch(AddPermission.start(values.username));
    dispatch(AddPermission.closeDialog());
  },
})(AddPermissionDialogComponent);
