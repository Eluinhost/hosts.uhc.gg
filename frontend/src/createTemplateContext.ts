import { renderTeamStyle, TeamStyles } from './models/TeamStyles';
import { Match } from './models/Match';

export const createTemplateContext = (data: Match): object => {
  const teams = TeamStyles.find(it => it.value === data.teams) || TeamStyles[0];

  return {
    ...data,
    // overwite teams value with rendered version
    teams: renderTeamStyle(teams, data.size, data.customStyle),
    teamStyle: teams.value,
  };
};
