import { Button, Stack, Group, Modal, Title, Loader, Badge, Textarea, type MantineColor, Card } from '@mantine/core';
import { CaretDownIcon, CaretUpIcon, XIcon, CheckIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import React, { useCallback, useMemo, useState } from 'react';

import dayjs from '@/dayjs';
import { HostApplicationsData } from '@/hosting-applications/api';
import { type HostApplication, HostApplicationStatus } from '@/hosting-applications/HostApplication';

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

  const intent = useMemo((): MantineColor => {
    if (application.status === HostApplicationStatus.APPROVED) return 'green';
    if (application.status === HostApplicationStatus.DECLINED) return 'red';
    return 'yellow';
  }, [application.status]);

  return (
    <Card withBorder style={isOwn ? { marginBottom: 15, borderLeft: '4px solid #2B95D6' } : { marginBottom: 15 }}>
      <Title order={4}>
        /u/{application.username} <Badge color={intent}>{application.status}</Badge>{' '}
        {isOwn && <Badge>Your application</Badge>}
      </Title>
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
          leftSection={isExpanded ? <CaretUpIcon /> : <CaretDownIcon />}
          onClick={() => {
            setIsExpanded(prev => !prev);
          }}
        >
          {isExpanded ? 'Hide answers' : 'View answers'}
        </Button>
      </div>

      {isExpanded && (
        <>
          {isFetching && <Loader size={20} />}
          {error && <p>{error.message}</p>}
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
                            <Badge color={answer.choiceCorrect ? 'green' : 'red'}>
                              {answer.choiceCorrect ? 'correct' : 'incorrect'}
                            </Badge>
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
            color="green"
            leftSection={<CheckIcon />}
            loading={isReviewing}
            onClick={() => {
              void review({ id: application.id, decision: 'approve' });
            }}
          >
            Approve
          </Button>
          <Button color="red" leftSection={<XIcon />} loading={isReviewing} onClick={openDeclineDialog}>
            Decline
          </Button>
        </div>
      )}

      <Modal opened={isDeclineDialogOpen} title="Decline application" onClose={closeDeclineDialog}>
        <Stack>
          <p>Please provide a reason for declining this application. This will be visible to the applicant.</p>
          <Textarea
            autosize
            value={declineReason}
            onChange={e => {
              setDeclineReason(e.target.value);
            }}
            placeholder="Reason for declining"
          />
          <Group justify="end">
            <Button onClick={closeDeclineDialog}>Cancel</Button>
            <Button
              color="red"
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
          </Group>
        </Stack>
      </Modal>
    </Card>
  );
};
