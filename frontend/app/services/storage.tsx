import * as localForage from 'localforage';

export const storage: LocalForage = localForage.createInstance({
  name: 'hosts-uhcgg-data',
  version: 1.0,
  storeName: 'hosts-uhcgg-data',
  description: 'Serialized data to carry settings across refreshes',
});
