import { connect } from 'react-redux';
import * as React from 'react';
import { Menu, MenuItem, Popover, Position } from '@blueprintjs/core';
import { AuthenticationActions } from '../state/AuthenticationState';
import { ApplicationState } from '../state/ApplicationState';
import { Dispatch } from 'redux';
import { RouteComponentProps, withRouter } from 'react-router';
import { LoginButton } from './LoginButton';
import { Link } from 'react-router-dom';
import { createSelector } from 'reselect';
import { getUsername, isLoggedIn } from '../state/Selectors';
import { If } from './If';

type StateProps = {
  readonly isLoggedIn: boolean;
  readonly username: string | null;
};

type DispatchProps = {
  readonly logout: () => void;
};

const UserMenu: React.SFC<DispatchProps> = ({ logout }) => (
  <Menu>
    <Link
      to="/profile"
    >
      <MenuItem
        iconName="cog"
        text="Profile"
      />
    </Link>
    <MenuItem
      iconName="log-out"
      onClick={logout}
      text="Logout"
    />
  </Menu>
);

const UsernameComponent: React.SFC<StateProps & DispatchProps> = ({ logout, username, isLoggedIn }) => (
  <If condition={isLoggedIn} alternative={LoginButton}>
    <Popover content={<UserMenu logout={logout} />} position={Position.BOTTOM_RIGHT}>
          <span className="pt-button pt-minimal pt-icon-user">
            {username}
          </span>
    </Popover>
  </If>
);

const stateSelector = createSelector<ApplicationState, boolean, string | null, StateProps>(
  isLoggedIn,
  getUsername,
  (isLoggedIn, username) => ({
    isLoggedIn,
    username: username || 'ERROR NO USERNAME IN STORE',
  }),
);

export const Username: React.ComponentClass = withRouter<{}>(
  connect<StateProps, DispatchProps, RouteComponentProps<any>>(
    stateSelector,
    (dispatch: Dispatch<ApplicationState>, ownProps: RouteComponentProps<any>): DispatchProps => ({
      logout: (): void => {
        dispatch(AuthenticationActions.logout());
        ownProps.history.push('/');
      },
    }),
  )(UsernameComponent),
);

