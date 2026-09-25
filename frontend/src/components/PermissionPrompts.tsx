import { EmptyState, Button } from '@mantine/core';
import { PlusIcon, UserPlusIcon, WarningIcon } from '@phosphor-icons/react';
import React from 'react';
import { Link } from 'react-router';

import { LoginButton } from './LoginButton';

/**
 * Shown when the user is logged out, regardless of which permissions the page requires.
 */
export const PromptToLogin: React.FunctionComponent = () => (
  <EmptyState
    title="Forbidden"
    description="You do not have permission to use this. You may attempt to login with an authorised account below"
    icon={<WarningIcon />}
  >
    <LoginButton />
  </EmptyState>
);

/**
 * Shown when the user is logged in but is viewing a page that requires 'trial host' or 'host'
 * and they don't hold either permission.
 */
export const PromptToApplyForHost: React.FunctionComponent = () => (
  <EmptyState
    title="No Host Rank"
    description="You are logged in but do not have a hosting rank yet. Apply for trial host below."
    icon={<UserPlusIcon />}
  >
    <Link to="/host-applications/apply">
      <Button leftSection={<PlusIcon />}>Apply for Trial Host</Button>
    </Link>
  </EmptyState>
);

/**
 * Shown when the user is logged in but lacks the permission for a page that isn't gated by
 * 'trial host'/'host', so applying for host wouldn't help.
 */
export const NotAllowed: React.FunctionComponent = () => (
  <EmptyState title="Forbidden" description="You do not have permission to view this page." icon={<WarningIcon />} />
);
