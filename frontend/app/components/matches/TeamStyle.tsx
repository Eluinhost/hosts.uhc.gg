import * as React from 'react';
import { TeamStyles } from '../../TeamStyles';

export type TeamStyleProps = {
  readonly style: string;
  readonly size: number | null;
  readonly custom: string | null;
};

export const TeamStyle: React.SFC<TeamStyleProps> = ({ style, size, custom }) => {
  const lookup = TeamStyles.find(it => it.value === style);
  let render: string;

  if (!lookup) {
    render = `UNKNOWN STYLE: ${style}`;
  } else if (lookup.value === 'custom') {
    render = custom || 'Custom style not provided';
  } else {
    render = lookup.display;

    if (lookup.requiresTeamSize) {
      render = `${render} To${size}`;
    }
  }

  return <span>{render}</span>;
};
