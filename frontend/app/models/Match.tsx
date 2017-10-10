import * as moment from 'moment-timezone';

export type Match = {
  id: number;
  author: string;
  opens: moment.Moment;
  address: string | null;
  ip: string | null;
  scenarios: string[];
  tags: string[];
  teams: string;
  size: number | null;
  customStyle: string | null;
  count: number;
  content: string;
  region: string;
  removed: boolean;
  removedBy: string | null;
  removedReason: string | null;
  created: moment.Moment;
  location: string;
  version: string;
  slots: number;
  length: number;
  mapSize: number;
  pvpEnabledAt: number;
  approvedBy: string | null;
  hostingName: string | null;
  tournament: boolean;
};