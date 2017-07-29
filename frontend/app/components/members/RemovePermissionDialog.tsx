import * as React from 'react';
import { FormProps, reduxForm, SubmissionError } from 'redux-form';
import { ApplicationState } from '../../state/ApplicationState';
import { Button, Dialog, Intent } from '@blueprintjs/core';
import { TextField } from '../fields/TextField';
import { Spec, validate } from '../../validate';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { MembersActions } from '../../state/MembersState';

type RemovePermissionDialogDispatchProps = {
  readonly close: () => void;
  readonly confirm: () => Promise<any>;
};

type RemovePermissionDialogStateProps = {
  readonly isOpen: boolean;
  readonly permission: string;
  readonly username: string;
};

const RemovePermissionDialogComponent: React.SFC<
  RemovePermissionDialogStateProps &
  RemovePermissionDialogDispatchProps &
  FormProps<{}, {}, ApplicationState>> =
  ({ close, isOpen, permission, username, submitting, invalid, handleSubmit, error }) => (
    <Dialog
      iconName="remove"
      isOpen={isOpen}
      onClose={close}
      title="Remove role"
      className="pt-dark"
    >
      <div className="pt-dialog-body remove-permission-body">
        <h5>Are you sure you want to remove '{permission}' from /u/{username}</h5>
        {error && <span className="pt-intent-danger pt-callout">{error}</span>}
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
    onSubmit: (values, dispatch, props) => props.confirm()
      .then(() => props.close())
      .catch(() => Promise.reject(
        new SubmissionError({ __error: 'Unexpected response from the server' }),
      )),
  })(RemovePermissionDialogComponent);

function mapStateToProps(state: ApplicationState): RemovePermissionDialogStateProps {
  return {
    username: state.members.dialogs.remove.username,
    permission: state.members.dialogs.remove.permission,
    isOpen: state.members.dialogs.remove.isOpen,
  };
}

function mapDispatchToProps(dispatch: Dispatch<ApplicationState>): RemovePermissionDialogDispatchProps {
  return {
    close: () => dispatch(MembersActions.closeRemovePermissionDialog()),
    confirm: () => {
      dispatch(MembersActions.closeRemovePermissionDialog());
      return dispatch(MembersActions.removePermission());
    },
  };
}

export const RemovePermissionDialog: React.ComponentClass =
  connect<RemovePermissionDialogStateProps, RemovePermissionDialogDispatchProps, {}>(
    mapStateToProps,
    mapDispatchToProps,
  )(RemovePermissionDialogForm);
