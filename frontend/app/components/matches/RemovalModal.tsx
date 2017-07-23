import * as React from 'react';
import { Button, Intent, Overlay } from '@blueprintjs/core';
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
    <Overlay
      isOpen={isOpen}
      autoFocus
      canEscapeKeyClose
      canOutsideClickClose
      hasBackdrop
      inline={false}
      onClose={close}
    >
      <form className="pt-card pt-elevation-4 remove-match-modal" onSubmit={handleSubmit}>
        <h3>Are you sure you want to remove this game? This cannot be undone</h3>

        <TextField name="reason" label="Reason" required disabled={submitting} />

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
          Remove
        </Button>
      </form>
    </Overlay>
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
