import { createReducer } from 'typesafe-redux-helpers';
import { Reducer } from 'redux';

import { Presets } from '../actions';
import { Preset } from '../components/host/presets';

export type PresetsState = Preset[];

export const reducer: Reducer<PresetsState> = createReducer<PresetsState>([]).handleAction(
  Presets.save,
  (_state, action) => action.payload,
);
