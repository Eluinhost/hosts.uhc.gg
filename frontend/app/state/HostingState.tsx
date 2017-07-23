import { HostFormData, minDate } from '../components/HostForm';
import { ReducerBuilder } from './ReducerBuilder';
import { storage } from '../storage';
import { Regions } from '../Regions';
import { TeamStyles } from '../TeamStyles';
import { Store } from 'redux';
import { ApplicationState } from './ApplicationState';
import { omit } from 'ramda';

export type HostingFormInitialState = HostFormData;

export type HostingState = {
  formInitialState: HostingFormInitialState;
};

export const reducer = new ReducerBuilder<HostingState>().build(); // Do nothing

const defaultData: HostingFormInitialState = {
  opens: minDate,
  region: Regions[0].value,
  teams: TeamStyles[0].value,
  scenarios: ['Vanilla+'],
  tags: [],
  size: null,
  customStyle: '',
  address: '',
  content: 'Enter **markdown** content here',
  ip: '',
  count: 1,
  location: '',
  length: 90,
  version: '1.8.8',
  mapSizeX: 1500,
  mapSizeZ: 1500,
  pvpEnabledAt: 20,
  slots: 80,
};

export async function initialValues(): Promise<HostingState> {
  try {
    const hostFormInitialData = await storage.getItem<HostingFormInitialState>('host-form-data');

    return {
      formInitialState: {
        ...defaultData,
        ...hostFormInitialData,
        opens: minDate,
      },
    };
  } catch (err) {
    console.error(err);

    return {
      formInitialState: {
        ...defaultData,
        opens: minDate,
      },
    };
  }
}

export function postInit(store: Store<ApplicationState>): void {
  const state = store.getState().form;

  let lastFormValues: { [fieldName: string]: string } | undefined =
    state.host && state.host.values ? state.host.values : undefined;

  store.subscribe(async () => {
    const newState = store.getState().form;

    const newFormValues = newState.host && newState.host.values ? newState.host.values : undefined;

    if (newFormValues && newFormValues !== lastFormValues) {
      lastFormValues = newFormValues;

      // always store minus 'opens' field
      try {
        await storage.setItem('host-form-data', omit(['opens'], store.getState().form.host.values));
      } catch (err) {
        console.error(err);
      }
    }
  });
}
