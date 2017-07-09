import { connect } from 'react-redux';
import * as React from 'react';
import { Menu, MenuItem, Popover, Position } from '@blueprintjs/core';
import { AuthenticationState, logout as logoutAction } from '../state/AuthenticationState';
import { ApplicationState } from '../state/ApplicationState';
import { Dispatch } from 'redux';
import { RouteComponentProps, withRouter } from 'react-router';

type UsernameComponentProps = {
  readonly authentication: AuthenticationState;
};

type UsernameDispatchProps = {
  readonly logout: () => any;
};

const UserMenu: React.SFC<{ logout: () => any }> = ({ logout }) => (
  <Menu>
    <MenuItem
      iconName="logout"
      onClick={logout}
      text="Logout"
    />
  </Menu>
);

const UsernameComponent: React.SFC<UsernameComponentProps & UsernameDispatchProps> = ({ authentication, logout }) => {
  if (authentication.loggedIn) {
    return (
      <Popover content={<UserMenu logout={logout} />} position={Position.BOTTOM_RIGHT}>
        <span className="pt-button pt-minimal pt-icon-user">
          {authentication.data!.claims.username}
        </span>
      </Popover>
    );
  }

  return (
    <a className="pt-button pt-minimal pt-icon-user" href="/authenticate">
      Log In
    </a>
  );
};

function mapStateToProps(state: ApplicationState): UsernameComponentProps {
  return {
    authentication: state.authentication,
  };
}

function mapDispatchToProps(dispatch: Dispatch<any>, ownProps: RouteComponentProps<any>): UsernameDispatchProps {
  return {
    logout: () => {
      dispatch(logoutAction());
      ownProps.history.push('/');
    },
  };
}

export const Username = withRouter<{}>(
  connect<UsernameComponentProps, UsernameDispatchProps, RouteComponentProps<any>>(
    mapStateToProps,
    mapDispatchToProps,
  )(UsernameComponent),
);

