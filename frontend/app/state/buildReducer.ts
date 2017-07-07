import { ActionCreator } from 'react-redux';
import { Action, Reducer } from 'redux-actions';

export type builderObject<TState> = {
  readonly handle: <TPayload>(
    creator: ActionCreator<Action<TPayload>>,
    reducer: Reducer<TState, TPayload>,
  ) => builderObject<TState>,
  readonly done: () => Reducer<TState, Action<any>>,
};

export function buildReducer<TState>(): builderObject<TState> {
  const map: {
    [action: string]: Reducer<TState, any>;
  } = {};

  return {
    handle<TPayload>(creator: ActionCreator<Action<TPayload>>, reducer: Reducer<TState, TPayload>) {
      const type = creator.toString();
      if (map[type]) {
        throw new Error (`Already handling an action with type ${type}`);
      }
      map[type] = reducer;
      return this;
    },
    done() {
      const mapClone = { ...map };
      return (state: TState = {} as any, action: Action<any>) => {
        const handler = mapClone[action.type];
        return handler ? handler(state, action) : state;
      };
    },
  };
}
