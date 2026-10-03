import { Button, Alert, Stack, Title, EmptyState, Loader } from '@mantine/core';
import { ProhibitIcon, QuestionIcon, CheckCircleIcon, CheckIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { useAtomValue } from 'jotai';
import React from 'react';

import { isHostAtom, isHostingBannedAtom, isTrialHostAtom } from '@/authentication/atoms/authentication';
import { HostApplicationsData } from '@/hosting-applications/api';
import { HostApplicationForm } from '@/hosting-applications/components/HostApplicationForm';
import { QuizQuestionsData } from '@/hosting-applications/questions/api';

export const ApplyHostApplicationPage: React.FC = () => {
  const { error, data, isFetching } = useQuery(QuizQuestionsData.getQuestions);
  const { isSuccess } = HostApplicationsData.mutations.useCreateHostApplication();

  const isBanned = useAtomValue(isHostingBannedAtom);
  const isTrialHost = useAtomValue(isTrialHostAtom);
  const isHost = useAtomValue(isHostAtom);

  if (isBanned) {
    return (
      <EmptyState
        icon={<ProhibitIcon />}
        title="You cannot apply"
        description="You are banned from hosting and cannot submit an application."
      >
        <Link to="/host-applications">
          <Button>Back to Host Applications</Button>
        </Link>
      </EmptyState>
    );
  }

  if (isTrialHost || isHost) {
    return (
      <EmptyState icon={<CheckCircleIcon />} title="You don't need to apply" description="You're already a host">
        <Link to="/host-applications">
          <Button>Back to Host Applications</Button>
        </Link>
      </EmptyState>
    );
  }

  if (isSuccess) {
    return (
      <EmptyState
        icon={<CheckIcon />}
        title="Application submitted"
        description="Head back to Host Applications to check on its status."
      >
        <Link to="/host-applications">
          <Button>Back to Host Applications</Button>
        </Link>
      </EmptyState>
    );
  }

  return (
    <Stack>
      <title>uhc.gg | Apply to Host</title>
      <Title order={1}>Apply to Host</Title>

      {error && <Alert color="red" title={error.message} />}

      {isFetching ? (
        <Loader />
      ) : !data || data.length === 0 ? (
        <EmptyState icon={<QuestionIcon />} title="No quiz questions have been configured yet" />
      ) : (
        <HostApplicationForm questions={data} />
      )}
    </Stack>
  );
};
