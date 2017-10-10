import { ApplicationReducer, ReducerBuilder } from './ReducerBuilder';
import { SetSavedHostFormData } from '../actions';
import { CreateMatchData } from '../models/CreateMatchData';
import { nextAvailableSlot } from '../components/host/nextAvailableSlot';
import { TeamStyles } from '../models/TeamStyles';
import { Regions } from '../models/Regions';
import { presets } from '../components/host/presets';

export type HostFormSavedDataState = CreateMatchData;

export const reducer: ApplicationReducer<HostFormSavedDataState> = ReducerBuilder
  .withInitialState<HostFormSavedDataState>({
    opens: nextAvailableSlot(),
    region: Regions[0].value,
    teams: TeamStyles[0].value,
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
    mapSize: 1500,
    pvpEnabledAt: 20,
    slots: 80,
    hostingName: null,
    tournament: false,
  })
  .handle(SetSavedHostFormData.started, (prev, action) => ({
    ...prev,
    ...action.payload!.parameters,
    opens: prev.opens, // always use whatever was there first, storage really doesn't like moment
  }))
  .build();
