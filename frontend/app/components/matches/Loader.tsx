import * as React from 'react';
import { NonIdealState, Spinner } from '@blueprintjs/core';

export type LoaderProps = {
  readonly loading: boolean;
};

export const Loader: React.SFC<LoaderProps> = ({ loading }) => {
  if (!loading)
    return null;

  return <NonIdealState visual={<Spinner/>} title="Loading..."/>;
};

