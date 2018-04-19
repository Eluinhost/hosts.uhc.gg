import * as moment from 'moment-timezone';

export type CreateMatchData = {
  opens: moment.Moment;
  address: string | null;
  ip: string;
  scenarios: string[];
  tags: string[];
  teams: string;
  size: number | null;
  customStyle: string | null;
  count: number;
  content: string;
  region: string;
  location: string;
  version: string;
  slots: number;
  length: number;
  mapSize: number;
  pvpEnabledAt: number;
  hostingName: string | null;
  tournament: boolean;
};
