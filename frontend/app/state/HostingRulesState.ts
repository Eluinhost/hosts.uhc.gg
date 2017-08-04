import { Action, createAction } from 'redux-actions';
import { ThunkAction } from 'redux-thunk';
import { ApplicationState } from './ApplicationState';
import {
  BadDataError,
  ForbiddenError,
  getHostingRules,
  NotAuthenticatedError,
  setHostingRules,
} from '../api/index';
import { ReducerBuilder } from './ReducerBuilder';
import { T, F, always } from 'ramda';
import * as moment from 'moment';

export type HostingRules = {
  readonly content: string;
  readonly modified: moment.Moment;
  readonly author: string;
};

export type HostingRulesState = {
  readonly fetching: boolean;
  readonly error: string | null;
  readonly data: HostingRules | null;
  readonly backupData: HostingRules | null;
  readonly editing: boolean;
};

const startGetRulesFetch = createAction('GET_RULES_START_FETCH');
const endGetRulesFetch = createAction<HostingRules>('GET_RULES_END_FETCH');
const getRulesFetchError = createAction<string>('GET_RULES_FETCH_ERROR');

const startSetRulesFetch = createAction<HostingRules>('SET_RULES_START_FETCH');
const endSetRulesFetch = createAction('SET_RULES_END_FETCH');
const setRulesFetchError = createAction<string>('SET_RULES_FETCH_ERROR');

export const HostingRulesActions = {
  openEditor: createAction('OPEN_RULES_EDITOR'),
  closeEditor: createAction('CLOSE_RULES_EDITOR'),
  getRules: (): ThunkAction<Promise<HostingRules>, ApplicationState, {}> =>
    async (dispatch): Promise<HostingRules> => {
      dispatch(startGetRulesFetch());

      try {
        const rules = await getHostingRules();

        dispatch(endGetRulesFetch(rules));
        return rules;
      } catch (err) {
        dispatch(getRulesFetchError('Unexpected response from the server'));

        throw err;
      }
    },
  setRules: (content: string): ThunkAction<Promise<void>, ApplicationState, {}> =>
    async (dispatch, getState): Promise<void> => {
      const authState = getState().authentication;

      if (!authState.loggedIn) {
        dispatch(setRulesFetchError('User is not logged in'));
        throw new Error('User is not logged in');
      }

      const accessToken = authState.data!.rawAccessToken;

      const optimistic: HostingRules = {
        content,
        author: authState.data!.accessTokenClaims.username,
        modified: moment().utc(),
      };

      dispatch(startSetRulesFetch(optimistic));

      try {
        await setHostingRules(content, accessToken);

        dispatch(endSetRulesFetch());
      } catch (err) {
        if (err instanceof BadDataError) {
          dispatch(setRulesFetchError(err.message));
        } else if (err instanceof NotAuthenticatedError) {
          dispatch(setRulesFetchError('You are not logged in'));
        } else if (err instanceof ForbiddenError) {
          dispatch(setRulesFetchError('You do not have permissions to do this'));
        } else {
          dispatch(setRulesFetchError('Unexpected response from the server'));
        }

        throw err;
      }
    },
};

export const reducer = new ReducerBuilder<HostingRulesState>()
  .handleEvolve(startGetRulesFetch, {
    fetching: T,
    error: always(null),
  })
  .handleEvolve(endGetRulesFetch, (action: Action<HostingRules>) => ({
    fetching: F,
    error: always(null),
    data: always(action.payload),
  }))
  .handleEvolve(getRulesFetchError, (action: Action<string>) => ({
    fetching: F,
    error: always(action.payload),
  }))
  .handleEvolve(startSetRulesFetch, (action: Action<HostingRules>, state: HostingRulesState) => ({
    fetching: T,
    error: always(null),
    data: always(action.payload),
    backupData: always(state.data),
  }))
  .handleEvolve(endSetRulesFetch, {
    fetching: F,
    error: always(null),
    backupData: always(null),
  })
  .handleEvolve(setRulesFetchError, (action: Action<string>, state: HostingRulesState) => ({
    fetching: F,
    error: always(action.payload!),
    data: always(state.backupData),
    backupData: always(null),
  }))
  .handleEvolve(HostingRulesActions.openEditor, {
    editing: T,
  })
  .handleEvolve(HostingRulesActions.closeEditor, {
    editing: F,
  })
  .build();

export const initialValues = async (): Promise<HostingRulesState> => ({
  fetching: false,
  error: null,
  data: null,
  backupData: null,
  editing: false,
});
