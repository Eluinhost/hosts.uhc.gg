import { Button, Menu, MenuItem, PopoverNext } from '@blueprintjs/core';
import { CogIcon, LogOutIcon, UserIcon } from '@blueprintjs/icons';
import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router';
import { createSelector } from 'reselect';

import { Authentication } from '../actions';
import { getUsername, isLoggedIn } from '../state/Selectors';

import { LoginButton } from './LoginButton';

const UserMenu: React.FunctionComponent<{ readonly logout: () => void }> = ({ logout }) => (
  <Menu>
    <Link to="/profile">
      <MenuItem icon={<CogIcon />} text="Profile" />
    </Link>
    <MenuItem icon={<LogOutIcon />} onClick={logout} text="Logout" />
  </Menu>
);

const stateSelector = createSelector(isLoggedIn, getUsername, (isLoggedIn, username) => ({
  isLoggedIn,
  username: username || 'ERROR NO USERNAME IN STORE',
}));

export const Username: React.FC = () => {
  const { isLoggedIn, username } = useSelector(stateSelector);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const logout = useCallback(() => {
    dispatch(Authentication.logout());
    void navigate('/');
  }, [dispatch, navigate]);

  if (isLoggedIn) {
    return (
      <PopoverNext
        content={<UserMenu logout={logout} />}
        placement="bottom-end"
        renderTarget={triggerProps => (
          <Button {...triggerProps} variant="minimal" icon={<UserIcon />}>
            {username}
          </Button>
        )}
      ></PopoverNext>
    );
  }

  return <LoginButton />;
};
