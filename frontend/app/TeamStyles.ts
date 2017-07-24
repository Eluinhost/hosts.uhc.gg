export const renderTeamStyle = (style: TeamStyle, size: number | null, custom: string | null) => {
  if (style.value === 'custom')
    return custom;

  if (style.requiresTeamSize)
    return `${style.display} To${size}`;

  return style.display;
};

export class TeamStyle {
  readonly display: string;
  readonly value: string;
  readonly requiresTeamSize: boolean;

  constructor(display: string, value: string, requiresTeamSize: boolean) {
    this.display = display;
    this.value = value;
    this.requiresTeamSize = requiresTeamSize;
  }
}

export const TeamStyles: TeamStyle[] = [
  new TeamStyle('FFA', 'ffa', false),
  new TeamStyle('Chosen', 'chosen', true),
  new TeamStyle('Random', 'random', true),
  new TeamStyle('Captains', 'captains', true),
  new TeamStyle('Picked', 'picked', true),
  new TeamStyle('SlaveMarket', 'market', false),
  new TeamStyle('Mystery', 'mystery', true),
  new TeamStyle('Red vs Blue', 'rvb', false),
  new TeamStyle('Custom', 'custom', false),
];
