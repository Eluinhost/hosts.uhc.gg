declare interface Window {
  __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: (a: object) => Function;
}

declare interface Document {
  hidden?: boolean;
  msHidden?: boolean;
  webkitHidden?: boolean;
}

interface PromiseConstructor {
  all<T1, T2>(values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>]): Promise<[T1, T2]>;
  all<T1, T2, T3>(values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>]): Promise<[T1, T2, T3]>;
  all<T1, T2, T3, T4>(
    values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseList<T4>],
  ): Promise<[T1, T2, T3, T4]>;
}
