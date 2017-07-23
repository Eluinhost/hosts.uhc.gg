import * as React from 'react';
import { Button, Dialog, Intent } from '@blueprintjs/core';
import { FormErrors, FormProps, reduxForm, SubmissionError } from 'redux-form';
import { ApplicationState } from '../../state/ApplicationState';
import { TextField } from '../fields/TextField';

type RemovalModalData = {
  reason: string;
};

type RemovalModalDispatchProps = {
  readonly close: () => any;
  readonly confirm: (reason: string) => Promise<any>;
};

type RemovalModalStateProps = {
  readonly isOpen: boolean;
};

const RemovalModalComponent:
  React.SFC<RemovalModalStateProps & RemovalModalDispatchProps & FormProps<RemovalModalData, {}, ApplicationState>> =
  ({ handleSubmit, submitting, invalid, close, isOpen }) => (
    <Dialog
      iconName="delete"
      isOpen={isOpen}
      onClose={close}
      title="Remove match"
      className="pt-dark"
    >
      <div className="pt-dialog-body remove-modal-body">
        <form onSubmit={handleSubmit}>
          <TextField name="reason" label="Reason" required disabled={submitting} className="pt-fill"/>
          <h5>This cannot be undone once confirmed</h5>
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
            intent={Intent.DANGER}
            onClick={handleSubmit}
            disabled={invalid || submitting}
            iconName="delete"
          >
            Confirm Removal
          </Button>
        </div>
      </div>
    </Dialog>
  );

export const RemovalModal: React.SFC<RemovalModalStateProps & RemovalModalDispatchProps> =
  reduxForm<RemovalModalData, RemovalModalStateProps & RemovalModalDispatchProps, ApplicationState>({
    form: 'removal-reason',
    validate: (values) => {
      const errors: FormErrors<RemovalModalData> = {};

      if (!values.reason)
        errors.reason = 'This field is required';
      else if (values.reason.length < 3)
        errors.reason = 'Must be at least 3 characters long';
      else if (values.reason.length > 256)
        errors.reason = 'Must be at most 256 characters long';

      return errors;
    },
    onSubmit: (values, dispatch, props) => props.confirm(values.reason)
      .then(() => props.close())
      .catch(() => Promise.reject(
        new SubmissionError({ reason: 'Unexpected response from the server' }),
      )),
  })(RemovalModalComponent);
