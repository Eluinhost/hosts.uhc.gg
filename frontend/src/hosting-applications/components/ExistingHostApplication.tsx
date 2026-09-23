import { Button, Classes, Dialog, H4, Intent, Spinner, Tag, TextArea } from '@blueprintjs/core';
import { ChevronDownIcon, ChevronUpIcon, CrossIcon, TickIcon } from '@blueprintjs/icons';
import { useQuery } from '@tanstack/react-query';
import React, { useCallback, useMemo, useState } from 'react';

import dayjs from '../../dayjs';
import { HostApplicationsData } from '../api';
import { type HostApplication, HostApplicationStatus } from '../HostApplication';

interface ExistingHostApplicationProps {
  application: HostApplication;
  canReview: boolean;
  isOwn: boolean;
}

export const ExistingHostApplication: React.FC<ExistingHostApplicationProps> = ({ application, canReview, isOwn }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDeclineDialogOpen, setIsDeclineDialogOpen] = useState(false);
  const [declineReason, setDeclineReason] = useState('');

  const { data, isFetching, error } = useQuery({
    enabled: isExpanded,
    ...HostApplicationsData.getById(application.id),
  });
  const { mutateAsync: review, isPending: isReviewing } = HostApplicationsData.mutations.useReviewHostApplication();

  const openDeclineDialog = useCallback(() => {
    setDeclineReason('');
    setIsDeclineDialogOpen(true);
  }, []);

  const closeDeclineDialog = useCallback(() => {
    setIsDeclineDialogOpen(false);
  }, []);

  const intent = useMemo((): Intent => {
    if (application.status === HostApplicationStatus.APPROVED) return Intent.SUCCESS;
    if (application.status === HostApplicationStatus.DECLINED) return Intent.DANGER;
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
      <small>{dayjs.utc(application.created).format('MMM Do YYYY, HH:mm z')}</small>
      {application.reviewedBy && (
        <p>
          Reviewed by /u/{application.reviewedBy}
          {application.reviewedAt && ` on ${dayjs.utc(application.reviewedAt).format('MMM Do YYYY, HH:mm z')}`}
        </p>
      )}
      {application.status === HostApplicationStatus.DECLINED && application.reviewReason && (
        <p>
          <strong>Reason:</strong> {application.reviewReason}
        </p>
      )}

      <div style={{ marginTop: 10 }}>
        <Button
          variant="minimal"
          icon={isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
          onClick={() => {
            setIsExpanded(prev => !prev);
          }}
        >
          {isExpanded ? 'Hide answers' : 'View answers'}
        </Button>
      </div>

      {isExpanded && (
        <>
          {isFetching && <Spinner size={20} />}
          {error && <p className={Classes.TEXT_MUTED}>{error.message}</p>}
          {data && (
            <div style={{ marginTop: 10 }}>
              {data.answers.map((answer, index) => (
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

      {canReview && application.status === HostApplicationStatus.PENDING && (
        <div style={{ marginTop: 10, display: 'flex', gap: 10 }}>
          <Button
            intent={Intent.SUCCESS}
            icon={<TickIcon />}
            loading={isReviewing}
            onClick={() => {
              void review({ id: application.id, decision: 'approve' });
            }}
          >
            Approve
          </Button>
          <Button intent={Intent.DANGER} icon={<CrossIcon />} loading={isReviewing} onClick={openDeclineDialog}>
            Decline
          </Button>
        </div>
      )}

      <Dialog isOpen={isDeclineDialogOpen} title="Decline application" onClose={closeDeclineDialog}>
        <div className={Classes.DIALOG_BODY}>
          <p>Please provide a reason for declining this application. This will be visible to the applicant.</p>
          <TextArea
            fill
            value={declineReason}
            onChange={e => {
              setDeclineReason(e.target.value);
            }}
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
              onClick={() => {
                void review({ id: application.id, decision: 'decline', reason: declineReason });
                setDeclineReason('');
                setIsDeclineDialogOpen(false);
                setIsExpanded(false);
              }}
            >
              Decline
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
