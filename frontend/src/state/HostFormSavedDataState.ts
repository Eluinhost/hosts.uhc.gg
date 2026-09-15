import { Reducer } from 'redux';
import { createReducer } from 'typesafe-redux-helpers';

import { SetSavedHostFormData } from '../actions';
import { nextAvailableSlot } from '../components/host/nextAvailableSlot';
import { presets } from '../components/host/presets';
import { CreateMatchData } from '../models/CreateMatchData';
import { Regions } from '../models/Regions';
import { TeamStyles } from '../models/TeamStyles';

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
  mainVersion: '',
  version: null,
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
