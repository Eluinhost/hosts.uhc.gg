import * as React from 'react';
import { Button, Callout, H1, Intent, NonIdealState, Spinner } from '@blueprintjs/core';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { HostApplicationForm } from './HostApplicationForm';
import { getFetchQuizQuestionsApiState } from '../questions/selectors';
import { useEffect } from 'react';
import { QuizQuestions } from '../questions/actions';
import { HostApplications } from '../actions';
import { getHasSubmittedHostApplicationSuccessfully, getHostApplicationPermissions } from '../selectors';

export const ApplyHostApplicationPage = React.memo(function ApplyHostApplicationPage() {
  const dispatch = useDispatch();
  const { error, data, isFetching } = useSelector(getFetchQuizQuestionsApiState);
  const { canApply, isBanned } = useSelector(getHostApplicationPermissions);
  const hasSubmittedHostApplicationSuccessfully = useSelector(getHasSubmittedHostApplicationSuccessfully);

  useEffect(() => {
    dispatch(QuizQuestions.fetch.start());

    return () => {
      dispatch(HostApplications.create.reset());
    };
  }, [dispatch]);

  if (isBanned) {
    return (
      <NonIdealState
        icon="ban-circle"
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
        icon="tick-circle"
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

  if (hasSubmittedHostApplicationSuccessfully) {
    return (
      <NonIdealState
        icon="tick"
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
      <H1>Apply to Host</H1>

      {error && <Callout intent={Intent.DANGER}>{error}</Callout>}

      {isFetching ? (
        <Spinner />
      ) : data.length === 0 ? (
        <NonIdealState icon="help" title="No quiz questions have been configured yet" />
      ) : (
        <HostApplicationForm questions={data} />
      )}
    </div>
  );
});
