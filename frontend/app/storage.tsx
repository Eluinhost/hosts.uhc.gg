import * as localForage from 'localforage';

export const storage: LocalForage = localForage.createInstance({
  name: 'form-data',
  version: 1.0,
  storeName: 'form-data',
  description: 'Serialized form data to carry across loads',
});
