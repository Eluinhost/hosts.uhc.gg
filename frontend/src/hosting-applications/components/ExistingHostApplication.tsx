import * as React from 'react';
import moment from 'moment-timezone';
import { Button, Classes, Dialog, H4, Intent, Spinner, Tag, TextArea } from '@blueprintjs/core';
import { HostApplication } from '../../models/HostApplication';
import { useCallback, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { HostApplications } from '../actions';
import { createSelector } from 'reselect';
import {
  getHostApplicationsDetailsState,
  getHostApplicationsReviewingState,
} from '../selectors';
import { HostApplicationDetailsState } from '../reducer';
import { ApplicationState } from '../../state/ApplicationState';

interface ExistingHostApplicationProps {
  application: HostApplication;
  canReview: boolean;
  isOwn: boolean;
}

const selector = createSelector(
  (state: ApplicationState, id: number): HostApplicationDetailsState | undefined =>
    getHostApplicationsDetailsState(state)[id],
  details => details,
);

export const ExistingHostApplication = React.memo(function ExistingHostApplication({
  application,
  canReview,
  isOwn,
}: ExistingHostApplicationProps) {
  const dispatch = useDispatch();
  const detailsState = useSelector(state => selector(state, application.id));
  const { isFetching: isReviewing } = useSelector(
    getHostApplicationsReviewingState,
  );

  const [isExpanded, setIsExpanded] = useState(false);
  const [isDeclineDialogOpen, setIsDeclineDialogOpen] = useState(false);
  const [declineReason, setDeclineReason] = useState('');

  const toggleExpanded = useCallback(() => {
    setIsExpanded(!isExpanded);

    // expanded when called, skip api call
    if (isExpanded) {
      return;
    }

    dispatch(HostApplications.fetch.individual.start(application.id));
  }, [isExpanded, dispatch, application.id]);

  const handleReviewed = useCallback(() => {
    setDeclineReason('');
    setIsDeclineDialogOpen(false);
    setIsExpanded(false);
  }, []);

  const handleApprove = useCallback(
    () => dispatch(HostApplications.respond.start({ id: application.id, status: 'approve', onSuccess: handleReviewed })),
    [application.id, handleReviewed, dispatch],
  );
  const handleReject = useCallback(
    () =>
      dispatch(HostApplications.respond.start({ id: application.id, status: 'decline', rejectReason: declineReason, onSuccess: handleReviewed })),
    [application.id, declineReason, handleReviewed, dispatch],
  );

  const handleDeclineReasonChange = useCallback(
    (evt: React.ChangeEvent<HTMLTextAreaElement>) => setDeclineReason(evt.target.value),
    [],
  );

  const openDeclineDialog = useCallback(() => {
    setDeclineReason('');
    setIsDeclineDialogOpen(true);
  }, []);

  const closeDeclineDialog = useCallback(() => setIsDeclineDialogOpen(false), []);

  const intent = useMemo((): Intent => {
    if (application.status === 'approved') return Intent.SUCCESS;
    if (application.status === 'declined') return Intent.DANGER;
    return Intent.WARNING;
  }, [application.status]);

  return (
    <div
      className={`${Classes.CARD} ${Classes.ELEVATION_1}`}
      style={isOwn ? { marginBottom: 15, borderLeft: '4px solid #2B95D6' } : { marginBottom: 15 }}
    >
      <H4>
        /u/{application.username} <Tag intent={intent}>{application.status}</Tag>{' '}
        {isOwn && <Tag intent={Intent.PRIMARY}>Your application</Tag>}
      </H4>
      <small>{moment.utc(application.created).format('MMM Do YYYY, HH:mm z')}</small>
      {application.reviewedBy && (
        <p>
          Reviewed by /u/{application.reviewedBy}
          {application.reviewedAt && ` on ${moment.utc(application.reviewedAt).format('MMM Do YYYY, HH:mm z')}`}
        </p>
      )}
      {application.status === 'declined' && application.reviewReason && (
        <p>
          <strong>Reason:</strong> {application.reviewReason}
        </p>
      )}

      <div style={{ marginTop: 10 }}>
        <Button minimal icon={isExpanded ? 'chevron-up' : 'chevron-down'} onClick={toggleExpanded}>
          {isExpanded ? 'Hide answers' : 'View answers'}
        </Button>
      </div>

      {isExpanded && detailsState && (
        <>
          {detailsState.isFetching && <Spinner size={20} />}
          {detailsState.error && <p className={Classes.TEXT_MUTED}>{detailsState.error}</p>}
          {detailsState.data && (
            <div style={{ marginTop: 10 }}>
              {detailsState.data.answers.map((answer, index) => (
                <div key={index} style={{ marginBottom: 10 }}>
                  <strong>{answer.questionPrompt}</strong>
                  <p>
                    {answer.questionType === 'multiple choice' ? (
                      <>
                        {answer.choiceText}
                        {canReview && answer.choiceCorrect !== null && (
                          <>
                            {' '}
                            <Tag intent={answer.choiceCorrect ? Intent.SUCCESS : Intent.DANGER}>
                              {answer.choiceCorrect ? 'correct' : 'incorrect'}
                            </Tag>
                          </>
                        )}
                      </>
                    ) : (
                      answer.textAnswer
                    )}
                  </p>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {canReview && application.status === 'pending' && (
        <div style={{ marginTop: 10, display: 'flex', gap: 10 }}>
          <Button intent={Intent.SUCCESS} icon="tick" loading={isReviewing} onClick={handleApprove}>
            Approve
          </Button>
          <Button intent={Intent.DANGER} icon="cross" loading={isReviewing} onClick={openDeclineDialog}>
            Decline
          </Button>
        </div>
      )}

      <Dialog isOpen={isDeclineDialogOpen} title="Decline application" onClose={closeDeclineDialog}>
        <div className={Classes.DIALOG_BODY}>
          <p>Please provide a reason for declining this application. This will be visible to the applicant.</p>
          <TextArea
            fill
            growVertically
            value={declineReason}
            onChange={handleDeclineReasonChange}
            placeholder="Reason for declining"
          />
        </div>
        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <Button onClick={closeDeclineDialog}>Cancel</Button>
            <Button
              intent={Intent.DANGER}
              loading={isReviewing}
              disabled={declineReason.trim().length === 0}
              onClick={handleReject}
            >
              Decline
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
});
