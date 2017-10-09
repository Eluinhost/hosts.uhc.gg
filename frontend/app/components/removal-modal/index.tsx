import * as React from 'react';
import { Button, Classes, Dialog, Intent } from '@blueprintjs/core';
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
  & StateProps
  & DispatchProps
  & FormProps<RemovalModalData, {}, ApplicationState>> {
  public render() {
    const { id, isDarkMode, onClose, handleSubmit, submitting, invalid } = this.props;

    return (
      <Dialog
        iconName="delete"
        isOpen={id !== null}
        onClose={close}
        title="Remove match"
        className={isDarkMode ? Classes.DARK : ''}
      >
        <div className={`${Classes.DIALOG_BODY} remove-modal-body`}>
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
        <div className={`${Classes.DIALOG_FOOTER}`}>
          <div className={`${Classes.DIALOG_FOOTER_ACTIONS}`}>
            <Button
              onClick={onClose}
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
  }
}

const validator = new Validator<RemovalModalData>()
  .withValidationFunction('reason', (reason) => {
    if (!reason)
      return 'This field is required';

    if (reason.length < 3)
      return 'Must be at least 3 characters long';

    if (reason.length > 256)
      return 'Must be at most 256 characters long';

    return undefined;
  });

const RemovalModalWithForm: React.ComponentClass<StateProps & DispatchProps> =
  reduxForm<RemovalModalData, StateProps & DispatchProps, ApplicationState>({
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

export const RemovalModal: React.ComponentClass = connect<StateProps, DispatchProps, {}>(
  stateSelector,
  dispatch,
)(RemovalModalWithForm);
