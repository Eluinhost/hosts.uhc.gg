import * as React from 'react';
import { AnchorButton, Button, Classes, Intent } from '@blueprintjs/core';
import { connect } from 'react-redux';
import { always } from 'ramda';
import { createSelector } from 'reselect';
import { ApplicationState } from '../../state/ApplicationState';
import { isDarkMode } from '../../state/Selectors';

type StateProps = {
  readonly isDarkMode: boolean;
};

class FooterComponent extends React.PureComponent<StateProps> {
  public render() {
    const intent = this.props.isDarkMode ? Intent.DANGER : Intent.PRIMARY;

    return (
      <div className={`${Classes.CARD} application-footer`}>
        <div className={`${Classes.MINIMAL} application-footer-left`}>
          <AnchorButton href="https://uhc.gg/discord" intent={intent} icon="comment" minimal target="_blank">
            Discord
          </AnchorButton>
        </div>
        <div className={`${Classes.MINIMAL} ${Classes.BUTTON_GROUP} application-footer-right`}>
          <AnchorButton
            href="https://github.com/Eluinhost/hosts.uhc.gg"
            intent={intent}
            icon="git-repo"
            target="_blank"
          >
            Source
          </AnchorButton>
          <AnchorButton
            href="https://github.com/Eluinhost/hosts.uhc.gg/issues"
            intent={intent}
            icon="issue"
            target="_blank"
          >
            Issues
          </AnchorButton>
          <AnchorButton href="/api/docs/" intent={intent} icon="build" target="_blank">
            API
          </AnchorButton>
        </div>
      </div>
    );
  }
}

const selector = createSelector<ApplicationState, boolean, StateProps>(isDarkMode, (isDarkMode): StateProps => ({
  isDarkMode,
}));

export const Footer: React.ComponentClass = connect<StateProps, {}, {}>(selector, always({}))(FooterComponent);
