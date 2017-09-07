import * as React from 'react';
import { Button, Dialog, Intent } from '@blueprintjs/core';
import { FormProps, reduxForm, SubmissionError } from 'redux-form';
import { ApplicationState } from '../../state/ApplicationState';
import { SuggestionsField } from '../fields/SuggestionsField';
import { Spec, validate } from '../../validate';

type RemovalModalData = {
  reason: string;
};

type RemovalModalDispatchProps = {
  readonly close: () => void;
  readonly confirm: (reason: string) => Promise<void>;
};

type RemovalModalStateProps = {
  readonly isOpen: boolean;
  readonly isDarkMode: boolean;
};

const RemovalModalComponent:
  React.SFC<RemovalModalStateProps & RemovalModalDispatchProps & FormProps<RemovalModalData, {}, ApplicationState>> =
  ({ handleSubmit, submitting, invalid, close, isOpen, isDarkMode, change }) => (
    <Dialog
      iconName="delete"
      isOpen={isOpen}
      onClose={close}
      title="Remove match"
      className={isDarkMode ? 'pt-dark' : ''}
    >
      <div className="pt-dialog-body remove-modal-body">
        <form onSubmit={handleSubmit}>
          <div className="pt-control-group pt-fill">
            <SuggestionsField
              name="reason"
              label="Reason"
              required
              disabled={submitting}
              suggestions={['Missing scenario descriptions']}
              suggestionText="Select a preset"
            />
          </div>
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

const validationSpec: Spec<RemovalModalData> = {
  reason: (reason) => {
    if (!reason)
      return 'This field is required';

    if (reason.length < 3)
      return 'Must be at least 3 characters long';

    if (reason.length > 256)
      return 'Must be at most 256 characters long';

    return undefined;
  },
};

export const RemovalModal: React.SFC<RemovalModalStateProps & RemovalModalDispatchProps> =
  reduxForm<RemovalModalData, RemovalModalStateProps & RemovalModalDispatchProps, ApplicationState>({
    form: 'removal-reason',
    validate: validate(validationSpec),
    onSubmit: (values, dispatch, props): Promise<void> =>
      props.confirm(values.reason)
        .then(() => props.close())
        .catch(() => Promise.reject(
          new SubmissionError({ reason: 'Unexpected response from the server' }),
        )),
  })(RemovalModalComponent);
