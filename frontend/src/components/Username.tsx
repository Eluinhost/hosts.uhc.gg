import React, { useCallback } from 'react';
import { useHistory } from 'react-router';
import { Button, Menu, MenuItem, PopoverNext } from '@blueprintjs/core';
import { useDispatch, useSelector } from 'react-redux';
import { LoginButton } from './LoginButton';
import { Link } from 'react-router-dom';
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

export const Username: React.ComponentType = React.memo(() => {
  const { isLoggedIn, username } = useSelector(stateSelector);
  const dispatch = useDispatch();
  const history = useHistory();

  const logout = useCallback(() => {
    dispatch(Authentication.logout());
    history.push('/');
  }, [dispatch, history]);

  if (isLoggedIn) {
    return (
      <PopoverNext content={<UserMenu logout={logout} />} placement="bottom-end">
        <Button variant="minimal" icon="user">
          {username}
        </Button>
      </PopoverNext>
    );
  }

  return <LoginButton />;
});
