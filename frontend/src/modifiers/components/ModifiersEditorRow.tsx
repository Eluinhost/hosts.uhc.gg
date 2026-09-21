import { Classes, Intent, Tag } from '@blueprintjs/core';
import { RefreshIcon, TrashIcon } from '@blueprintjs/icons';
import React, { type ReactNode, useCallback, useState } from 'react';

import { ModifiersData } from '../api';
import type { Modifier } from '../Modifier';

export type ModifiersEditorRowProps = {
  modifier: Modifier;
};

export const ModifierEditorRow: React.FC<ModifiersEditorRowProps> = (props: ModifiersEditorRowProps) => {
  const { modifier } = props;
  const { mutate, isPending } = ModifiersData.mutations.useDeleteModifier();

  const [isHovered, setIsHovered] = useState(false);

  const onMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);
  const onMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  let icon: ReactNode | null = null;

  if (isPending) {
    icon = <RefreshIcon className={Classes.SPINNER_ANIMATION} />;
  } else if (isHovered) {
    icon = <TrashIcon />;
  }

  return (
    <span onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} className="modifiers-editor_entry">
      <span>-</span>
      <Tag
        interactive
        title="Delete modifier"
        onClick={() => {
          mutate(modifier.id);
        }}
        size="large"
        endIcon={icon}
        intent={isHovered ? Intent.DANGER : Intent.NONE}
        className="modifiers-editor_entry_tag"
      >
        {modifier.displayName}
      </Tag>
    </span>
  );
};
