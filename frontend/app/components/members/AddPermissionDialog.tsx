import * as React from 'react';
import { FormProps, reduxForm, SubmissionError } from 'redux-form';
import { ApplicationState } from '../../state/ApplicationState';
import { Button, Dialog, Intent } from '@blueprintjs/core';
import { TextField } from '../fields/TextField';
import { Spec, validate } from '../../validate';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { MembersActions } from '../../state/MembersState';

type AddPermissionDialogData = {
  username: string;
};

type AddPermissionDialogDispatchProps = {
  readonly close: () => void;
  readonly confirm: (usern: string) => Promise<void>;
};

type AddPermissionDialogStateProps = {
  readonly isOpen: boolean;
  readonly permission: string;
  readonly isDarkMode: boolean;
};

const AddPermissionDialogComponent: React.SFC<
  AddPermissionDialogStateProps &
  AddPermissionDialogDispatchProps &
  FormProps<AddPermissionDialogData, {}, ApplicationState>> =
  ({ handleSubmit, submitting, invalid, close, isOpen, permission, isDarkMode }) => (
    <Dialog
      iconName="add"
      isOpen={isOpen}
      onClose={close}
      title={`Add '${permission}' role`}
      className={isDarkMode ? 'pt-dark' : ''}
    >
      <div className="pt-dialog-body add-permission-body">
        <form onSubmit={handleSubmit}>
          <TextField name="username" label="Username" required disabled={submitting} className="pt-fill"/>
        </form>
      </div>
      <div className="pt-dialog-footer">
        <div className="pt-dialog-footer-actions">
          <Button
            onClick={close}
            iconName="arrow-left"
          >
            Cancel
          </Button>
          <Button
            intent={Intent.SUCCESS}
            onClick={handleSubmit}
            disabled={invalid || submitting}
            iconName="add"
          >
            Add Permission
          </Button>
        </div>
      </div>
    </Dialog>
  );

const validationSpec: Spec<AddPermissionDialogData> = {
  username: (username) => {
    if (!username)
      return 'This field is required';

    if (username.length < 3)
      return 'Must be at least 3 characters long';

    if (username.length > 256)
      return 'Must be at most 256 characters long';

    return undefined;
  },
};

const AddPermissionDialogForm: React.SFC<AddPermissionDialogStateProps & AddPermissionDialogDispatchProps> =
  reduxForm<
    AddPermissionDialogData,
    AddPermissionDialogStateProps & AddPermissionDialogDispatchProps,
    ApplicationState
  >({
    form: 'add-permission-form',
    validate: validate(validationSpec),
    onSubmit: async (values, dispatch, props): Promise<void> => {
      try {
        await props.confirm(values.username);
        props.close();
      } catch (err) {
        throw new SubmissionError({ reason: 'Unexpected response from the server' });
      }
    },
  })(AddPermissionDialogComponent);

const mapStateToProps = (state: ApplicationState): AddPermissionDialogStateProps => ({
  permission: state.members.dialogs.add.permission,
  isOpen: state.members.dialogs.add.isOpen,
  isDarkMode: state.settings.isDarkMode,
});

const mapDispatchToProps = (dispatch: Dispatch<ApplicationState>): AddPermissionDialogDispatchProps => ({
  close: (): void => {
    dispatch(MembersActions.closeAddPermissionDialog());
  },
  confirm: (username: string): Promise<void> => {
    dispatch(MembersActions.closeAddPermissionDialog());
    return dispatch(MembersActions.addPermission(username));
  },
});

export const AddPermissionDialog: React.ComponentClass =
  connect<AddPermissionDialogStateProps, AddPermissionDialogDispatchProps, {}>(
    mapStateToProps,
    mapDispatchToProps,
  )(AddPermissionDialogForm);
