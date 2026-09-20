import type { Reducer } from 'redux';
import { createReducer } from 'typesafe-redux-helpers';

import { Presets } from '../actions';

export type PresetsState = Record<string, string>;

export const reducer: Reducer<PresetsState> = createReducer<PresetsState>({}).handleAction(
  Presets.save,
  (_state, action) => action.payload,
);
