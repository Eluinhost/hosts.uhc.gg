import * as React from 'react';
import { FormProps, reduxForm, SubmissionError } from 'redux-form';
import { ApplicationState } from '../../state/ApplicationState';
import { Button, Dialog, Intent } from '@blueprintjs/core';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { MembersActions } from '../../state/MembersState';
import { If } from '../If';

type RemovePermissionDialogDispatchProps = {
  readonly close: () => void;
  readonly confirm: () => Promise<void>;
};

type RemovePermissionDialogStateProps = {
  readonly isOpen: boolean;
  readonly permission: string;
  readonly username: string;
  readonly isDarkMode: boolean;
};

const RemovePermissionDialogComponent: React.SFC<
  RemovePermissionDialogStateProps &
  RemovePermissionDialogDispatchProps &
  FormProps<{}, {}, ApplicationState>> =
  ({ close, isOpen, permission, username, submitting, invalid, handleSubmit, error, isDarkMode }) => (
    <Dialog
      iconName="remove"
      isOpen={isOpen}
      onClose={close}
      title="Remove role"
      className={isDarkMode ? 'pt-dark' : ''}
    >
      <div className="pt-dialog-body remove-permission-body">
        <h5>Are you sure you want to remove '{permission}' from /u/{username}</h5>
        <If condition={!!error}>
          <span className="pt-intent-danger pt-callout">{error}</span>
        </If>
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
            intent={Intent.DANGER}
            onClick={handleSubmit}
            disabled={submitting || invalid}
            iconName="remove"
          >
            Remove permission
          </Button>
        </div>
      </div>
    </Dialog>
  );

const RemovePermissionDialogForm: React.SFC<RemovePermissionDialogStateProps & RemovePermissionDialogDispatchProps> =
  reduxForm<
    {},
    RemovePermissionDialogStateProps & RemovePermissionDialogDispatchProps,
    ApplicationState
  >({
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
  username: state.members.dialogs.remove.username,
  permission: state.members.dialogs.remove.permission,
  isOpen: state.members.dialogs.remove.isOpen,
  isDarkMode: state.settings.isDarkMode,
});

const mapDispatchToProps = (dispatch: Dispatch<ApplicationState>): RemovePermissionDialogDispatchProps => ({
  close: (): void => {
    dispatch(MembersActions.closeRemovePermissionDialog());
  },
  confirm: (): Promise<void> => {
    dispatch(MembersActions.closeRemovePermissionDialog());
    return dispatch(MembersActions.removePermission());
  },
});

export const RemovePermissionDialog: React.ComponentClass =
  connect<RemovePermissionDialogStateProps, RemovePermissionDialogDispatchProps, {}>(
    mapStateToProps,
    mapDispatchToProps,
  )(RemovePermissionDialogForm);
