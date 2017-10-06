import * as React from 'react';
import { Button, Classes, Dialog, Intent } from '@blueprintjs/core';
import { connect, Dispatch } from 'react-redux';
import { createSelector } from 'reselect';
import { ApplicationState } from '../../state/ApplicationState';
import { isDarkMode } from '../../state/Selectors';
import { ApproveMatch } from '../../actions';

type StateProps = {
  readonly id: number | null;
  readonly isDarkMode: boolean;
};

type DispatchProps = {
  readonly onClose: () => void;
  readonly onConfirm: (id: number) => void;
};

class ApprovalModalComponent extends React.PureComponent<StateProps & DispatchProps> {
  private onConfirm = () => {
    if (this.props.id !== null) {
      this.props.onConfirm(this.props.id);
    }
  }

  public render() {
    const { id, isDarkMode, onClose } = this.props;

    return (
      <Dialog
        iconName="tick"
        isOpen={id !== null}
        onClose={onClose}
        title="Approve match"
        className={isDarkMode ? Classes.DARK : ''}
      >
        <div className={`${Classes.DIALOG_BODY} remove-modal-body`}>
          <h5>Are you sure you want to approve this match?</h5>
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
              intent={Intent.SUCCESS}
              onClick={this.onConfirm}
              iconName="tick"
            >
              Confirm Approval
            </Button>
          </div>
        </div>
      </Dialog>
    );
  }
}

const stateSelector = createSelector<ApplicationState, number | null, boolean, StateProps>(
  state => state.matchModeration.approvalModalId,
  isDarkMode,
  (id, isDarkMode) => ({ id, isDarkMode }),
);

const dispatch = (dispatch: Dispatch<ApplicationState>): DispatchProps => ({
  onConfirm: (id: number) => dispatch(ApproveMatch.start({ id })),
  onClose: () => dispatch(ApproveMatch.closeDialog()),
});

export const ApprovalModal = connect<StateProps, DispatchProps, {}>(
  stateSelector,
  dispatch,
)(ApprovalModalComponent);
