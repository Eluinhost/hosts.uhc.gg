import { ActionCreator } from 'react-redux';
import { Action, Reducer } from 'redux-actions';
import { clone } from 'ramda';

export class ReducerBuilder<TState> {
  private actions: {
    [action: string]: Reducer<TState, any>;
  } = {};

  handle<TPayload>(
    creator: ActionCreator<Action<TPayload>>,
    reducer: Reducer<TState, TPayload>,
  ): ReducerBuilder<TState> {
    const type = creator.toString();

    if (this.actions[type]) {
      throw new Error (`Already handling an action with type ${type}`);
    }

    this.actions[type] = reducer;

    return this;
  }

  build(): Reducer<TState, Action<any>> {
    const cloned = clone(this.actions);

    return (state: TState = {} as any, action: Action<any>) => {
      const handler = cloned[action.type];
      return handler ? handler(state, action) : state;
    };
  }
}
