import { ActionCreator } from 'react-redux';
import { Action, Reducer } from 'redux-actions';
import { Evolver, evolve, clone } from 'ramda';
import { isFunction } from 'util';

export type EvolveReducerTransformFn<TState, TPayload> = {
  (action: Action<TPayload>, state: TState): Evolver<TState>;
};
export type EvolveReducerTransformObj<TState> = Evolver<TState>;
export type EvolveReducerTransformArg<TState, TPayload> =
  EvolveReducerTransformFn<TState, TPayload> | EvolveReducerTransformObj<TState>;

export class ReducerBuilder<TState> {
  private actions: {
    [action: string]: Reducer<TState, any>;
  } = {};

  private static isTransformerFunction<TState, TPayload>(obj: any): obj is EvolveReducerTransformFn<TState, TPayload> {
    return isFunction(obj);
  }

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

  handleEvolve<TPayload>(
    creator: ActionCreator<Action<TPayload>>,
    transform: EvolveReducerTransformArg<TState, TPayload>,
  ): ReducerBuilder<TState> {
    const fn = ReducerBuilder.isTransformerFunction(transform) ? transform : (action: Action<any>) => transform;

    const reducer: Reducer<TState, TPayload> = (state, action) => {
      return evolve<TState>(fn(action, state), state) as any as TState;
    };

    return this.handle<TPayload>(creator, reducer);
  }

  build(): Reducer<TState, Action<any>> {
    const cloned = clone(this.actions);

    return (state: TState = {} as any, action: Action<any>) => {
      const handler = cloned[action.type];
      return handler ? handler(state, action) : state;
    };
  }
}
