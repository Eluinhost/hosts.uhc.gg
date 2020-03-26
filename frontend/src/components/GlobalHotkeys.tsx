import { RouteComponentProps, withRouter } from 'react-router';
import * as React from 'react';
import { Hotkey, Hotkeys } from '@blueprintjs/core';
// workaround for dodgy transpilation
import {HotkeysTarget} from '@blueprintjs/core/lib/esnext/components/hotkeys/hotkeysTarget.js';

@HotkeysTarget
class GlobalHotkeysComponent extends React.PureComponent<RouteComponentProps<any>> {
  public render() {
    return <>{this.props.children}</>;
  }

  private goToMatches = () => this.props.history.push('/matches');
  private goToUbl = () => this.props.history.push('/ubl');
  private goToPermissions = () => this.props.history.push('/members');
  private goBack = () => this.props.history.goBack();

  public renderHotkeys() {
    return (
      <Hotkeys>
        <Hotkey global combo="H" label="Create a new match" onKeyDown={this.goToMatches} />
        <Hotkey global combo="M" label="Go to match listing" onKeyDown={this.goToMatches} />
        <Hotkey global combo="B" label="Go to current UBL" onKeyDown={this.goToUbl} />
        <Hotkey global combo="P" label="Go to permissions" onKeyDown={this.goToPermissions} />
        <Hotkey global combo="backspace" label="Go back" onKeyDown={this.goBack} />
      </Hotkeys>
    );
  }
}

export const GlobalHotkeys: React.ComponentClass = withRouter(GlobalHotkeysComponent);
