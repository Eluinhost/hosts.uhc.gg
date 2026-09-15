import { Button, Classes, ControlGroup, Dialog, H5, Intent } from '@blueprintjs/core';
import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Dispatch } from 'redux';
import { InjectedFormProps, reduxForm } from 'redux-form';
import { createSelector } from 'reselect';

import { RemoveMatch } from '../../actions';
import { Validator } from '../../services/Validator';
import { ApplicationState } from '../../state/ApplicationState';
import { isDarkMode } from '../../state/Selectors';
import { TextField } from '../fields/TextField';

type RemovalModalData = {
  reason: string;
};

type RemovalModalProps = {
  readonly id: number | null;
  readonly isDarkMode: boolean;
};

const stateSelector = createSelector(
  (state: ApplicationState) => state.matchModeration.removalModalId,
  isDarkMode,
  (id, isDarkMode) => ({ id, isDarkMode }),
);

const validator = new Validator<RemovalModalData>().withValidationFunction('reason', reason => {
  if (!reason) return 'This field is required';

  if (reason.length < 3) return 'Must be at least 3 characters long';

  if (reason.length > 256) return 'Must be at most 256 characters long';

  return undefined;
});

const RemovalModalComponent: React.FunctionComponent<
  RemovalModalProps & InjectedFormProps<RemovalModalData, RemovalModalProps>
> = ({ handleSubmit, submitting, invalid, id, isDarkMode }) => {
  const dispatch = useDispatch();

  const onClose = useCallback(() => dispatch(RemoveMatch.closeDialog()), [dispatch]);

  return (
    <Dialog
      icon="delete"
      isOpen={id !== null}
      onClose={onClose}
      title="Remove match"
      className={isDarkMode ? Classes.DARK : ''}
    >
      <div className={`${Classes.DIALOG_BODY} remove-modal-body`}>
        <form onSubmit={handleSubmit}>
          <ControlGroup fill>
            <TextField name="reason" label="Reason" required disabled={submitting} />
          </ControlGroup>
          <H5>This cannot be undone once confirmed</H5>
        </form>
      </div>
      <div className={Classes.DIALOG_FOOTER}>
        <div className={Classes.DIALOG_FOOTER_ACTIONS}>
          <Button onClick={onClose} icon="arrow-left">
            Cancel
          </Button>
          <Button intent={Intent.DANGER} onClick={handleSubmit} disabled={invalid || submitting} icon="delete">
            Confirm Removal
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

const RemovalModalForm = reduxForm<RemovalModalData, RemovalModalProps>({
  form: RemoveMatch.formId,
  validate: validator.validate,
  onSubmit: (values: RemovalModalData, dispatch: Dispatch, props: RemovalModalProps): void => {
    if (props.id !== null) {
      dispatch(RemoveMatch.start({ id: props.id, reason: values.reason }));
    }
  },
})(RemovalModalComponent);

export const RemovalModal: React.ComponentType = () => {
  const state = useSelector(stateSelector);
  return <RemovalModalForm {...state} />;
};
