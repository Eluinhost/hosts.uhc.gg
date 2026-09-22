import { Button, Classes, Dialog, H5, Intent } from '@blueprintjs/core';
import { ArrowLeftIcon, TickIcon } from '@blueprintjs/icons';
import { useAtomValue } from 'jotai';
import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { ApproveMatch } from '../../actions';
import { isDarkModeAtom } from '../../atoms/isDarkMode';
import type { ApplicationState } from '../../state/ApplicationState';

export const ApprovalModal: React.FC = () => {
  const id = useSelector((state: ApplicationState) => state.matchModeration.approvalModalId);
  const isDarkMode = useAtomValue(isDarkModeAtom);
  const dispatch = useDispatch();

  const onClose = useCallback(() => dispatch(ApproveMatch.closeDialog()), [dispatch]);
  const onConfirm = useCallback(() => {
    if (id !== null) {
      dispatch(ApproveMatch.start({ id }));
    }
  }, [dispatch, id]);

  return (
    <Dialog
      icon={<TickIcon />}
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
          <Button onClick={onClose} icon={<ArrowLeftIcon />} text="Cancel" />
          <Button intent={Intent.SUCCESS} onClick={onConfirm} icon={<TickIcon />} text="Confirm Approval" />
        </div>
      </div>
    </Dialog>
  );
};
