import * as React from 'react';
import { FormProps, reduxForm, SubmissionError } from 'redux-form';
import { ApplicationState } from '../../state/ApplicationState';
import { Button, Callout, Classes, Dialog, H5, Intent } from "@blueprintjs/core";
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { RemovePermissionDialogState } from '../../state/PermissionsState';
import { RemovePermission } from '../../actions';

type RemovePermissionDialogDispatchProps = {
  readonly close: () => void;
  readonly confirm: () => void;
};

type RemovePermissionDialogStateProps = {
  readonly state: RemovePermissionDialogState | null;
  readonly isDarkMode: boolean;
};

const RemovePermissionDialogComponent: React.SFC<
  RemovePermissionDialogStateProps & RemovePermissionDialogDispatchProps & FormProps<{}, RemovePermissionDialogStateProps & RemovePermissionDialogDispatchProps, ApplicationState>
> = ({ close, state, submitting, invalid, handleSubmit, error, isDarkMode }) => (
  <Dialog icon="remove" isOpen={!!state} onClose={close} title="Remove role" className={isDarkMode ? Classes.DARK : ''}>
    <div className={`${Classes.DIALOG_BODY} remove-permission-body`}>
      <H5>
        Are you sure you want to remove '{state ? state.permission : '...'}' from /u/{state ? state.username : '...'}
      </H5>
      {!!error && <Callout intent={Intent.DANGER}>{error}</Callout>}
    </div>
    <div className={Classes.DIALOG_FOOTER}>
      <div className={Classes.DIALOG_FOOTER_ACTIONS}>
        <Button onClick={close} icon="arrow-left">
          Cancel
        </Button>
        <Button intent={Intent.DANGER} onClick={handleSubmit} disabled={submitting || invalid} icon="remove">
          Remove permission
        </Button>
      </div>
    </div>
  </Dialog>
);

const RemovePermissionDialogForm: React.SFC<
  RemovePermissionDialogStateProps & RemovePermissionDialogDispatchProps
> = reduxForm<{}, RemovePermissionDialogStateProps & RemovePermissionDialogDispatchProps, ApplicationState>({
  form: 'remove-permission-form',
  onSubmit: async (values, dispatch, props): Promise<void> => {
    try {
      await props.confirm();
      props.close();
    } catch (err) {
      throw new SubmissionError({ __error: 'Unexpected response from the server' });
    }
  },
})(RemovePermissionDialogComponent);

const mapStateToProps = (state: ApplicationState): RemovePermissionDialogStateProps => ({
  state: state.permissions.removeDialog,
  isDarkMode: state.settings.isDarkMode,
});

const mapDispatchToProps = (dispatch: Dispatch<ApplicationState>): RemovePermissionDialogDispatchProps => ({
  close: () => dispatch(RemovePermission.closeDialog()),
  confirm: () => dispatch(RemovePermission.start()),
});

export const RemovePermissionDialog: React.ComponentClass = connect<
  RemovePermissionDialogStateProps,
  RemovePermissionDialogDispatchProps,
  {}
>(mapStateToProps, mapDispatchToProps)(RemovePermissionDialogForm);
