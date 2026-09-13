import { createReducer } from 'typesafe-redux-helpers';
import { combineReducers, Reducer } from 'redux';

import { HostApplications } from './actions';
import { FetchHostingApplicationError } from './sagas';
import { HostApplication, HostApplicationDetails } from '../models/HostApplication';
import { reducer as quizQuestions } from './questions/reducer';
import { BasicApiCallState, createBasicApiCallReducer, displayError } from '../state/createBasicApiCallReducer';

export type HostApplicationDetailsState = BasicApiCallState<HostApplicationDetails | undefined>;

export type HostApplicationsState = {
  list: BasicApiCallState<Array<HostApplication>>;
  details: Record<number, HostApplicationDetailsState>;
  reviewing: BasicApiCallState<number | undefined>;
  creating: BasicApiCallState<boolean>;
};

const applications: Reducer<HostApplicationsState> = createReducer<HostApplicationsState>({
  list: undefined!,
  details: undefined!,
  reviewing: undefined!,
  creating: undefined!,
})
  .forProperty(
    'list',
    createBasicApiCallReducer<Array<HostApplication>>([])
      .withStartedAction(HostApplications.fetch.list.started, () => [])
      .withCompletedAction(HostApplications.fetch.list.completed, action => action.payload.list)
      .build(),
  )
  .forProperty(
    'details',
    createReducer<HostApplicationsState['details']>({})
      .handleAction(HostApplications.fetch.individual.started, (state, { payload: { id } }) => ({
        ...state,
        [id]: {
          isFetching: true,
          error: null,
          data: undefined,
        },
      }))
      .handleAction(
        HostApplications.fetch.individual.completed,
        (state, { payload: { details } }) => ({
          ...state,
          [details.id]: {
            isFetching: false,
            error: null,
            data: details,
          },
        }),
        (state, { payload }) => ({
          ...state,
          [(payload as FetchHostingApplicationError).id]: {
            isFetching: false,
            error: displayError((payload as FetchHostingApplicationError).cause),
            data: undefined,
          },
        }),
      ),
  )
  .forProperty(
    'reviewing',
    createBasicApiCallReducer<number | undefined>(undefined)
      .withStartedAction(HostApplications.respond.started, ({ payload: { id } }) => id)
      .withCompletedAction(HostApplications.respond.completed, () => undefined)
      .build(),
  )
  .forProperty(
    'creating',
    createBasicApiCallReducer<boolean>(false)
      .withStartedAction(HostApplications.create.started, () => false)
      .withCompletedAction(HostApplications.create.completed, () => true)
      .build()
      .handleAction(HostApplications.create.reset, state => ({ error: null, isFetching: false, data: false })),
  );

export const reducer = combineReducers({
  applications,
  quizQuestions,
});
