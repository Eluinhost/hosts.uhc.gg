import * as React from 'react';
import { FormProps, reduxForm, SubmissionError } from 'redux-form';
import { ApplicationState } from '../../state/ApplicationState';
import { Button, Dialog, Intent } from '@blueprintjs/core';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { RemovePermissionDialogState } from '../../state/PermissionsState';
import { If } from '../If';
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
  RemovePermissionDialogStateProps & RemovePermissionDialogDispatchProps & FormProps<{}, {}, ApplicationState>
> = ({ close, state, submitting, invalid, handleSubmit, error, isDarkMode }) => (
  <Dialog
    iconName="remove"
    isOpen={!!state}
    onClose={close}
    title="Remove role"
    className={isDarkMode ? 'pt-dark' : ''}
  >
    <div className="pt-dialog-body remove-permission-body">
      <h5>
        Are you sure you want to remove '{state ? state.permission : '...'}' from /u/{state ? state.username : '...'}
      </h5>
      <If condition={!!error}>
        <span className="pt-intent-danger pt-callout">{error}</span>
      </If>
    </div>
    <div className="pt-dialog-footer">
      <div className="pt-dialog-footer-actions">
        <Button onClick={close} iconName="arrow-left">
          Cancel
        </Button>
        <Button intent={Intent.DANGER} onClick={handleSubmit} disabled={submitting || invalid} iconName="remove">
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
