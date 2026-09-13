import React, { useCallback, useEffect, useRef } from 'react';
import { Hotkey, Hotkeys } from '@blueprintjs/core';
// workaround for dodgy transpilation
import { HotkeysEvents, HotkeyScope } from '@blueprintjs/core/lib/esnext/components/hotkeys/hotkeysEvents.js';
import { useHistory } from 'react-router';

export const GlobalHotkeys: React.FC = ({ children }) => {
  const history = useHistory();
  const globalHotkeysEventsRef = useRef(new HotkeysEvents(HotkeyScope.GLOBAL));

  const goToMatches = useCallback(() => history.push('/matches'), [history]);
  const goToPermissions = useCallback(() => history.push('/members'), [history]);
  const goBack = useCallback(() => history.goBack(), [history]);

  const hotkeys = (
    <Hotkeys>
      <Hotkey global combo="H" label="Create a new match" onKeyDown={goToMatches} />
      <Hotkey global combo="M" label="Go to match listing" onKeyDown={goToMatches} />
      <Hotkey global combo="P" label="Go to permissions" onKeyDown={goToPermissions} />
      <Hotkey global combo="backspace" label="Go back" onKeyDown={goBack} />
    </Hotkeys>
  );

  useEffect(() => {
    const events = globalHotkeysEventsRef.current;
    events.setHotkeys(hotkeys.props);

    document.addEventListener('keydown', events.handleKeyDown);
    document.addEventListener('keyup', events.handleKeyUp);

    return () => {
      document.removeEventListener('keydown', events.handleKeyDown);
      document.removeEventListener('keyup', events.handleKeyUp);
      events.clear();
    };
  }, [hotkeys, goToMatches, goToPermissions, goBack]);

  return <>{children}</>;
};
