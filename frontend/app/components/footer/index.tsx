import * as React from 'react';
import { AnchorButton, Button, Classes, Intent } from '@blueprintjs/core';

export class Footer extends React.PureComponent {
  public render() {
    return (
      <div className={`${Classes.CARD} application-footer`}>
        <div className={`${Classes.MINIMAL} application-footer-left`}>
          <AnchorButton
            href="https://uhc.gg/discord"
            intent={Intent.SUCCESS}
            className={`${Classes.MINIMAL}`}
            iconName="comment"
            target="_blank"
          >
            Discord
          </AnchorButton>
        </div>
        <div className={`${Classes.MINIMAL} ${Classes.BUTTON_GROUP} application-footer-right`}>
          <AnchorButton
            href="https://github.com/Eluinhost/hosts.uhc.gg"
            intent={Intent.SUCCESS}
            iconName="git-repo"
            target="_blank"
          >
            Source
          </AnchorButton>
          <AnchorButton
            href="https://github.com/Eluinhost/hosts.uhc.gg/issues"
            intent={Intent.SUCCESS}
            iconName="issue"
            target="_blank"
          >
            Issues
          </AnchorButton>
          <AnchorButton
            href="/api/docs/"
            intent={Intent.SUCCESS}
            iconName="build"
            target="_blank"
          >
            API
          </AnchorButton>
        </div>
      </div>
    );
  }
}
