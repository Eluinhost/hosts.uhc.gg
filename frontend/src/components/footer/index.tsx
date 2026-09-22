import { AnchorButton, Classes, Intent } from '@blueprintjs/core';
import { BuildIcon, CommentIcon, GitRepoIcon, IssueIcon } from '@blueprintjs/icons';
import { useAtomValue } from 'jotai';
import React from 'react';

import { isDarkModeAtom } from '../../atoms/isDarkMode';

export const Footer: React.FC = () => {
  const isDark = useAtomValue(isDarkModeAtom);

  const intent = isDark ? Intent.DANGER : Intent.PRIMARY;

  return (
    <div className={`${Classes.CARD} application-footer`}>
      <div className={`${Classes.MINIMAL} application-footer-left`}>
        <AnchorButton
          href="https://uhc.gg/discord"
          intent={intent}
          icon={<CommentIcon />}
          variant="minimal"
          target="_blank"
          rel="noopener noreferrer"
        >
          Discord
        </AnchorButton>
      </div>
      <div className={`${Classes.MINIMAL} ${Classes.BUTTON_GROUP} application-footer-right`}>
        <AnchorButton
          href="https://github.com/Eluinhost/hosts.uhc.gg"
          intent={intent}
          icon={<GitRepoIcon />}
          target="_blank"
        >
          Source
        </AnchorButton>
        <AnchorButton
          href="https://github.com/Eluinhost/hosts.uhc.gg/issues"
          intent={intent}
          icon={<IssueIcon />}
          target="_blank"
        >
          Issues
        </AnchorButton>
        <AnchorButton href="/api/docs/" intent={intent} icon={<BuildIcon />} target="_blank">
          API
        </AnchorButton>
      </div>
    </div>
  );
};
