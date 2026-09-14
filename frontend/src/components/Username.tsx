import React, { useCallback } from 'react';
import { useNavigate, Link } from 'react-router';
import { Button, Menu, MenuItem, PopoverNext } from '@blueprintjs/core';
import { useDispatch, useSelector } from 'react-redux';
import { LoginButton } from './LoginButton';
import { createSelector } from 'reselect';
import { getUsername, isLoggedIn } from '../state/Selectors';
import { Authentication } from '../actions';

const UserMenu: React.FunctionComponent<{ readonly logout: () => void }> = ({ logout }) => (
  <Menu>
    <Link to="/profile">
      <MenuItem icon="cog" text="Profile" />
    </Link>
    <MenuItem icon="log-out" onClick={logout} text="Logout" />
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
    navigate('/');
  }, [dispatch, navigate]);

  if (isLoggedIn) {
    return (
      <PopoverNext
        content={<UserMenu logout={logout} />}
        placement="bottom-end"
        renderTarget={triggerProps => (
          <Button {...triggerProps} variant="minimal" icon="user">
            {username}
          </Button>
        )}
      ></PopoverNext>
    );
  }

  return <LoginButton />;
};
