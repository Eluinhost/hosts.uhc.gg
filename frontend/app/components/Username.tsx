import { connect } from 'react-redux';
import * as React from 'react';
import { Menu, MenuItem, Popover, Position } from '@blueprintjs/core';
import { AuthenticationState, AuthenticationActions } from '../state/AuthenticationState';
import { ApplicationState } from '../state/ApplicationState';
import { Dispatch } from 'redux';
import { RouteComponentProps, withRouter } from 'react-router';
import { LoginButton } from './LoginButton';

type UsernameComponentProps = {
  readonly authentication: AuthenticationState;
};

type UsernameDispatchProps = {
  readonly logout: () => void;
};

const UserMenu: React.SFC<UsernameDispatchProps> = ({ logout }) => (
  <Menu>
    <MenuItem
      iconName="logout"
      onClick={logout}
      text="Logout"
    />
  </Menu>
);

const UsernameComponent: React.SFC<UsernameComponentProps & UsernameDispatchProps> =
  ({ authentication, logout }) => {
    if (authentication.loggedIn) {
      return (
        <Popover content={<UserMenu logout={logout} />} position={Position.BOTTOM_RIGHT}>
          <span className="pt-button pt-minimal pt-icon-user">
            {authentication.data!.accessTokenClaims.username}
          </span>
        </Popover>
      );
    }

    return <LoginButton />;
  };

const mapStateToProps = (state: ApplicationState): UsernameComponentProps => ({
  authentication: state.authentication,
});

const mapDispatchToProps =
  (dispatch: Dispatch<ApplicationState>, ownProps: RouteComponentProps<any>): UsernameDispatchProps => ({
    logout: (): void => {
      dispatch(AuthenticationActions.logout());
      ownProps.history.push('/');
    },
  });

export const Username: React.ComponentClass = withRouter<{}>(
  connect<UsernameComponentProps, UsernameDispatchProps, RouteComponentProps<any>>(
    mapStateToProps,
    mapDispatchToProps,
  )(UsernameComponent),
);

