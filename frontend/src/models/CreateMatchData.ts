import moment from 'moment-timezone';

export type CreateMatchData = {
  opens: moment.Moment;
  address: string | null;
  ip: string;
  modifiers: string[];
  scenarios: string[];
  tags: string[];
  teams: string;
  size: number | null;
  customStyle: string | null;
  count: number;
  content: string;
  region: string;
  location: string;
  mainVersion: string;
  version: string | null;
  slots: number;
  length: number;
  mapSize: number;
  pvpEnabledAt: number;
  hostingName: string | null;
  tournament: boolean;
};
