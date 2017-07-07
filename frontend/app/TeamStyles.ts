export type TeamStyle = {
  display: string;
  value: string,
  requiresTeamSize: boolean
};

export const TeamStyles: TeamStyle[] = [
  {
    display: 'FFA',
    value: 'ffa',
    requiresTeamSize: false,
  },
  {
    display: 'Chosen',
    value: 'chosen',
    requiresTeamSize: true,
  },
  {
    display: 'Random',
    value: 'random',
    requiresTeamSize: true,
  },
  {
    display: 'Captains',
    value: 'captains',
    requiresTeamSize: true,
  },
  {
    display: 'Picked',
    value: 'picked',
    requiresTeamSize: true,
  },
  {
    display: 'SlaveMarket',
    value: 'market',
    requiresTeamSize: false,
  },
  {
    display: 'Mystery',
    value: 'mystery',
    requiresTeamSize: true,
  },
  {
    display: 'Red vs Blue',
    value: 'rvb',
    requiresTeamSize: false,
  },
  {
    display: 'Custom',
    value: 'custom',
    requiresTeamSize: false,
  },
];
