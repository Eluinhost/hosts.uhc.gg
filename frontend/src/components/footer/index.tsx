import { AnchorButton, Classes, Intent } from '@blueprintjs/core';
import React from 'react';
import { useSelector } from 'react-redux';

import { isDarkMode } from '../../state/Selectors';

export const Footer: React.FC = () => {
  const isDark = useSelector(isDarkMode);

  const intent = isDark ? Intent.DANGER : Intent.PRIMARY;

  return (
    <div className={`${Classes.CARD} application-footer`}>
      <div className={`${Classes.MINIMAL} application-footer-left`}>
        <AnchorButton
          href="https://uhc.gg/discord"
          intent={intent}
          icon="comment"
          variant="minimal"
          target="_blank"
          rel="noopener noreferrer"
        >
          Discord
        </AnchorButton>
      </div>
      <div className={`${Classes.MINIMAL} ${Classes.BUTTON_GROUP} application-footer-right`}>
        <AnchorButton href="https://github.com/Eluinhost/hosts.uhc.gg" intent={intent} icon="git-repo" target="_blank">
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
};
