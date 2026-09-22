import { getDefaultStore, type ExtractAtomValue } from 'jotai';

import type { CreateMatchData } from '../models/CreateMatchData';

import { authenticationAtom } from './authentication';
import { hostFormDataAtom } from './hostFormData';
import { isDarkModeAtom } from './isDarkMode';
import { hideRemovedAtom, showOwnRemovedAtom } from './removedMatches';
import { is12hAtom } from './timeFormatting';
import { timezoneAtom } from './timezone';

const DB_NAME = 'hosts-uhcgg-data';
const STORE_NAME = 'hosts-uhcgg-data';

const openDatabase = (name: string): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const request = window.indexedDB.open(name);

    request.onsuccess = () => {
      resolve(request.result);
    };
    request.onerror = () => {
      reject(new Error(`Failed to open database '${name}'`));
    };
  });

const getObjectValue = <T>(store: IDBObjectStore, key: string): Promise<T | undefined> =>
  new Promise((resolve, reject) => {
    const request = store.get(key);

    request.onsuccess = () => {
      resolve(request.result as T | undefined);
    };
    request.onerror = () => {
      reject(new Error(`Failed to read '${key}' from the legacy settings database`));
    };
  });

const deleteDatabase = (name: string): Promise<void> =>
  new Promise(resolve => {
    const request = window.indexedDB.deleteDatabase(name);

    request.onsuccess = () => {
      resolve();
    };
    request.onerror = () => {
      resolve();
    };
    request.onblocked = () => {
      resolve();
    };
  });

// migrates settings saved by the old localforage system into the jotai atoms.
export const migrateOldIndexDb = async (): Promise<void> => {
  console.log('[Legacy DB Migration] migrating legacy IndexedDB settings');

  const databases = await window.indexedDB.databases();

  if (!databases.some(db => db.name === DB_NAME)) {
    console.log('[Legacy DB Migration] no database found, no migration needed');
    return;
  }

  const database = await openDatabase(DB_NAME);

  if (!database.objectStoreNames.contains(STORE_NAME)) {
    console.log('[Legacy DB Migration] no store found, no migration needed');
    database.close();
    return;
  }

  const store = database.transaction([STORE_NAME], 'readonly').objectStore(STORE_NAME);

  console.log('found IndexedDB store');

  const [authentication, hostFormData, isDarkMode, is12h, timezone, hideRemoved, showOwnRemoved] = await Promise.all([
    getObjectValue<ExtractAtomValue<typeof authenticationAtom>>(store, 'settings.authentication'),
    getObjectValue<CreateMatchData>(store, 'settings.host-form-data'),
    getObjectValue<ExtractAtomValue<typeof isDarkModeAtom>>(store, 'settings.isDarkMode'),
    getObjectValue<ExtractAtomValue<typeof is12hAtom>>(store, 'settings.is12h'),
    getObjectValue<ExtractAtomValue<typeof timezoneAtom>>(store, 'settings.timezone'),
    getObjectValue<ExtractAtomValue<typeof hideRemovedAtom>>(store, 'settings.hideRemoved'),
    getObjectValue<ExtractAtomValue<typeof showOwnRemovedAtom>>(store, 'settings.showOwnRemoved'),
  ]);

  console.log('Found all previous settings, closing DB + updating atoms');

  database.close();

  const jotaiStore = getDefaultStore();

  if (authentication !== undefined) {
    jotaiStore.set(authenticationAtom, authentication);
  }

  if (hostFormData !== undefined) {
    const { opens: _opens, ...hostData } = hostFormData;

    jotaiStore.set(hostFormDataAtom, hostData);
  }

  if (isDarkMode !== undefined) {
    jotaiStore.set(isDarkModeAtom, isDarkMode);
  }

  if (is12h !== undefined) {
    jotaiStore.set(is12hAtom, is12h);
  }

  if (timezone !== undefined) {
    jotaiStore.set(timezoneAtom, timezone);
  }

  if (hideRemoved !== undefined) {
    jotaiStore.set(hideRemovedAtom, hideRemoved);
  }

  if (showOwnRemoved !== undefined) {
    jotaiStore.set(showOwnRemovedAtom, showOwnRemoved);
  }

  console.log('DB migration complete, deleting database');

  // fully migrated - delete the old db
  await deleteDatabase(DB_NAME);
};
