import { Button, Callout, H1, Intent, NonIdealState, Spinner } from '@blueprintjs/core';
import { BanCircleIcon, HelpIcon, TickCircleIcon, TickIcon } from '@blueprintjs/icons';
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
      <NonIdealState
        icon={<BanCircleIcon />}
        title="You cannot apply"
        description="You are banned from hosting and cannot submit an application."
        action={
          <Link to="/host-applications">
            <Button>Back to Host Applications</Button>
          </Link>
        }
      />
    );
  }

  if (!canApply) {
    return (
      <NonIdealState
        icon={<TickCircleIcon />}
        title="You don't need to apply"
        description="You're already a host, or you're not logged in."
        action={
          <Link to="/host-applications">
            <Button>Back to Host Applications</Button>
          </Link>
        }
      />
    );
  }

  if (isSuccess) {
    return (
      <NonIdealState
        icon={<TickIcon />}
        title="Application submitted"
        description="Head back to Host Applications to check on its status."
        action={
          <Link to="/host-applications">
            <Button intent={Intent.PRIMARY}>Back to Host Applications</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div>
      <title>uhc.gg | Apply to Host</title>
      <H1>Apply to Host</H1>

      {error && <Callout intent={Intent.DANGER}>{error.message}</Callout>}

      {isFetching ? (
        <Spinner />
      ) : !data || data.length === 0 ? (
        <NonIdealState icon={<HelpIcon />} title="No quiz questions have been configured yet" />
      ) : (
        <HostApplicationForm questions={data} />
      )}
    </div>
  );
};
