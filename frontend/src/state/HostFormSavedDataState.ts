import { createReducer } from 'typesafe-redux-helpers';
import { Reducer } from 'redux';

import { SetSavedHostFormData } from '../actions';
import { CreateMatchData } from '../models/CreateMatchData';
import { nextAvailableSlot } from '../components/host/nextAvailableSlot';
import { TeamStyles } from '../models/TeamStyles';
import { Regions } from '../models/Regions';
import { presets } from '../components/host/presets';

export type HostFormSavedDataState = CreateMatchData;

export const reducer: Reducer<HostFormSavedDataState> = createReducer<HostFormSavedDataState>({
  opens: nextAvailableSlot(),
  region: Regions[0].value,
  teams: TeamStyles[0].value,
  modifiers: [],
  scenarios: ['Vanilla+'],
  tags: [],
  size: null,
  customStyle: '',
  address: '',
  content: presets[0].template,
  ip: '',
  count: 1,
  location: '',
  length: 90,
  version: '1.8.8',
  mapSize: 3000,
  pvpEnabledAt: 20,
  slots: 80,
  hostingName: null,
  tournament: false,
}).handleAction(SetSavedHostFormData.started, (state, action) => ({
  ...state,
  ...action.payload.parameters,
  opens: state.opens, // always use whatever was there first, storage really doesn't like moment
}));
