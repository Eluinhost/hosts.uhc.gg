import { atomWithStorage } from 'jotai/utils';

import { presets } from '../components/host/presets';
import type { CreateMatchData } from '../models/CreateMatchData';
import { Regions } from '../models/Regions';
import { TeamStyles } from '../models/TeamStyles';

export const hostFormDataAtom = atomWithStorage<Omit<CreateMatchData, 'opens'>>(
  'uhcgg.settings.savedMatchData',
  {
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
    version: '',
    mapSize: 3000,
    pvpEnabledAt: 20,
    slots: 80,
    hostingName: '',
    tournament: false,
  },
  undefined,
  {
    getOnInit: true,
  },
);
