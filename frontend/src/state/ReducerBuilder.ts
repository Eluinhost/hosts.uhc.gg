import { ActionCreator, AnyAction} from 'redux';
import { Action, Reducer } from 'redux-actions';
import { clone } from 'ramda';

export type ApplicationReducer<TState> = {
  (state: TState | undefined, action: AnyAction): TState;
  readonly initial: TState;
};

export class ReducerBuilder<TState> {
  static withInitialState<TState>(state: TState): ReducerBuilder<TState> {
    return new ReducerBuilder<TState>(state);
  }

  public readonly initialState: TState;

  private actions: {
    [action: string]: Reducer<TState, any>;
  } = {};

  private constructor(state: TState) {
    this.initialState = state;
  }

  handle<TPayload>(
    creator: ActionCreator<Action<TPayload>>,
    reducer: Reducer<TState, TPayload>,
  ): ReducerBuilder<TState> {
    const type = creator.toString();

    if (this.actions[type]) {
      throw new Error(`Already handling an action with type ${type}`);
    }

    this.actions[type] = reducer;

    return this;
  }

  build(): ApplicationReducer<TState> {
    const cloned = clone(this.actions);

    const reducer = (state: TState = {} as any, action: Action<any>) => {
      const handler = cloned[action.type];
      return handler ? handler(state, action) : state;
    };

    return Object.assign(reducer, { initial: clone(this.initialState) });
  }
}
