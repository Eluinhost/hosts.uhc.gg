import { Action, createAction } from 'redux-actions';
import { ThunkAction } from 'redux-thunk';
import { ApplicationState } from './ApplicationState';
import {
  ForbiddenError,
  getApiKey,
  NotAuthenticatedError,
  regenerateApiKey,
  UnexpectedResponseError,
} from '../api/index';
import { ReducerBuilder } from './ReducerBuilder';
import { T, F, always } from 'ramda';
import { getAccessToken, isLoggedIn } from './Selectors';

export type ProfileState = {
  readonly apiKey: {
    readonly fetching: boolean;
    readonly error: string | null;
    readonly key: string | null;
  },
};

const startApiKeyFetch = createAction('API_KEY_START_FETCH');
const endApiKeyFetch = createAction<string | null>('API_KEY_END_FETCH');
const apiKeyFetchError = createAction<string>('API_KEY_FETCH_ERROR');

export const ProfileActions = {
  getApiKey: (): ThunkAction<Promise<string | null>, ApplicationState, {}> =>
    async (dispatch, getState): Promise<string | null> => {
      const state = getState();

      if (!isLoggedIn(state)) {
        dispatch(apiKeyFetchError('User is not logged in'));
        throw new Error('User is not logged in');
      }

      const accessToken = getAccessToken(state);

      dispatch(startApiKeyFetch());

      try {
        const currentKey = await getApiKey(accessToken || 'ERROR NO ACCESS TOKEN IN STATE');

        dispatch(endApiKeyFetch(currentKey));
        return currentKey;
      } catch (err) {
        if (err instanceof NotAuthenticatedError)
          dispatch(apiKeyFetchError('You are not logged in'));

        if (err instanceof ForbiddenError)
          dispatch(apiKeyFetchError('You do not have permissions to do this'));

        if (err instanceof UnexpectedResponseError)
          dispatch(apiKeyFetchError('Uexpected response from the server'));

        dispatch(apiKeyFetchError('Unable to fetch list from server'));

        throw err;
      }
    },
  regenerateApiKey: (): ThunkAction<Promise<string>, ApplicationState, {}> =>
    async (dispatch, getState): Promise<string> => {
      const state = getState();

      if (!isLoggedIn(state)) {
        dispatch(apiKeyFetchError('User is not logged in'));
        throw new Error('User is not logged in');
      }

      const accessToken = getAccessToken(state);

      dispatch(startApiKeyFetch());

      try {
        const newKey = await regenerateApiKey(accessToken || 'ERROR NO ACCESS TOKEN IN STATE');

        dispatch(endApiKeyFetch(newKey));

        return newKey;
      } catch (err) {
        if (err instanceof NotAuthenticatedError)
          dispatch(apiKeyFetchError('You are not logged in'));

        if (err instanceof ForbiddenError)
          dispatch(apiKeyFetchError('You do not have permissions to do this'));

        if (err instanceof UnexpectedResponseError)
          dispatch(apiKeyFetchError('Uexpected response from the server'));

        dispatch(apiKeyFetchError('Unable to fetch list from server'));

        throw err;
      }
    },
};

export const reducer = new ReducerBuilder<ProfileState>()
  .handleEvolve(startApiKeyFetch, () => ({
    apiKey: {
      fetching: T,
      error: always(null),
    },
  }))
  .handleEvolve(endApiKeyFetch, (action: Action<string | null>) => ({
    apiKey: {
      fetching: F,
      error: always(null),
      key: always(action.payload),
    },
  }))
  .handleEvolve(apiKeyFetchError, (action: Action<string>) => ({
    apiKey: {
      fetching: F,
      error: always(action.payload),
    },
  }))
  .build();

export const initialValues = async (): Promise<ProfileState> => ({
  apiKey: {
    fetching: false,
    error: null,
    key: null,
  },
});
