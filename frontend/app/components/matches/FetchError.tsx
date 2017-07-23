import * as React from 'react';

export type FetchErrorProps = {
  readonly loading: boolean;
  readonly error: string | null;
};

export const FetchError: React.SFC<FetchErrorProps> = ({ loading, error }) => {
  if (loading || !error)
    return null;

  return <div className="pt-callout pt-intent-danger"><h5>{error}</h5></div>;
};
