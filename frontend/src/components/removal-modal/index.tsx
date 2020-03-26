import * as React from 'react';
import { Button, Classes, ControlGroup, Dialog, H5, Intent } from "@blueprintjs/core";
import { FormProps, reduxForm } from 'redux-form';
import { ApplicationState } from '../../state/ApplicationState';
import { SuggestionsField } from '../fields/SuggestionsField';
import { RemoveMatch } from '../../actions';
import { connect, Dispatch } from 'react-redux';
import { createSelector } from 'reselect';
import { isDarkMode } from '../../state/Selectors';
import { Validator } from '../../services/Validator';

type RemovalModalData = {
  reason: string;
};

type StateProps = {
  readonly id: number | null;
  readonly isDarkMode: boolean;
};

type DispatchProps = {
  readonly onConfirm: (id: number, reason: string) => void;
  readonly onClose: () => void;
};

class RemovalModalComponent extends React.PureComponent<
  StateProps & DispatchProps & FormProps<RemovalModalData, StateProps & DispatchProps, ApplicationState>
> {
  public render() {
    const { id, isDarkMode, onClose, handleSubmit, submitting, invalid } = this.props;

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
              <SuggestionsField
                name="reason"
                label="Reason"
                required
                disabled={submitting}
                suggestions={['Missing scenario descriptions']}
                suggestionText="Select a preset"
              />
            </ControlGroup>
            <H5>This cannot be undone once confirmed</H5>
          </form>
        </div>
        <div className={`${Classes.DIALOG_FOOTER}`}>
          <div className={`${Classes.DIALOG_FOOTER_ACTIONS}`}>
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
  }
}

const validator = new Validator<RemovalModalData>().withValidationFunction('reason', reason => {
  if (!reason) return 'This field is required';

  if (reason.length < 3) return 'Must be at least 3 characters long';

  if (reason.length > 256) return 'Must be at most 256 characters long';

  return undefined;
});

const RemovalModalWithForm: React.ComponentClass<StateProps & DispatchProps> = reduxForm<
  RemovalModalData,
  StateProps & DispatchProps,
  ApplicationState
>({
  form: RemoveMatch.formId,
  validate: validator.validate,
  onSubmit: (values, dispatch, props): void => {
    props.onConfirm(props.id!, values.reason);
  },
})(RemovalModalComponent);

const stateSelector = createSelector<ApplicationState, number | null, boolean, StateProps>(
  state => state.matchModeration.removalModalId,
  isDarkMode,
  (id, isDarkMode) => ({ id, isDarkMode }),
);

const dispatch = (dispatch: Dispatch<ApplicationState>): DispatchProps => ({
  onClose: () => dispatch(RemoveMatch.closeDialog()),
  onConfirm: (id: number, reason: string) => dispatch(RemoveMatch.start({ id, reason })),
});

export const RemovalModal: React.ComponentClass = connect<StateProps, DispatchProps, {}>(stateSelector, dispatch)(
  RemovalModalWithForm,
);
