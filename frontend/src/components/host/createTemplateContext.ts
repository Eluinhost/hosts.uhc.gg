import { CreateMatchData } from '../../models/CreateMatchData';
import { renderTeamStyle, TeamStyles } from '../../models/TeamStyles';

export const createTemplateContext = (data: CreateMatchData, username: string): any => {
  const teams = TeamStyles.find(it => it.value === data.teams) || TeamStyles[0];

  return {
    ...data,
    // overwite teams value with rendered version
    teams: renderTeamStyle(teams, data.size, data.customStyle),
    teamStyle: teams.value,
    author: username,
  };
};
