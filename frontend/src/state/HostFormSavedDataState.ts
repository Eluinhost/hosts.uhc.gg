import type { Reducer } from 'redux';
import { createReducer } from 'typesafe-redux-helpers';

import { SetSavedHostFormData } from '../actions';
import { presets } from '../components/host/presets';
import type { CreateMatchData } from '../models/CreateMatchData';
import { Regions } from '../models/Regions';
import { TeamStyles } from '../models/TeamStyles';

export type HostFormSavedDataState = Omit<CreateMatchData, 'opens'>;

export const reducer: Reducer<HostFormSavedDataState> = createReducer<HostFormSavedDataState>({
  region: Regions[0].value,
  teams: TeamStyles[0].value,
  modifiers: [],
  scenarios: ['Vanilla+'],
  tags: [],
  size: 0,
  customStyle: '',
  address: '',
  content: presets['Default'],
  ip: '',
  count: 1,
  location: '',
  length: 90,
  mainVersion: '',
  version: '',
  mapSize: 3000,
  pvpEnabledAt: 20,
  slots: 80,
  hostingName: '',
  tournament: false,
}).handleAction(SetSavedHostFormData.started, (state, action) => ({
  ...state,
  ...action.payload.parameters,
}));
