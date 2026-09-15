import { Button, Classes, Dialog, H5, Intent } from '@blueprintjs/core';
import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createSelector } from 'reselect';

import { ApproveMatch } from '../../actions';
import type { ApplicationState } from '../../state/ApplicationState';
import { isDarkMode } from '../../state/Selectors';

const approvalModalSelector = createSelector(
  (state: ApplicationState) => state.matchModeration.approvalModalId,
  isDarkMode,
  (id, isDarkMode) => ({ id, isDarkMode }),
);

export const ApprovalModal: React.FC = () => {
  const { id, isDarkMode } = useSelector(approvalModalSelector);
  const dispatch = useDispatch();

  const onClose = useCallback(() => dispatch(ApproveMatch.closeDialog()), [dispatch]);
  const onConfirm = useCallback(() => {
    if (id !== null) {
      dispatch(ApproveMatch.start({ id }));
    }
  }, [dispatch, id]);

  return (
    <Dialog
      icon="tick"
      isOpen={id !== null}
      onClose={onClose}
      title="Approve match"
      className={isDarkMode ? Classes.DARK : ''}
    >
      <div className={`${Classes.DIALOG_BODY} remove-modal-body`}>
        <H5>Are you sure you want to approve this match?</H5>
      </div>
      <div className={Classes.DIALOG_FOOTER}>
        <div className={Classes.DIALOG_FOOTER_ACTIONS}>
          <Button onClick={onClose} icon="arrow-left" text="Cancel" />
          <Button intent={Intent.SUCCESS} onClick={onConfirm} icon="tick" text="Confirm Approval" />
        </div>
      </div>
    </Dialog>
  );
};
