import { Button, NonIdealState } from '@blueprintjs/core';
import { AddIcon, NewPersonIcon, WarningSignIcon } from '@blueprintjs/icons';
import React from 'react';
import { Link } from 'react-router';

import { LoginButton } from './LoginButton';

/**
 * Shown when the user is logged out, regardless of which permissions the page requires.
 */
export const PromptToLogin: React.FunctionComponent = () => (
  <NonIdealState
    title="Forbidden"
    description="You do not have permission to use this. You may attempt to login with an authorised account below"
    icon={<WarningSignIcon />}
    action={<LoginButton />}
  />
);

/**
 * Shown when the user is logged in but is viewing a page that requires 'trial host' or 'host'
 * and they don't hold either permission.
 */
export const PromptToApplyForHost: React.FunctionComponent = () => (
  <NonIdealState
    title="No Host Rank"
    description="You are logged in but do not have a hosting rank yet. Apply for trial host below."
    icon={<NewPersonIcon />}
    action={
      <Link to="/host-applications/apply">
        <Button intent="primary" icon={<AddIcon />}>
          Apply for Trial Host
        </Button>
      </Link>
    }
  />
);

/**
 * Shown when the user is logged in but lacks the permission for a page that isn't gated by
 * 'trial host'/'host', so applying for host wouldn't help.
 */
export const NotAllowed: React.FunctionComponent = () => (
  <NonIdealState
    title="Forbidden"
    description="You do not have permission to view this page."
    icon={<WarningSignIcon />}
  />
);
