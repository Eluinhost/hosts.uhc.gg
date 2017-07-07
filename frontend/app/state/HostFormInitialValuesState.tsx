import { HostFormData, minDate } from '../components/HostForm';
import { buildReducer } from './buildReducer';
import { storage } from '../storage';
import { Regions } from '../Regions';
import { TeamStyles } from '../TeamStyles';
import { Store } from 'redux';
import { ApplicationState } from './ApplicationState';
import { omit } from 'ramda';

export type HostFormInitialValuesState = HostFormData;

export const reducer = buildReducer().done(); // Do nothing

const defaultData: HostFormInitialValuesState = {
  opens: minDate,
  region: Regions[0].value,
  teams: TeamStyles[0].value,
  scenarios: ['Vanilla+'],
  tags: [],
  size: 3,
  customStyle: '',
  address: '',
  content: 'Enter **markdown** content here',
  ip: '',
  count: 1,
};

export async function initialValues(): Promise<HostFormInitialValuesState> {
  try {
    const hostFormInitialData = await storage.getItem<HostFormInitialValuesState>('host-form-data');

    return {
      ...(hostFormInitialData || defaultData),
      opens: minDate,
    };
  } catch (err) {
    console.error(err);

    return {
      ...defaultData,
      opens: minDate,
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
