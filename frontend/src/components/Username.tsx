import { connect } from 'react-redux';
import * as React from 'react';
import { Button, Menu, MenuItem, Popover, Position } from "@blueprintjs/core";
import { ApplicationState } from '../state/ApplicationState';
import { Dispatch } from 'redux';
import { RouteComponentProps, withRouter } from 'react-router';
import { LoginButton } from './LoginButton';
import { Link } from 'react-router-dom';
import { createSelector } from 'reselect';
import { getUsername, isLoggedIn } from '../state/Selectors';
import { Authentication } from '../actions';

type StateProps = {
  readonly isLoggedIn: boolean;
  readonly username: string | null;
};

type DispatchProps = {
  readonly logout: () => void;
};

const UserMenu: React.FunctionComponent<DispatchProps> = ({ logout }) => (
  <Menu>
    <Link to="/profile">
      <MenuItem icon="cog" text="Profile" />
    </Link>
    <MenuItem icon="log-out" onClick={logout} text="Logout" />
  </Menu>
);

const UsernameComponent: React.FunctionComponent<StateProps & DispatchProps> = ({ logout, username, isLoggedIn }) => {
  if (isLoggedIn) {
    return (
      <Popover content={<UserMenu logout={logout}/>} position={Position.BOTTOM_RIGHT}>
        <Button minimal icon="user">{username}</Button>
      </Popover>
    );
  }

  return <LoginButton />;
};

const stateSelector = createSelector<ApplicationState, boolean, string | null, StateProps>(
  isLoggedIn,
  getUsername,
  (isLoggedIn, username) => ({
    isLoggedIn,
    username: username || 'ERROR NO USERNAME IN STORE',
  }),
);


// TODO remove props from dispatch
export const Username: React.ComponentClass = withRouter(
  connect<StateProps, DispatchProps, RouteComponentProps<any>>(
    stateSelector,
    (dispatch: Dispatch<ApplicationState>, ownProps?: RouteComponentProps<any>): DispatchProps => ({
      logout: (): void => {
        dispatch(Authentication.logout());
        ownProps!.history.push('/');
      },
    }),
  )(UsernameComponent),
);
