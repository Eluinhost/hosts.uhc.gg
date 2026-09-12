import React from 'react';
import { renderTeamStyle, TeamStyles } from '../../models/TeamStyles';

type Props = {
  readonly style: string;
  readonly size: number | null;
  readonly custom: string | null;
};

export const TeamStyle: React.FC<Props> = ({ style, size, custom }) => {
  const lookup = TeamStyles.find(it => it.value === style);

  return <span>{renderTeamStyle(lookup!, size, custom)}</span>;
};
