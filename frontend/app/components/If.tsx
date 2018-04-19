import * as React from 'react';
import { isFunction } from 'util';
import { pipe, when, ifElse, call, always, equals } from 'ramda';

export type IfProps = {
  readonly condition: boolean | (() => boolean);
  readonly alternative?: React.ComponentType | React.ReactElement<any>;
};

const ifElseFromBool = <U, V>(onTrue: () => U, onFalse: () => V): ((v: boolean) => U | V) =>
  ifElse<boolean, U, V>(equals(true), onTrue, onFalse);

const RenderAlternative: React.SFC<IfProps> = ({ alternative }) => {
  if (!alternative) return null;

  if (React.isValidElement(alternative)) {
    return alternative;
  }

  const Alt = alternative as React.ComponentType;

  return <Alt />;
};

export const If: React.SFC<IfProps> = props =>
  pipe(
    when(isFunction, call),
    ifElseFromBool(
      // if true render children
      always(React.Children.only(props.children)),
      // otherwise render alternative/fallback element
      always(<RenderAlternative {...props} />),
    ),
  )(props.condition);
