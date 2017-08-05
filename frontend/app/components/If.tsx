import * as React from 'react';
import { isFunction } from 'util';
import { pipe, when, ifElse, call, always, equals, Alternative } from 'ramda';

export type IfProps = {
  readonly predicate: boolean | (() => boolean);
  readonly alternative?:  React.ComponentType;
};

const ifElseFromBool = <U,V>(onTrue: () => U, onFalse: () => V): ((v: boolean) => U|V) =>
  ifElse<boolean, U, V>(equals(true), onTrue, onFalse);

const renderAlternative = (Alternative: React.ComponentType = (() => null)) => <Alternative />;

export const If: React.SFC<IfProps> = ({ predicate, children, alternative }) => pipe(
  when(
    isFunction,
    call,
  ),
  ifElseFromBool(
    // if true render children
    always(React.Children.only(children)),
    // otherwise render alternative/fallback element
    always(renderAlternative(alternative)),
  ),
)(predicate);
