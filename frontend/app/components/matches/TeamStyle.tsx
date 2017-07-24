import * as React from 'react';
import { renderTeamStyle, TeamStyles } from '../../TeamStyles';

export type TeamStyleProps = {
  readonly style: string;
  readonly size: number | null;
  readonly custom: string | null;
};

export const TeamStyle: React.SFC<TeamStyleProps> = ({ style, size, custom }) => {
  const lookup = TeamStyles.find(it => it.value === style);

  return <span>{renderTeamStyle(lookup!, size, custom)}</span>;
};
