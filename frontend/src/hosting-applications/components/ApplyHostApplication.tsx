import { Button, Alert, Stack, Title, EmptyState, Loader } from '@mantine/core';
import { ProhibitIcon, QuestionIcon, CheckCircleIcon, CheckIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { useAtomValue } from 'jotai';
import React from 'react';
import { Link } from 'react-router';

import { isHostingBannedAtom } from '../../atoms/authentication';
import { HostApplicationsData } from '../api';
import { canApplyToHostAtom } from '../atoms';
import { QuizQuestionsData } from '../questions/api';

import { HostApplicationForm } from './HostApplicationForm';

export const ApplyHostApplicationPage: React.FC = () => {
  const { error, data, isFetching } = useQuery(QuizQuestionsData.getQuestions);
  const canApply = useAtomValue(canApplyToHostAtom);
  const isBanned = useAtomValue(isHostingBannedAtom);
  const { isSuccess } = HostApplicationsData.mutations.useCreateHostApplication();

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

  if (!canApply) {
    return (
      <EmptyState
        icon={<CheckCircleIcon />}
        title="You don't need to apply"
        description="You're already a host, or you're not logged in."
      >
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
