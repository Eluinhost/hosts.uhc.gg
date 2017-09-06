import * as React from 'react';
import { Button, Dialog, Intent } from '@blueprintjs/core';
import { FormProps, reduxForm, SubmissionError } from 'redux-form';
import { ApplicationState } from '../../state/ApplicationState';

type ApprovalModalData = {};

type DispatchProps = {
  readonly close: () => void;
  readonly confirm: () => Promise<void>;
};

type StateProps = {
  readonly isOpen: boolean;
  readonly isDarkMode: boolean;
};

const ApprovalModalComponent:
  React.SFC<StateProps & DispatchProps & FormProps<ApprovalModalData, {}, ApplicationState>> =
  ({ handleSubmit, submitting, invalid, close, isOpen, isDarkMode }) => (
    <Dialog
      iconName="tick"
      isOpen={isOpen}
      onClose={close}
      title="Approve match"
      className={isDarkMode ? 'pt-dark' : ''}
    >
      <div className="pt-dialog-body remove-modal-body">
        <form onSubmit={handleSubmit}>
          <h5>Are you sure you want to approve this match?</h5>
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
            disabled={submitting}
            iconName="tick"
          >
            Confirm Approval
          </Button>
        </div>
      </div>
    </Dialog>
  );

export const ApprovalModal: React.SFC<StateProps & DispatchProps> =
  reduxForm<StateProps, DispatchProps, ApplicationState>({
    form: 'approval-confirmer',
    onSubmit: (values, dispatch, props): Promise<void> =>
      props.confirm()
        .then(() => props.close())
        .catch(() => Promise.reject(
          new SubmissionError({ reason: 'Unexpected response from the server' }),
        )),
  })(ApprovalModalComponent);
