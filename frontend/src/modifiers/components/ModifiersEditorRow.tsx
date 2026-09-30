import { Badge } from '@mantine/core';
import { ArrowClockwiseIcon, TrashIcon } from '@phosphor-icons/react';
import React, { type ReactNode, useCallback, useState } from 'react';

import { ModifiersData } from '@/modifiers/api';
import type { Modifier } from '@/modifiers/Modifier';

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
    icon = <ArrowClockwiseIcon />;
  } else if (isHovered) {
    icon = <TrashIcon />;
  }

  return (
    <span onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} className="modifiers-editor_entry">
      <Badge
        title="Delete modifier"
        onClick={() => {
          mutate(modifier.id);
        }}
        size="lg"
        rightSection={icon}
        color={isHovered ? 'red' : 'grey'}
        className="modifiers-editor_entry_tag"
      >
        {modifier.displayName}
      </Badge>
    </span>
  );
};
