import * as React from 'react';
import { FormProps, reduxForm, SubmissionError } from 'redux-form';
import { ApplicationState } from '../../state/ApplicationState';
import { Button, Classes, Dialog, Intent } from "@blueprintjs/core";
import { TextField } from '../fields/TextField';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { AddPermissionDialogState } from '../../state/PermissionsState';
import { AddPermission } from '../../actions';
import { Validator } from '../../services/Validator';

type AddPermissionDialogData = {
  username: string;
};

type AddPermissionDialogDispatchProps = {
  readonly close: () => void;
  readonly confirm: (usern: string) => void;
};

type AddPermissionDialogStateProps = {
  readonly state: AddPermissionDialogState | null;
  readonly isDarkMode: boolean;
};

const AddPermissionDialogComponent: React.FunctionComponent<
  AddPermissionDialogStateProps &
    AddPermissionDialogDispatchProps &
    FormProps<AddPermissionDialogData, AddPermissionDialogStateProps & AddPermissionDialogDispatchProps, ApplicationState>
> = ({ handleSubmit, submitting, invalid, close, state, isDarkMode }) => (
  <Dialog
    icon="add"
    isOpen={!!state}
    onClose={close}
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
        <Button onClick={close} icon="arrow-left">
          Cancel
        </Button>
        <Button intent={Intent.SUCCESS} onClick={handleSubmit} disabled={invalid || submitting} icon="add">
          Add Permission
        </Button>
      </div>
    </div>
  </Dialog>
);

const validator = new Validator<AddPermissionDialogData>().withValidationFunction('username', username => {
  if (!username) return 'This field is required';

  if (username.length < 3) return 'Must be at least 3 characters long';

  if (username.length > 256) return 'Must be at most 256 characters long';

  return undefined;
});

const AddPermissionDialogForm: React.FunctionComponent<AddPermissionDialogStateProps & AddPermissionDialogDispatchProps> = reduxForm<
  AddPermissionDialogData,
  AddPermissionDialogStateProps & AddPermissionDialogDispatchProps,
  ApplicationState
>({
  form: 'add-permission-form',
  validate: validator.validate,
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
  state: state.permissions.addDialog,
  isDarkMode: state.settings.isDarkMode,
});

const mapDispatchToProps = (dispatch: Dispatch<ApplicationState>): AddPermissionDialogDispatchProps => ({
  close: () => dispatch(AddPermission.closeDialog()),
  confirm: (username: string) => dispatch(AddPermission.start(username)),
});

export const AddPermissionDialog: React.ComponentClass = connect<
  AddPermissionDialogStateProps,
  AddPermissionDialogDispatchProps,
  {}
>(mapStateToProps, mapDispatchToProps)(AddPermissionDialogForm);
