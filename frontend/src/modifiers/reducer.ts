import { createReducer } from 'typesafe-redux-helpers';

import { Modifier } from './Modifier';
import { CREATE_MODIFIER, DELETE_MODIFIER, FETCH_MODIFIERS } from './actions';
import { CreateModifierError, DeleteModifierError, FetchModifiersError } from './sagas';

export type CreateModifierState = {
  isFetching: boolean;
  error: CreateModifierError | null;
  arguments: string | null;
};

export type DeleteModifierState = {
  isFetching: boolean;
  error: DeleteModifierError | null;
  arguments: number | null;
};

export type ListModifiersState = {
  isFetching: boolean;
  error: FetchModifiersError | null;
  data: Modifier[];
};

export type ModifiersState = {
  create: CreateModifierState;
  delete: DeleteModifierState;
  list: ListModifiersState;
};

const createModifierReducer = createReducer<CreateModifierState>({
  isFetching: false,
  error: null,
  arguments: null,
})
  .handleAction(CREATE_MODIFIER.STARTED, (state, action) => ({
    isFetching: true,
    error: null,
    arguments: action.payload.name,
  }))
  .handleAction(
    CREATE_MODIFIER.COMPLETED,
    () => ({
      isFetching: false,
      error: null,
      arguments: null,
    }),
    (state, action) => ({
      isFetching: false,
      error: action.payload as CreateModifierError,
      arguments: (action.payload as CreateModifierError).modifier,
    }),
  );

const deleteModifierReducer = createReducer<DeleteModifierState>({
  isFetching: false,
  error: null,
  arguments: null,
})
  .handleAction(DELETE_MODIFIER.STARTED, (state, action) => ({
    isFetching: true,
    error: null,
    arguments: action.payload.id,
  }))
  .handleAction(
    DELETE_MODIFIER.COMPLETED,
    () => ({
      isFetching: false,
      error: null,
      arguments: null,
    }),
    (state, action) => ({
      isFetching: false,
      error: action.payload as DeleteModifierError,
      arguments: (action.payload as DeleteModifierError).id,
    }),
  );

const listModifiersReducer = createReducer<ListModifiersState>({
  isFetching: false,
  error: null,
  data: [],
})
  .handleAction(FETCH_MODIFIERS.STARTED, () => ({
    isFetching: true,
    error: null,
    data: [],
  }))
  .handleAction(
    FETCH_MODIFIERS.COMPLETED,
    (state, action) => ({
      isFetching: false,
      error: null,
      data: action.payload.available,
    }),
    (state, action) => ({
      isFetching: false,
      error: action.payload as FetchModifiersError,
      data: [],
    }),
  );

export const reducer = createReducer<ModifiersState>({
  create: {
    isFetching: false,
    error: null,
    arguments: null,
  },
  delete: {
    isFetching: false,
    error: null,
    arguments: null,
  },
  list: {
    isFetching: false,
    error: null,
    data: [],
  },
})
  .forProperty('create', createModifierReducer)
  .forProperty('delete', deleteModifierReducer)
  .forProperty('list', listModifiersReducer);
